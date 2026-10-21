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
if (dbUrl && dbUrl.includes('-pooler') && !dbUrl.includes('pgbouncer=true')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
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

export async function checkDatabaseConnection() {
  if (!prismaInstance) {
    return {
      connected: false,
      message: 'DATABASE_URL is not configured in server/.env (running resilient local store)',
    };
  }
  try {
    // Perform a safe, lightweight read-only query
    await prismaInstance.$queryRaw`SELECT 1 as health_check`;
    isConnected = true;
    connectionError = null;
    return { connected: true, message: 'Connected to remote database successfully' };
  } catch (err) {
    isConnected = false;
    connectionError = err.message;
    return { connected: false, message: 'Database connection failed: ' + err.message };
  }
}

export const prisma = prismaInstance;
export const getConnectionStatus = () => ({ isConnected, connectionError });

export default {
  prisma: prismaInstance,
  checkDatabaseConnection,
  getConnectionStatus,
};
