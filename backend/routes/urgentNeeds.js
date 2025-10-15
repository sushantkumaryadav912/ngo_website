import express from 'express';
import { supabase } from '../config/database.js';
import { generateUUID } from '../utils/helpers.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all urgent needs (public)
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;

    let query = supabase
      .from('urgent_needs')
      .select('*')
      .order('created_at', { ascending: false });

    if (active === 'true') {
      query = query.eq('is_active', true);
    }

    const { data: needs, error } = await query;

    if (error) throw error;

    res.json(needs);
  } catch (error) {
    console.error('Get urgent needs error:', error);
    res.status(500).json({ error: 'Failed to fetch urgent needs' });
  }
});

// Get urgent need by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: need, error } = await supabase
      .from('urgent_needs')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !need) {
      return res.status(404).json({ error: 'Urgent need not found' });
    }

    res.json(need);
  } catch (error) {
    console.error('Get urgent need error:', error);
    res.status(500).json({ error: 'Failed to fetch urgent need' });
  }
});

// Create urgent need (Admin)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, target_amount, category, end_date } = req.body;

    if (!title || !target_amount) {
      return res.status(400).json({ error: 'Title and target amount are required' });
    }

    const needData = {
      id: generateUUID(),
      title,
      description: description || '',
      target_amount: parseFloat(target_amount),
      raised_amount: 0,
      category: category || 'general',
      end_date: end_date || null,
      is_urgent: true,
      is_active: true,
      created_by: req.user.id,
      created_at: new Date().toISOString()
    };

    const { data: need, error } = await supabase
      .from('urgent_needs')
      .insert([needData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(need);
  } catch (error) {
    console.error('Create urgent need error:', error);
    res.status(500).json({ error: 'Failed to create urgent need' });
  }
});

// Update urgent need (Admin)
router.patch('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, target_amount, raised_amount, category, end_date, is_urgent, is_active } = req.body;

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (target_amount) updateData.target_amount = parseFloat(target_amount);
    if (raised_amount !== undefined) updateData.raised_amount = parseFloat(raised_amount);
    if (category) updateData.category = category;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (is_urgent !== undefined) updateData.is_urgent = is_urgent;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: need, error } = await supabase
      .from('urgent_needs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(need);
  } catch (error) {
    console.error('Update urgent need error:', error);
    res.status(500).json({ error: 'Failed to update urgent need' });
  }
});

// Update raised amount (Admin - for tracking donations)
router.patch('/:id/donation', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Get current raised amount
    const { data: need } = await supabase
      .from('urgent_needs')
      .select('raised_amount')
      .eq('id', id)
      .single();

    if (!need) {
      return res.status(404).json({ error: 'Urgent need not found' });
    }

    const newRaisedAmount = (need.raised_amount || 0) + parseFloat(amount);

    const { data: updatedNeed, error } = await supabase
      .from('urgent_needs')
      .update({ 
        raised_amount: newRaisedAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(updatedNeed);
  } catch (error) {
    console.error('Update donation error:', error);
    res.status(500).json({ error: 'Failed to update donation amount' });
  }
});

// Delete urgent need (Admin)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('urgent_needs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Urgent need deleted successfully' });
  } catch (error) {
    console.error('Delete urgent need error:', error);
    res.status(500).json({ error: 'Failed to delete urgent need' });
  }
});

export default router;
