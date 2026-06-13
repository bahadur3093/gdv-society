import { PrismaClient } from '@prisma/client';
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { hashPassword } from '../src/lib/utils/password';
import ws from 'ws';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Create Neon connection pool and adapter
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create Neon adapter with connectionString (PoolConfig)
const adapter = new PrismaNeon({ connectionString });

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gdv.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const hashedPassword = await hashPassword(adminPassword);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'GDV Administrator',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Admin user created:', { email: admin.email, role: admin.role });

  // Create test resident user
  const residentEmail = 'resident@gdv.com';
  const residentPassword = 'Resident@123';
  const hashedResidentPassword = await hashPassword(residentPassword);

  const resident = await prisma.user.upsert({
    where: { email: residentEmail },
    update: {},
    create: {
      email: residentEmail,
      password: hashedResidentPassword,
      name: 'Nanda Kumar',
      role: 'RESIDENT',
      plotNumber: '1',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Test resident user created:', { email: resident.email, role: resident.role, plotNumber: resident.plotNumber });

  console.log('✅ Society settings created');

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\n📝 Login credentials:');
  console.log(`   Admin: ${adminEmail} / ${adminPassword}`);
  console.log(`   Resident: ${residentEmail} / ${residentPassword}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });