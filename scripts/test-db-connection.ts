import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    
    console.log('Connection successful!');
    
    // Try to list users
    const users = await prisma.user.findMany();
    console.log('Users in database:', users);
    
  } catch (error) {
    console.error('Error connecting to database:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection()
  .catch((e) => {
    console.error('Script error:', e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
