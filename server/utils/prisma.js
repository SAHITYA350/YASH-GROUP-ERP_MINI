// Shared Prisma client - every module imports this SAME instance.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
