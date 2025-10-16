import express from 'express';
import { supabase } from '../config/database.js';
import { hashPassword, sanitizeUser, generateUUID, generateRandomPassword } from '../utils/helpers.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
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

// Create new user (Admin and Super Admin)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }

    // Only Super Admin can create other admins or super admins
    if (role === 'admin' || role === 'super_admin') {
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Only Super Admin can create admin accounts' });
      }
    }

    if (!['admin', 'volunteer', 'super_admin'].includes(role)) {
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

// Update user role (Admin and Super Admin, but only Super Admin can modify admin roles)
router.patch('/:id/role', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['super_admin', 'admin', 'volunteer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Get the target user
    const { data: targetUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', id)
      .single();

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent changing Super Admin role
    if (targetUser.role === 'super_admin') {
      return res.status(403).json({ error: 'Cannot modify Super Admin role' });
    }

    // Only Super Admin can change admin roles
    if ((targetUser.role === 'admin' || role === 'admin' || role === 'super_admin') && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only Super Admin can modify admin roles' });
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

// Update user status (Admin and Super Admin, but cannot deactivate Super Admin)
router.patch('/:id/status', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get the target user
    const { data: targetUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', id)
      .single();

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deactivating Super Admin
    if (targetUser.role === 'super_admin') {
      return res.status(403).json({ error: 'Cannot deactivate Super Admin account' });
    }

    // Only Super Admin can deactivate other admins
    if (targetUser.role === 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only Super Admin can modify admin status' });
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

// Delete user (Admin and Super Admin, but cannot delete Super Admin)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get the target user
    const { data: targetUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', id)
      .single();

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting Super Admin
    if (targetUser.role === 'super_admin') {
      return res.status(403).json({ error: 'Cannot delete Super Admin account' });
    }

    // Only Super Admin can delete other admins
    if (targetUser.role === 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only Super Admin can delete admin accounts' });
    }

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
