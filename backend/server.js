import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase, initializeDatabase } from './config/database.js';
import { hashPassword, generateUUID } from './utils/helpers.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import volunteerRoutes from './routes/volunteers.js';
import taskRoutes from './routes/tasks.js';
import eventRoutes from './routes/events.js';
import contentRoutes from './routes/content.js';
import urgentNeedsRoutes from './routes/urgentNeeds.js';
import galleryRoutes from './routes/gallery.js';
import volunteerHoursRoutes from './routes/volunteerHours.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Suryoday NGO Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/urgent-needs', urgentNeedsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/volunteer-hours', volunteerHoursRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize Super Admin on first run
async function initializeSuperAdmin() {
  try {
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@suryoday.org';
    
    // Check if super admin exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', superAdminEmail)
      .single();

    if (!existing) {
      console.log('🔧 Creating Super Admin account...');
      
      const hashedPassword = await hashPassword(process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123');
      
      const superAdmin = {
        id: generateUUID(),
        name: process.env.SUPER_ADMIN_NAME || 'Super Administrator',
        email: superAdminEmail,
        password: hashedPassword,
        role: 'super_admin',
        status: 'active',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('users')
        .insert([superAdmin]);

      if (error) {
        console.error('❌ Failed to create Super Admin:', error.message);
      } else {
        console.log('✅ Super Admin account created successfully');
        console.log(`   Email: ${superAdminEmail}`);
        console.log(`   Password: ${process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123'}`);
        console.log('   ⚠️  Please change the password after first login!');
      }
    } else {
      console.log('✅ Super Admin account already exists');
    }
  } catch (error) {
    console.error('❌ Super Admin initialization error:', error.message);
  }
}

// Start server
async function startServer() {
  try {
    console.log('\n🚀 Starting Suryoday NGO Backend...');
    console.log('================================');

    // Initialize database
    await initializeDatabase();

    // Initialize Super Admin
    await initializeSuperAdmin();

    app.listen(PORT, '0.0.0.0', () => {
      console.log('\n================================');
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`🌐 API: http://localhost:${PORT}/api`);
      console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
      console.log('================================\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
