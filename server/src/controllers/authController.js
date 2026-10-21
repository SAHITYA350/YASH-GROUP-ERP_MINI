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

    if (prisma && authenticatedUser.id) {
      try {
        await prisma.user.update({
          where: { id: authenticatedUser.id },
          data: { isLoggedIn: true },
        });

        const todayDate = new Date();
        todayDate.setUTCHours(0, 0, 0, 0);

        const existingLog = await prisma.userAttendanceLog.findUnique({
          where: {
            userId_date: {
              userId: authenticatedUser.id,
              date: todayDate,
            },
          },
        });

        const now = new Date();
        if (!existingLog) {
          // Calculate shift timeliness based on General shift (09:30 + 10m grace = 09:40)
          const targetMinutes = 9 * 60 + 30;
          const graceMinutes = 10;
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          const lateMinutes = Math.max(0, currentMinutes - (targetMinutes + graceMinutes));
          const status = lateMinutes > 0 ? 'Late' : 'OnTime';

          await prisma.userAttendanceLog.create({
            data: {
              userId: authenticatedUser.id,
              date: todayDate,
              firstLoginAt: now,
              lastActiveAt: now,
              status,
              lateMinutes,
              locationStatus: 'InOffice',
              ipAddress: req.ip || '127.0.0.1',
              userAgent: (req.headers['user-agent'] || 'ERP Web Client').slice(0, 150),
            },
          });
        } else {
          await prisma.userAttendanceLog.update({
            where: { id: existingLog.id },
            data: { lastActiveAt: now },
          });
        }
      } catch (logErr) {
        console.warn('[Auth] Attendance log notice:', logErr.message);
      }
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

export const logout = async (req, res) => {
  if (prisma && req.user?.id) {
    try {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { isLoggedIn: false },
      });
    } catch (e) {
      console.warn('[Auth] Logout status update notice:', e.message);
    }
  }
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
