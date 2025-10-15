# Suryoday Old Age Home - Backend API

Backend server for the Suryoday Old Age Home NGO website built with Node.js, Express, and Supabase.

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
yarn install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

Required environment variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_KEY`: Your Supabase service role key (for admin operations)
- `JWT_SECRET`: Secret key for JWT tokens (generate a random string)
- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASSWORD`: Your Gmail app password (not your regular password)

### 3. Set Up Database Schema
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `database-schema.sql`
4. Run the SQL script to create all tables

### 4. Configure Gmail for Emails
To use Gmail SMTP:
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account Settings → Security → 2-Step Verification → App passwords
   - Create a new app password for "Mail"
   - Use this password in `EMAIL_PASSWORD` in .env

### 5. Start the Server
```bash
yarn start
# or for development with auto-restart
yarn dev
```

The server will start on `http://localhost:8001`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

### User Management (Super Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PATCH /api/users/:id/role` - Update user role
- `PATCH /api/users/:id/status` - Update user status
- `DELETE /api/users/:id` - Delete user

### Volunteers
- `POST /api/volunteers/apply` - Submit volunteer application (public)
- `GET /api/volunteers` - Get all applications (Admin)
- `GET /api/volunteers/:id` - Get application by ID (Admin)
- `PATCH /api/volunteers/:id/approve` - Approve application (Admin)
- `PATCH /api/volunteers/:id/reject` - Reject application (Admin)
- `GET /api/volunteers/stats/overview` - Get statistics (Admin)

### Tasks
- `POST /api/tasks` - Create task (Admin)
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `PATCH /api/tasks/:id/status` - Update task status
- `PATCH /api/tasks/:id` - Update task (Admin)
- `DELETE /api/tasks/:id` - Delete task (Admin)
- `GET /api/tasks/stats/overview` - Get task statistics

### Events
- `GET /api/events` - Get all events (public)
- `GET /api/events/:id` - Get event by ID (public)
- `POST /api/events` - Create event (Admin)
- `PATCH /api/events/:id` - Update event (Admin)
- `DELETE /api/events/:id` - Delete event (Admin)

### Content (News, Testimonials, etc.)
- `GET /api/content/:type` - Get content by type (public)
- `GET /api/content/:type/:id` - Get single content item (public)
- `POST /api/content` - Create content (Admin)
- `PATCH /api/content/:id` - Update content (Admin)
- `DELETE /api/content/:id` - Delete content (Admin)

### Urgent Needs
- `GET /api/urgent-needs` - Get all urgent needs (public)
- `GET /api/urgent-needs/:id` - Get urgent need by ID (public)
- `POST /api/urgent-needs` - Create urgent need (Admin)
- `PATCH /api/urgent-needs/:id` - Update urgent need (Admin)
- `PATCH /api/urgent-needs/:id/donation` - Update raised amount (Admin)
- `DELETE /api/urgent-needs/:id` - Delete urgent need (Admin)

### Gallery
- `GET /api/gallery` - Get all gallery images (public)
- `GET /api/gallery/:id` - Get image by ID (public)
- `POST /api/gallery` - Add image (Admin)
- `PATCH /api/gallery/:id` - Update image (Admin)
- `DELETE /api/gallery/:id` - Delete image (Admin)

### Volunteer Hours
- `POST /api/volunteer-hours` - Log hours (Volunteer)
- `GET /api/volunteer-hours` - Get volunteer hours
- `GET /api/volunteer-hours/total/:volunteer_id` - Get total hours
- `PATCH /api/volunteer-hours/:id/status` - Approve/reject hours (Admin)
- `PATCH /api/volunteer-hours/:id` - Update hours
- `DELETE /api/volunteer-hours/:id` - Delete hours log (Admin)

## User Roles

### Super Admin
- **Same permissions as Admin** (full access to all features)
- **Protected account**: Cannot be deleted or modified
- **User Management**: Can create, modify, and delete Admin accounts
- Fixed account created on first server run
- The only role that can manage other admin accounts

### Admin
- Full access to all NGO management features:
  - Approve/reject volunteer applications
  - Create and assign tasks
  - Manage content, events, urgent needs, gallery
  - Review volunteer hours
  - Manage volunteers
- **Can be created/deleted by Super Admin only**
- **Role can be changed by Super Admin**
- Cannot manage other admin accounts

### Volunteer
- Can view and update assigned tasks
- Can log volunteer hours
- Can view events
- Can update their own profile
- Limited to volunteer-specific features

## Initial Super Admin Account

On first run, a Super Admin account is automatically created:
- Email: Set in `SUPER_ADMIN_EMAIL` (default: superadmin@suryoday.org)
- Password: Set in `SUPER_ADMIN_PASSWORD` (default: SuperAdmin@123)

**⚠️ Please change the password immediately after first login!**

## Email Notifications

The system sends emails for:
- Volunteer application approval/rejection
- Task assignments
- Welcome emails for new users

Make sure to configure Gmail SMTP properly in `.env` file.

## Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Input validation
- SQL injection prevention (Supabase)
- CORS enabled

## Development

```bash
# Install dependencies
yarn install

# Run in development mode (auto-restart on changes)
yarn dev

# Run in production mode
yarn start
```

## Production Deployment

### Render (Free Tier)
1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Deploy!

### Environment Variables to Set in Render:
All variables from `.env.example`

## Support

For issues or questions, contact the development team.
