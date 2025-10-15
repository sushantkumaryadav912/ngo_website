import express from 'express';
import { supabase } from '../config/database.js';
import { generateUUID } from '../utils/helpers.js';
import { verifyToken, requireVolunteer, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Log volunteer hours (Volunteer)
router.post('/', verifyToken, requireVolunteer, async (req, res) => {
  try {
    const { date, hours, activity, description } = req.body;

    if (!date || !hours || !activity) {
      return res.status(400).json({ error: 'Date, hours, and activity are required' });
    }

    if (hours <= 0 || hours > 24) {
      return res.status(400).json({ error: 'Hours must be between 0 and 24' });
    }

    const hoursData = {
      id: generateUUID(),
      volunteer_id: req.user.id,
      date,
      hours: parseFloat(hours),
      activity,
      description: description || '',
      status: req.user.role === 'volunteer' ? 'pending' : 'approved',
      created_at: new Date().toISOString()
    };

    const { data: loggedHours, error } = await supabase
      .from('volunteer_hours')
      .insert([hoursData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(loggedHours);
  } catch (error) {
    console.error('Log hours error:', error);
    res.status(500).json({ error: 'Failed to log hours' });
  }
});

// Get volunteer hours
router.get('/', verifyToken, requireVolunteer, async (req, res) => {
  try {
    const { volunteer_id, status } = req.query;

    let query = supabase
      .from('volunteer_hours')
      .select(`
        *,
        volunteer:users!volunteer_hours_volunteer_id_fkey(id, name, email)
      `)
      .order('date', { ascending: false });

    // Volunteers can only see their own hours
    if (req.user.role === 'volunteer') {
      query = query.eq('volunteer_id', req.user.id);
    } else if (volunteer_id) {
      query = query.eq('volunteer_id', volunteer_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: hours, error } = await query;

    if (error) throw error;

    res.json(hours);
  } catch (error) {
    console.error('Get hours error:', error);
    res.status(500).json({ error: 'Failed to fetch volunteer hours' });
  }
});

// Get total hours for a volunteer
router.get('/total/:volunteer_id', verifyToken, requireVolunteer, async (req, res) => {
  try {
    const { volunteer_id } = req.params;

    // Volunteers can only see their own stats
    if (req.user.role === 'volunteer' && volunteer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: hours } = await supabase
      .from('volunteer_hours')
      .select('hours, status')
      .eq('volunteer_id', volunteer_id);

    const stats = {
      total_hours: hours.reduce((sum, h) => sum + (h.hours || 0), 0),
      approved_hours: hours.filter(h => h.status === 'approved').reduce((sum, h) => sum + (h.hours || 0), 0),
      pending_hours: hours.filter(h => h.status === 'pending').reduce((sum, h) => sum + (h.hours || 0), 0),
      total_logs: hours.length
    };

    res.json(stats);
  } catch (error) {
    console.error('Get total hours error:', error);
    res.status(500).json({ error: 'Failed to fetch total hours' });
  }
});

// Approve/reject volunteer hours (Admin)
router.patch('/:id/status', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData = {
      status,
      admin_notes: admin_notes || '',
      reviewed_by: req.user.id,
      reviewed_at: new Date().toISOString()
    };

    const { data: hours, error } = await supabase
      .from('volunteer_hours')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(hours);
  } catch (error) {
    console.error('Update hours status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Update volunteer hours (Volunteer - only their own pending hours)
router.patch('/:id', verifyToken, requireVolunteer, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, hours, activity, description } = req.body;

    // Get the hours log
    const { data: hoursLog } = await supabase
      .from('volunteer_hours')
      .select('volunteer_id, status')
      .eq('id', id)
      .single();

    if (!hoursLog) {
      return res.status(404).json({ error: 'Hours log not found' });
    }

    // Volunteers can only edit their own pending hours
    if (req.user.role === 'volunteer') {
      if (hoursLog.volunteer_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      if (hoursLog.status !== 'pending') {
        return res.status(400).json({ error: 'Cannot edit approved/rejected hours' });
      }
    }

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (date) updateData.date = date;
    if (hours) updateData.hours = parseFloat(hours);
    if (activity) updateData.activity = activity;
    if (description !== undefined) updateData.description = description;

    const { data: updatedHours, error } = await supabase
      .from('volunteer_hours')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(updatedHours);
  } catch (error) {
    console.error('Update hours error:', error);
    res.status(500).json({ error: 'Failed to update hours' });
  }
});

// Delete volunteer hours (Admin)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('volunteer_hours')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Hours log deleted successfully' });
  } catch (error) {
    console.error('Delete hours error:', error);
    res.status(500).json({ error: 'Failed to delete hours log' });
  }
});

export default router;
