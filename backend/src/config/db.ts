import { PrismaClient } from '@prisma/client';

// Declare global variable for Prisma client
declare global {
  var prisma: PrismaClient | undefined;
}

// Create Prisma client instance
const prisma = globalThis.prisma || new PrismaClient({
  log: process.env['NODE_ENV'] === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// In development, use global variable to prevent multiple instances
if (process.env['NODE_ENV'] !== 'production') {
  globalThis.prisma = prisma;
}

/**
 * Get the PostgreSQL database instance
 * @returns PrismaClient instance
 */
export const getDatabase = (): PrismaClient => {
  return prisma;
};

/**
 * Connect to the database
 * @returns Promise<void>
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

/**
 * Disconnect from the database
 * @returns Promise<void>
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
    throw error;
  }
};

/**
 * Health check for database connection
 * @returns Promise<boolean>
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
};

// Export the default prisma instance for backward compatibility
export default prisma; 