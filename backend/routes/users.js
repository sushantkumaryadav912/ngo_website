import express from 'express';
import { supabase } from '../config/database.js';
import { hashPassword, generateToken, sanitizeUser, generateUUID, generateRandomPassword } from '../utils/helpers.js';
import { verifyToken, requireSuperAdmin, requireAdmin } from '../middleware/auth.js';
import { sendEmail, emailTemplates } from '../config/email.js';

const router = express.Router();

// Get all users (Admin and Super Admin)
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const sanitizedUsers = users.map(user => sanitizeUser(user));
    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create new user (Super Admin only)
router.post('/', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }

    if (!['admin', 'volunteer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Generate temporary password
    const tempPassword = generateRandomPassword();
    const hashedPassword = await hashPassword(tempPassword);

    // Create user
    const newUser = {
      id: generateUUID(),
      name,
      email,
      password: hashedPassword,
      role,
      status: 'active',
      created_at: new Date().toISOString(),
      created_by: req.user.id
    };

    const { data: user, error } = await supabase
      .from('users')
      .insert([newUser])
      .select()
      .single();

    if (error) throw error;

    // Send welcome email with credentials
    await sendEmail(email, emailTemplates.welcomeEmail(name, email, tempPassword, role));

    res.status(201).json({
      user: sanitizeUser(user),
      tempPassword // Send in response for admin to share
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user role (Super Admin only)
router.patch('/:id/role', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['super_admin', 'admin', 'volunteer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Prevent changing own role
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(sanitizeUser(user));
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Update user status (Super Admin only)
router.patch('/:id/status', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Prevent deactivating own account
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(sanitizeUser(user));
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Delete user (Super Admin only)
router.delete('/:id', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting own account
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
