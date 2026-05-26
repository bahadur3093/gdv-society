/**
 * Migration script to populate Villa table from existing plots.ts data
 * Run with: npx tsx scripts/migrate-villas.ts
 */

import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '.prisma/client';
import { PLOT_REGISTRY } from '../src/data/plots';
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

async function migrateVillas() {
  console.log('🚀 Starting villa data migration...');
  console.log(`📊 Found ${PLOT_REGISTRY.length} villas to migrate`);

  try {
    // Check if villas already exist
    const existingCount = await prisma.villa.count();
    
    if (existingCount > 0) {
      console.log(`⚠️  Warning: ${existingCount} villas already exist in the database.`);
      console.log('This script will skip existing villa numbers and only add new ones.');
    }

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const plot of PLOT_REGISTRY) {
      try {
        // Check if villa already exists
        const existing = await prisma.villa.findUnique({
          where: { villaNo: plot.villaNo },
        });

        if (existing) {
          console.log(`⏭️  Skipping villa ${plot.villaNo} (already exists)`);
          skipped++;
          continue;
        }

        // Create new villa
        await prisma.villa.create({
          data: {
            villaNo: plot.villaNo,
            type: plot.type,
            areaInSqM: plot.areaInSqM,
            ownerName: plot.ownerName,
            areaInSqFt: plot.areaInSqFt,
            remarks: plot.remarks || null,
          },
        });

        console.log(`✅ Created villa ${plot.villaNo} - ${plot.ownerName}`);
        created++;
      } catch (error: unknown) {
        console.error(`❌ Error creating villa ${plot.villaNo}:`, (error as Error).message);
        errors++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📊 Total: ${PLOT_REGISTRY.length}`);

    if (errors === 0) {
      console.log('\n🎉 Villa migration completed successfully!');
    } else {
      console.log('\n⚠️  Villa migration completed with errors.');
    }
  } catch (error: unknown) {
    console.error('❌ Migration failed:', (error as Error).message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateVillas()
  .then(() => {
    console.log('\n✨ Migration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error);
    process.exit(1);
  });
