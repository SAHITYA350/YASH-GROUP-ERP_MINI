import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { checkDatabaseConnection } from './config/prisma.js';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import misRoutes from './routes/misRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging (sanitized, no credentials)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await checkDatabaseConnection();
  res.json({
    status: 'online',
    module: 'Module 7 — Workforce, Admin & MIS',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// Mount module routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/mis', misRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/media', mediaRoutes);

// 404 handler for unknown routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack || err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start Express server
const server = app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`🚀 ERP Module 7 Backend active on port ${PORT}`);
  console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
  console.log(`====================================================`);

  // Non-blocking connectivity check
  const dbHealth = await checkDatabaseConnection();
  if (dbHealth.connected) {
    console.log(`✅ [Database] Remote Neon PostgreSQL connected successfully.`);
  } else {
    console.log(`ℹ️ [Database] Remote DB note: ${dbHealth.message}`);
    console.log(`💡 [Database] Running with resilient local store.`);
  }
});

export { app, server };
export default app;
