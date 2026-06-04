/**
 * Seed Society Settings Script
 * 
 * This script creates initial society financial settings in the database.
 * Run this before using the /api/plot-registry endpoint.
 * 
 * Usage: npm run seed:settings
 */

import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables from the root .env file
dotenv.config({ path: join(__dirname, '..', '.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set.');
  console.error('📍 Current working directory:', process.cwd());
  console.error('📍 Script directory:', __dirname);
  console.error('📍 Looking for .env at:', join(__dirname, '..', '.env'));
  throw new Error('DATABASE_URL environment variable is not set. Please check your .env file.');
}

console.log('✅ DATABASE_URL loaded successfully');
console.log('🔗 Database URL:', connectionString.replace(/:[^:@]+@/, ':****@')); // Mask password
console.log('🔗 Connecting to database...');

// Create Neon adapter with connectionString (PoolConfig)
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seedSocietySettings() {
  console.log('\n🌱 Starting society settings seed...');

  try {
    // Check if settings already exist
    const existingSettings = await prisma.societySettings.findFirst();

    if (existingSettings) {
      console.log('⚠️  Society settings already exist:');
      console.log(JSON.stringify(existingSettings, null, 2));
      console.log('\n✅ No action needed. Use the existing settings or delete them first.');
      return;
    }

    // Default society financial settings
    const defaultSettings = {
      perSqFtRate: 2.15,
      fixedBaseAmount: 1873.0,
      sinkingFundPercentage: 10.0,
      securityExpense: 30000.0,
      electricityExpense: 10000.0,
      miscExpense: 5000.0,
      cleaningExpense: 8000.0,
      garbageExpense: 6000.0,
      gymExpense: 3000.0,
      stpMaintenanceExpense: 7000.0,
      emergencyFundExpense: 5000.0,
    };

    console.log('📝 Creating society settings with default values:');
    console.log(JSON.stringify(defaultSettings, null, 2));

    const settings = await prisma.societySettings.create({
      data: defaultSettings,
    });

    console.log('\n✅ Society settings created successfully!');
    console.log('Settings ID:', settings.id);
    console.log('\n📊 Summary:');
    console.log(`   Per Sq Ft Rate: ₹${settings.perSqFtRate}`);
    console.log(`   Sinking Fund %: ${settings.sinkingFundPercentage}%`);
    console.log('\n💡 You can now use the /api/plot-registry endpoint!');
  } catch (error: any) {
    console.error('❌ Error seeding society settings:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedSocietySettings()
  .then(() => {
    console.log('\n🎉 Seed completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seed failed:', error);
    process.exit(1);
  });
