# 🏥 Suryoday Old Age Home - Complete Setup Guide

## 📋 Project Overview

A complete NGO management system with:
- **Backend**: Node.js + Express + Supabase
- **Frontend**: React + Vite + Tailwind CSS
- **Features**: Volunteer management, task assignment, content management, donation tracking

---

## 🚀 Quick Start

### 1. Backend Setup

#### Install Dependencies
```bash
cd /app/backend
yarn install
```

#### Configure Environment Variables
1. Copy the example file:
```bash
cp .env.example .env
```

2. Edit `/app/backend/.env` with your credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

# Gmail SMTP (for email notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Server
PORT=8001
NODE_ENV=development

# Super Admin (created automatically on first run)
SUPER_ADMIN_EMAIL=superadmin@suryoday.org
SUPER_ADMIN_PASSWORD=SuperAdmin@123
SUPER_ADMIN_NAME=Super Administrator
```

#### Set Up Supabase Database

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `/app/backend/database-schema.sql`
4. Paste and **Run** the SQL script
5. Verify tables are created in **Table Editor**

#### Configure Gmail SMTP

To send emails via Gmail:

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/security
   - Under "2-Step Verification", click "App passwords"
   - Select "Mail" and your device
   - Copy the 16-character password
3. Use this password in `EMAIL_PASSWORD` in `.env`

#### Start Backend Server
```bash
cd /app/backend
yarn start
```

You should see:
```
🚀 Starting Suryoday NGO Backend...
================================
✅ Database connection verified
✅ Super Admin account created successfully
   Email: superadmin@suryoday.org
   Password: SuperAdmin@123
================================
✅ Server is running on port 8001
```

**⚠️ IMPORTANT**: Change the Super Admin password after first login!

---

### 2. Frontend Setup

#### Install Dependencies
```bash
cd /app
yarn install
```

#### Configure Environment
The `.env` file is already created. Update if needed:
```env
VITE_API_URL=http://localhost:8001/api
```

#### Start Frontend
```bash
cd /app
yarn dev
```

The app will run on: http://localhost:5173

---

## 🔐 User Roles & Permissions

### Super Admin (Protected Account)
- ✅ All admin features
- ✅ Create/delete Admin accounts
- ✅ Modify admin roles
- ❌ Cannot be deleted
- ❌ Role cannot be changed

### Admin
- ✅ Volunteer management (approve/reject applications)
- ✅ Task creation and assignment
- ✅ Content management (news, testimonials, stories)
- ✅ Event management
- ✅ Urgent needs & donation tracking
- ✅ Gallery management
- ✅ Volunteer hours approval
- ✅ Create volunteer accounts
- ❌ Cannot manage other admin accounts
- ⚠️ Can be deleted/modified by Super Admin only

### Volunteer
- ✅ View assigned tasks
- ✅ Update task status
- ✅ Log volunteer hours
- ✅ View events
- ✅ View personal profile
- ❌ No admin features

---

## 📱 Application Routes

### Public Routes
- `/` - Home page (public NGO website)
- `/` - All sections accessible via scroll/navigation

### Authentication Routes
- `/dashboard` - Admin/Super Admin login (manual navigation only)
- `/volunteer-portal` - Volunteer login (manual navigation only)

### Protected Routes (After Login)
- `/dashboard/*` - Admin dashboard with full management interface
- `/volunteer-portal/*` - Volunteer portal with tasks and hours logging

---

## 🗄️ Database Schema

The system uses 9 main tables:

1. **users** - All system users (Super Admin, Admins, Volunteers)
2. **volunteers** - Volunteer applications
3. **tasks** - Task assignments
4. **events** - NGO events
5. **content** - Dynamic content (news, testimonials, stories)
6. **urgent_needs** - Donation campaigns
7. **gallery** - Photo gallery
8. **volunteer_hours** - Volunteer hour logs
9. **messages** - Internal messaging system

All tables use UUID primary keys (no MongoDB ObjectID issues).

---

## 📧 Email Notifications

The system automatically sends emails for:

1. **Volunteer Approval** - Welcome email with portal access
2. **Volunteer Rejection** - Polite rejection notice
3. **Task Assignment** - New task notification with details
4. **New User Creation** - Welcome email with login credentials

All emails use professionally designed HTML templates.

---

## 🔧 API Testing

### Test Backend Health
```bash
curl http://localhost:8001/api/health
```

### Test Login
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@suryoday.org","password":"SuperAdmin@123"}'
```

### Test Volunteer Application (Public)
```bash
curl -X POST http://localhost:8001/api/volunteers/apply \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Volunteer",
    "email": "test@example.com",
    "phone": "1234567890",
    "age": 25,
    "motivation": "Want to help elderly people",
    "skills": ["healthcare", "cooking"]
  }'
```

---

## 🐛 Troubleshooting

### Backend Issues

**"Missing Supabase credentials"**
- Check that all env variables are set in `/app/backend/.env`
- Ensure no spaces around `=` in env file

**"Table does not exist"**
- Run the database schema SQL in Supabase
- Check Table Editor to verify tables exist

**"Email not sent"**
- Verify Gmail app password is correct
- Check that 2FA is enabled on Google account
- Test with a simple email send script

**"Super Admin not created"**
- Check database connection
- Verify `users` table exists
- Check server logs for errors

### Frontend Issues

**"Network Error" or "Failed to fetch"**
- Ensure backend is running on port 8001
- Check `VITE_API_URL` in `/app/.env`
- Verify CORS is working (already configured)

**"Cannot find module"**
- Run `yarn install` in project root
- Clear cache: `rm -rf node_modules && yarn install`

---

## 🚀 Deployment

### Backend (Render/Railway/Heroku)

1. Push code to GitHub
2. Connect repository to hosting service
3. Set all environment variables from `.env`
4. Deploy!

**Important Environment Variables for Production:**
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Update `FRONTEND_URL` in email templates if needed

### Frontend (Vercel/Netlify)

1. Build command: `yarn build`
2. Output directory: `dist`
3. Set environment variable: `VITE_API_URL=https://your-backend-url.com/api`

---

## 📚 File Structure

```
/app/
├── backend/                 # Node.js backend
│   ├── config/             # Database & email config
│   ├── middleware/         # Auth middleware
│   ├── routes/             # API routes
│   ├── utils/              # Helper functions
│   ├── server.js           # Main server file
│   ├── database-schema.sql # Database setup
│   └── .env                # Environment variables
│
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── contexts/           # React contexts (Auth)
│   ├── services/           # API service layer
│   └── App.jsx             # Main app component
│
├── public/                 # Static assets
└── package.json            # Frontend dependencies
```

---

## 🔒 Security Best Practices

1. **Change Default Passwords**
   - Change Super Admin password after first login
   - Use strong passwords for all accounts

2. **Environment Variables**
   - Never commit `.env` files to git
   - Use different secrets for development/production

3. **Database**
   - Regularly backup Supabase database
   - Enable Row Level Security policies in production

4. **API Keys**
   - Rotate JWT secret periodically
   - Keep Supabase service key secure

---

## 💡 Next Steps

1. ✅ Set up backend with Supabase credentials
2. ✅ Run database schema
3. ✅ Configure Gmail SMTP
4. ✅ Start backend server
5. ⏳ Build frontend dashboards (in progress)
6. ⏳ Update UI/UX for NGO theme
7. ⏳ Remove Sanity CMS completely
8. ⏳ Test all features
9. ⏳ Deploy to production

---

## 📞 Support

For issues or questions:
- Check this guide first
- Review backend README: `/app/backend/README.md`
- Check API endpoint documentation
- Review database schema comments

---

**Built with ❤️ for Suryoday Old Age Home**
