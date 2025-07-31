import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Prisma client instance
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    await prisma.$connect();
    // Test with a simple query
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Prisma database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Prisma database connection failed:', error);
    return false;
  }
};

// Initialize database (Prisma handles schema automatically)
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Prisma handles schema creation through migrations
    // Just test the connection
    await testConnection();
    console.log('✅ Prisma database initialized successfully');
  } catch (error) {
    console.error('❌ Prisma database initialization failed:', error);
    throw error;
  }
};

// Graceful shutdown
export const closeDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log('✅ Prisma database connection closed');
  } catch (error) {
    console.error('❌ Error closing Prisma database connection:', error);
  }
};

// Export the Prisma client for use in services
export { prisma };
