import express from 'express';
import { supabase } from '../config/database.js';
import { generateUUID } from '../utils/helpers.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all gallery images (public)
router.get('/', async (req, res) => {
  try {
    const { data: images, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(images);
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({ error: 'Failed to fetch gallery images' });
  }
});

// Get gallery image by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: image, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json(image);
  } catch (error) {
    console.error('Get gallery image error:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

// Add gallery image (Admin)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, image_url, category } = req.body;

    if (!image_url) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const imageData = {
      id: generateUUID(),
      title: title || '',
      description: description || '',
      image_url,
      category: category || 'general',
      status: 'published',
      created_by: req.user.id,
      created_at: new Date().toISOString()
    };

    const { data: image, error } = await supabase
      .from('gallery')
      .insert([imageData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(image);
  } catch (error) {
    console.error('Add gallery image error:', error);
    res.status(500).json({ error: 'Failed to add image' });
  }
});

// Update gallery image (Admin)
router.patch('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image_url, category, status } = req.body;

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (image_url) updateData.image_url = image_url;
    if (category) updateData.category = category;
    if (status) updateData.status = status;

    const { data: image, error } = await supabase
      .from('gallery')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(image);
  } catch (error) {
    console.error('Update gallery image error:', error);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

// Delete gallery image (Admin)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('gallery')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete gallery image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

export default router;
