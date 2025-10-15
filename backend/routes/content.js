import express from 'express';
import { supabase } from '../config/database.js';
import { generateUUID } from '../utils/helpers.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get content by type (public)
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;

    const { data: content, error } = await supabase
      .from('content')
      .select('*')
      .eq('type', type)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(content);
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Get single content item (public)
router.get('/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;

    const { data: content, error } = await supabase
      .from('content')
      .select('*')
      .eq('type', type)
      .eq('id', id)
      .single();

    if (error || !content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json(content);
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Create content (Admin)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { type, title, content, excerpt, image_url, metadata } = req.body;

    if (!type || !title) {
      return res.status(400).json({ error: 'Type and title are required' });
    }

    const contentData = {
      id: generateUUID(),
      type,
      title,
      content: content || '',
      excerpt: excerpt || '',
      image_url: image_url || '',
      metadata: metadata || {},
      status: 'published',
      created_by: req.user.id,
      created_at: new Date().toISOString()
    };

    const { data: newContent, error } = await supabase
      .from('content')
      .insert([contentData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(newContent);
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ error: 'Failed to create content' });
  }
});

// Update content (Admin)
router.patch('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, image_url, metadata, status } = req.body;

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (title) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (metadata) updateData.metadata = metadata;
    if (status) updateData.status = status;

    const { data: updatedContent, error } = await supabase
      .from('content')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(updatedContent);
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ error: 'Failed to update content' });
  }
});

// Delete content (Admin)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

export default router;
