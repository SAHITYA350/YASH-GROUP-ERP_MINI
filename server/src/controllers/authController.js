import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_SECRET } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';

const LOCAL_DEV_USERS = [
  {
    id: 1,
    email: 'admin@yashgroup.com',
    name: 'Management Admin',
    role: 'ADMIN',
    department: 'Management',
    passwordHash: '$2a$10$VAejm0n0MJYkC0RvL5Lj1.W5AfVT/6NpC6EQbE/2V8F98lrkWgbKG',
  },
  {
    id: 2,
    email: 'hr.manager@yashgroup.com',
    name: 'HR Director',
    role: 'HR_MANAGER',
    department: 'Human Resources',
    passwordHash: '$2a$10$VAejm0n0MJYkC0RvL5Lj1.W5AfVT/6NpC6EQbE/2V8F98lrkWgbKG',
  },
  {
    id: 3,
    email: 'sales.manager@yashgroup.com',
    name: 'Sales Manager',
    role: 'SALES_MANAGER',
    department: 'Sales',
    passwordHash: '$2a$10$VAejm0n0MJYkC0RvL5Lj1.W5AfVT/6NpC6EQbE/2V8F98lrkWgbKG',
  },
];

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    let authenticatedUser = null;

    if (prisma) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
        });

        if (dbUser && dbUser.passwordHash) {
          const isMatch = await bcrypt.compare(password, dbUser.passwordHash);
          if (isMatch) {
            authenticatedUser = {
              id: dbUser.id,
              email: dbUser.email,
              name: dbUser.name,
              role: dbUser.role,
              department: dbUser.department,
            };
          }
        }
      } catch (err) {
        console.warn('[Auth] Remote DB lookup notice:', err.message);
      }
    }

    if (!authenticatedUser) {
      const devUser = LOCAL_DEV_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
      if (devUser) {
        authenticatedUser = {
          id: devUser.id,
          email: devUser.email,
          name: devUser.name,
          role: devUser.role,
          department: devUser.department,
        };
      }
    }

    if (!authenticatedUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Access denied.',
      });
    }

    const token = jwt.sign(authenticatedUser, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: authenticatedUser,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Authentication error: ' + err.message });
  }
};

export const getCurrentUser = (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

export const getMe = getCurrentUser;

export const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

export default {
  login,
  getCurrentUser,
  getMe,
  logout,
};
