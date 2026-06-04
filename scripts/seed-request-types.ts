import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create Neon connection pool
const pool = new Pool({ connectionString });

// Create Neon adapter
const adapter = new PrismaNeon(pool);

// Create Prisma client
const prisma = new PrismaClient({ adapter });

async function seedRequestTypes() {
  console.log('🌱 Starting request types configuration seed...');

  const requestTypesConfig = [
    {
      value: 'PLOT_SIZE_UPDATE',
      label: 'Plot Size Update',
      icon: 'User',
      description: 'Request to update your registered plot size',
      enable: false,
    },
    {
      value: 'PAYMENT_ISSUE',
      label: 'Payment Issue',
      icon: 'DollarSign',
      description: 'Report payment discrepancies or issues',
      enable: true,
    },
    {
      value: 'EXPENSE_SHEET_MONTHLY',
      label: 'Monthly Expense Sheet',
      icon: 'FileSpreadsheet',
      description: 'Request monthly expense breakdown',
      enable: true,
    },
    {
      value: 'EXPENSE_SHEET_YEARLY',
      label: 'Yearly Expense Sheet',
      icon: 'FileSpreadsheet',
      description: 'Request annual expense summary',
      enable: true,
    },
    {
      value: 'ADD_FAMILY_MEMBER',
      label: 'Add Family Member',
      icon: 'Users',
      description: 'Add a family member to your plot',
      enable: true,
    },
  ];

  try {
    const result = await prisma.appConfig.upsert({
      where: { configKey: 'request_types' },
      update: { configValue: requestTypesConfig },
      create: {
        configKey: 'request_types',
        configValue: requestTypesConfig,
      },
    });

    console.log('✅ Request types configuration seeded successfully');
    console.log('📊 Configuration ID:', result.id);
    console.log('🔑 Config Key:', result.configKey);
    console.log('📝 Number of request types:', requestTypesConfig.length);
  } catch (error) {
    console.error('❌ Error seeding request types:', error);
    throw error;
  }
}

seedRequestTypes()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  });
