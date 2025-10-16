import express from 'express';
import { supabase } from '../config/database.js';
import { generateUUID, hashPassword } from '../utils/helpers.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { sendEmail, emailTemplates } from '../config/email.js';

const router = express.Router();

// Submit volunteer application (public)
router.post('/apply', async (req, res) => {
  try {
    const { name, email, phone, age, skills, availability, experience, motivation, emergencyContact } = req.body;

    if (!name || !email || !phone || !age || !motivation) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    // Check if already applied
    const { data: existing } = await supabase
      .from('volunteers')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'You have already submitted an application' });
    }

    const volunteerData = {
      id: generateUUID(),
      name,
      email,
      phone,
      age,
      skills: skills || [],
      availability: availability || {},
      experience: experience || '',
      motivation,
      emergency_contact: emergencyContact || {},
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const { data: volunteer, error } = await supabase
      .from('volunteers')
      .insert([volunteerData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Application submitted successfully', volunteer });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Get all volunteer applications (Admin)
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase.from('volunteers').select('*').order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: volunteers, error } = await query;

    if (error) throw error;

    res.json(volunteers);
  } catch (error) {
    console.error('Get volunteers error:', error);
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
});

// Get volunteer by ID
router.get('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: volunteer, error } = await supabase
      .from('volunteers')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    res.json(volunteer);
  } catch (error) {
    console.error('Get volunteer error:', error);
    res.status(500).json({ error: 'Failed to fetch volunteer' });
  }
});

// Approve volunteer application (Admin)
router.patch('/:id/approve', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get volunteer data
    const { data: volunteer } = await supabase
      .from('volunteers')
      .select('*')
      .eq('id', id)
      .single();

    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    // Update volunteer status
    const { error: updateError } = await supabase
      .from('volunteers')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: req.user.id
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // Create user account for the volunteer
    const tempPassword = 'Welcome@123'; // They can change it later
    const hashedPassword = await hashPassword(tempPassword);

    const userData = {
      id: generateUUID(),
      name: volunteer.name,
      email: volunteer.email,
      password: hashedPassword,
      role: 'volunteer',
      status: 'active',
      volunteer_id: id,
      created_at: new Date().toISOString(),
      created_by: req.user.id
    };

    const { error: userError } = await supabase
      .from('users')
      .insert([userData]);

    if (userError && userError.code !== '23505') { // Ignore duplicate email error
      console.error('User creation error:', userError);
    }

    // Send approval email
    await sendEmail(volunteer.email, emailTemplates.volunteerApproved(volunteer.name));

    res.json({ message: 'Volunteer approved successfully' });
  } catch (error) {
    console.error('Approve volunteer error:', error);
    res.status(500).json({ error: 'Failed to approve volunteer' });
  }
});

// Reject volunteer application (Admin)
router.patch('/:id/reject', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Get volunteer data
    const { data: volunteer } = await supabase
      .from('volunteers')
      .select('*')
      .eq('id', id)
      .single();

    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    // Update volunteer status
    const { error } = await supabase
      .from('volunteers')
      .update({ 
        status: 'rejected',
        rejection_reason: reason || '',
        rejected_at: new Date().toISOString(),
        rejected_by: req.user.id
      })
      .eq('id', id);

    if (error) throw error;

    // Send rejection email
    await sendEmail(volunteer.email, emailTemplates.volunteerRejected(volunteer.name));

    res.json({ message: 'Volunteer application rejected' });
  } catch (error) {
    console.error('Reject volunteer error:', error);
    res.status(500).json({ error: 'Failed to reject volunteer' });
  }
});

// Update volunteer details (Admin)
router.patch('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, age, skills, availability, experience, motivation, emergency_contact, status } = req.body;

    const { data: volunteerExists } = await supabase
      .from('volunteers')
      .select('id, email')
      .eq('id', id)
      .single();

    if (!volunteerExists) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (age !== undefined) updateData.age = age;
    if (skills !== undefined) updateData.skills = skills;
    if (availability !== undefined) updateData.availability = availability;
    if (experience !== undefined) updateData.experience = experience;
    if (motivation !== undefined) updateData.motivation = motivation;
    if (emergency_contact !== undefined) updateData.emergency_contact = emergency_contact;
    if (status !== undefined) updateData.status = status;

    if (email && email !== volunteerExists.email) {
      const { data: duplicate } = await supabase
        .from('volunteers')
        .select('id')
        .eq('email', email)
        .neq('id', id)
        .maybeSingle();

      if (duplicate) {
        return res.status(400).json({ error: 'Email already in use by another volunteer' });
      }
    }

    const { data: updatedVolunteer, error } = await supabase
      .from('volunteers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Keep linked user (if any) in sync
    const { data: linkedUser } = await supabase
      .from('users')
      .select('id')
      .eq('volunteer_id', id)
      .maybeSingle();

    if (linkedUser) {
      const userUpdate = {};

      if (name !== undefined) userUpdate.name = name;
      if (email !== undefined) userUpdate.email = email;

      if (status !== undefined) {
        if (['approved', 'active'].includes(status)) {
          userUpdate.status = 'active';
        } else if (['rejected', 'inactive'].includes(status)) {
          userUpdate.status = 'inactive';
        }
      }

      if (Object.keys(userUpdate).length > 0) {
        userUpdate.updated_at = new Date().toISOString();

        const { error: userUpdateError } = await supabase
          .from('users')
          .update(userUpdate)
          .eq('id', linkedUser.id);

        if (userUpdateError) {
          console.error('Linked user sync error:', userUpdateError);
        }
      }
    }

    res.json(updatedVolunteer);
  } catch (error) {
    console.error('Update volunteer error:', error);
    res.status(500).json({ error: 'Failed to update volunteer' });
  }
});

// Delete volunteer (Admin)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: volunteer } = await supabase
      .from('volunteers')
      .select('id')
      .eq('id', id)
      .single();

    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    const { error: userDeleteError } = await supabase
      .from('users')
      .delete()
      .eq('volunteer_id', id);

    if (userDeleteError) {
      console.error('Linked user delete error:', userDeleteError);
    }

    const { error } = await supabase
      .from('volunteers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Volunteer deleted successfully' });
  } catch (error) {
    console.error('Delete volunteer error:', error);
    res.status(500).json({ error: 'Failed to delete volunteer' });
  }
});

// Get volunteer statistics (Admin)
router.get('/stats/overview', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data: volunteers } = await supabase
      .from('volunteers')
      .select('status');

    const stats = {
      total: volunteers.length,
      pending: volunteers.filter(v => v.status === 'pending').length,
      approved: volunteers.filter(v => v.status === 'approved').length,
      rejected: volunteers.filter(v => v.status === 'rejected').length,
      active: volunteers.filter(v => v.status === 'active').length
    };

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
