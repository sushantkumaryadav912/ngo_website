import express from 'express';
import { supabase } from '../config/database.js';
import { generateUUID } from '../utils/helpers.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all events (public)
router.get('/', async (req, res) => {
  try {
    const { upcoming } = req.query;

    let query = supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('event_date', { ascending: true });

    if (upcoming === 'true') {
      query = query.gte('event_date', new Date().toISOString());
    }

    const { data: events, error } = await query;

    if (error) throw error;

    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get event by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create event (Admin)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, event_date, location, image_url, category, max_volunteers } = req.body;

    if (!title || !event_date) {
      return res.status(400).json({ error: 'Title and event date are required' });
    }

    const eventData = {
      id: generateUUID(),
      title,
      description: description || '',
      event_date,
      location: location || '',
      image_url: image_url || '',
      category: category || 'general',
      max_volunteers: max_volunteers || null,
      status: 'published',
      created_by: req.user.id,
      created_at: new Date().toISOString()
    };

    const { data: event, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event (Admin)
router.patch('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, event_date, location, image_url, category, max_volunteers, status } = req.body;

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (event_date) updateData.event_date = event_date;
    if (location !== undefined) updateData.location = location;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (category) updateData.category = category;
    if (max_volunteers !== undefined) updateData.max_volunteers = max_volunteers;
    if (status) updateData.status = status;

    const { data: event, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event (Admin)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;
