import express from 'express';
import { supabase } from '../config/database.js';
import { generateUUID, formatDate } from '../utils/helpers.js';
import { verifyToken, requireAdmin, requireVolunteer } from '../middleware/auth.js';
import { sendEmail, emailTemplates } from '../config/email.js';

const router = express.Router();

// Create task (Admin)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, assigned_to, due_date, priority, category } = req.body;

    if (!title || !assigned_to || !due_date) {
      return res.status(400).json({ error: 'Title, assigned volunteer, and due date are required' });
    }

    const taskData = {
      id: generateUUID(),
      title,
      description: description || '',
      assigned_to,
      assigned_by: req.user.id,
      due_date,
      priority: priority || 'medium',
      category: category || 'general',
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const { data: task, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();

    if (error) throw error;

    // Get volunteer details for email
    const { data: volunteer } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', assigned_to)
      .single();

    if (volunteer) {
      // Send task assignment email
      await sendEmail(
        volunteer.email,
        emailTemplates.taskAssigned(
          volunteer.name,
          title,
          description || 'No additional details provided',
          formatDate(due_date)
        )
      );
    }

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Get all tasks (Admin)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, assigned_to } = req.query;

    let query = supabase
      .from('tasks')
      .select(`
        *,
        assigned_user:users!tasks_assigned_to_fkey(id, name, email),
        assigner:users!tasks_assigned_by_fkey(id, name)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (assigned_to) {
      query = query.eq('assigned_to', assigned_to);
    }

    // If volunteer, only show their tasks
    if (req.user.role === 'volunteer') {
      query = query.eq('assigned_to', req.user.id);
    }

    const { data: tasks, error } = await query;

    if (error) throw error;

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get task by ID
router.get('/:id', verifyToken, requireVolunteer, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: task, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_user:users!tasks_assigned_to_fkey(id, name, email),
        assigner:users!tasks_assigned_by_fkey(id, name)
      `)
      .eq('id', id)
      .single();

    if (error || !task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Volunteers can only see their own tasks
    if (req.user.role === 'volunteer' && task.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Update task status (Volunteer can update their own tasks)
router.patch('/:id/status', verifyToken, requireVolunteer, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get task
    const { data: task } = await supabase
      .from('tasks')
      .select('assigned_to')
      .eq('id', id)
      .single();

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Volunteers can only update their own tasks
    if (req.user.role === 'volunteer' && task.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own tasks' });
    }

    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    if (notes) {
      updateData.notes = notes;
    }

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

// Update task (Admin)
router.patch('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, assigned_to, due_date, priority, category, status } = req.body;

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (assigned_to) updateData.assigned_to = assigned_to;
    if (due_date) updateData.due_date = due_date;
    if (priority) updateData.priority = priority;
    if (category) updateData.category = category;
    if (status) updateData.status = status;

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task (Admin)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Get task statistics
router.get('/stats/overview', verifyToken, async (req, res) => {
  try {
    let query = supabase.from('tasks').select('status, priority');

    // If volunteer, only their tasks
    if (req.user.role === 'volunteer') {
      query = query.eq('assigned_to', req.user.id);
    }

    const { data: tasks } = await query;

    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      high_priority: tasks.filter(t => t.priority === 'high').length
    };

    res.json(stats);
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({ error: 'Failed to fetch task statistics' });
  }
});

export default router;
