import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    
    console.log('Connection successful!');
    
    // Check if the User table exists by trying to count records
      try {
      const userCount = await prisma.user.count({ where: { role: 'USER' } });
      console.log(`Found ${userCount} users with role USER in the database.`);
    } catch (error) {
      console.error('Error accessing User table. The table might not exist yet.');
      console.error('Please run: npx prisma db push');
      console.error('Or if you want to reset the database: npx prisma migrate reset');
    }
    
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
  });
