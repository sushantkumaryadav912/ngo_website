import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Verify JWT token
export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Check if user has required role
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Check if user is Super Admin
export const requireSuperAdmin = (req, res, next) => {
  return requireRole('super_admin')(req, res, next);
};

// Check if user is Admin or Super Admin
export const requireAdmin = (req, res, next) => {
  return requireRole('super_admin', 'admin')(req, res, next);
};

// Check if user is Volunteer (any authenticated user)
export const requireVolunteer = (req, res, next) => {
  return requireRole('super_admin', 'admin', 'volunteer')(req, res, next);
};
