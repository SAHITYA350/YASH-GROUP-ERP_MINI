import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

let prismaInstance = null;
let isConnected = false;
let connectionError = null;

let dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  try {
    const hasQuery = dbUrl.includes('?');
    const params = [];
    if (dbUrl.includes('-pooler') && !dbUrl.includes('pgbouncer=')) {
      params.push('pgbouncer=true');
    }
    if (!dbUrl.includes('connect_timeout=')) {
      params.push('connect_timeout=60');
    }
    if (!dbUrl.includes('pool_timeout=')) {
      params.push('pool_timeout=60');
    }
    if (params.length > 0) {
      dbUrl += (hasQuery ? '&' : '?') + params.join('&');
    }
  } catch (e) {
    console.warn('[Prisma] URL parse notice:', e.message);
  }
}

if (dbUrl) {
  try {
    prismaInstance = new PrismaClient({
      datasources: { db: { url: dbUrl } },
      log: ['error', 'warn'],
    });
  } catch (err) {
    console.warn('[Prisma] Initialization notice:', err.message);
    connectionError = err.message;
  }
} else {
  console.info('[Prisma] Notice: DATABASE_URL not detected in environment. Running with resilient local store.');
}

export async function checkDatabaseConnection(retries = 2) {
  if (!prismaInstance) {
    return {
      connected: false,
      message: 'DATABASE_URL is not configured in server/.env (running resilient local store)',
    };
  }
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Safe, lightweight read-only query
      await prismaInstance.$queryRaw`SELECT 1 as health_check`;
      isConnected = true;
      connectionError = null;
      return { connected: true, message: 'Connected to remote database successfully' };
    } catch (err) {
      if (attempt < retries) {
        // Sleep 1500ms for Neon cold-start wake up
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }
      isConnected = false;
      connectionError = err.message;
      return { connected: false, message: 'Database connection failed: ' + err.message };
    }
  }
}

export const prisma = prismaInstance;
export const getConnectionStatus = () => ({ isConnected, connectionError });

export default {
  prisma: prismaInstance,
  checkDatabaseConnection,
  getConnectionStatus,
};
