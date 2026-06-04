/**
 * Database Recovery Script
 * This script will:
 * 1. Create admin user
 * 2. Migrate all villa data from PLOT_REGISTRY
 * 3. Seed society settings
 * 
 * Run with: npm run db:recover
 */

import { PrismaClient } from '@prisma/client';
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { hashPassword } from '../src/lib/utils/password';
import { PLOT_REGISTRY } from '../src/data/plots';
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

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function recoverDatabase() {
  console.log('🚀 Starting database recovery...');
  console.log('=' .repeat(60));

  try {
    // Step 1: Create Admin User
    console.log('\n📋 Step 1: Creating Admin User');
    console.log('-'.repeat(60));
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gdv.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const hashedPassword = await hashPassword(adminPassword);

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        password: hashedPassword,
        name: 'GDV Administrator',
        role: 'ADMIN',
        emailVerified: new Date(),
      },
      create: {
        email: adminEmail,
        password: hashedPassword,
        name: 'GDV Administrator',
        role: 'ADMIN',
        emailVerified: new Date(),
      },
    });

    console.log('✅ Admin user created/updated:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin.id}`);

    // Step 2: Migrate Villa Data
    console.log('\n📋 Step 2: Migrating Villa Data');
    console.log('-'.repeat(60));
    console.log(`📊 Found ${PLOT_REGISTRY.length} villas to migrate`);

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const plot of PLOT_REGISTRY) {
      try {
        const villa = await prisma.villa.upsert({
          where: { villaNo: plot.villaNo },
          update: {
            type: plot.type,
            areaInSqM: plot.areaInSqM,
            ownerName: plot.ownerName,
            areaInSqFt: plot.areaInSqFt,
            remarks: plot.remarks || null,
          },
          create: {
            villaNo: plot.villaNo,
            type: plot.type,
            areaInSqM: plot.areaInSqM,
            ownerName: plot.ownerName,
            areaInSqFt: plot.areaInSqFt,
            remarks: plot.remarks || null,
          },
        });

        // Check if it was an update or create by checking if villa existed
        const wasUpdate = await prisma.villa.count({
          where: {
            villaNo: plot.villaNo,
            updatedAt: { lt: new Date(Date.now() - 1000) }, // Check if updated recently
          },
        }) > 0;

        if (wasUpdate) {
          console.log(`🔄 Updated villa ${plot.villaNo} - ${plot.ownerName}`);
          updated++;
        } else {
          console.log(`✅ Created villa ${plot.villaNo} - ${plot.ownerName}`);
          created++;
        }
      } catch (error: unknown) {
        console.error(`❌ Error processing villa ${plot.villaNo}:`, (error as Error).message);
        errors++;
      }
    }

    // Step 3: Create Society Settings
    console.log('\n📋 Step 3: Creating Society Settings');
    console.log('-'.repeat(60));

    const settings = await prisma.societySettings.upsert({
      where: { id: 'default' },
      update: {
        perSqFtRate: 2.15,
        fixedBaseAmount: 1873.00,
        sinkingFundPercentage: 20,
        securityExpense: 63000,
        electricityExpense: 25000,
        miscExpense: 9000,
        cleaningExpense: 5000,
        garbageExpense: 3000,
        gymExpense: 6000,
        stpMaintenanceExpense: 1000,
        emergencyFundExpense: 21000,
      },
      create: {
        id: 'default',
        perSqFtRate: 2.15,
        fixedBaseAmount: 1873.00,
        sinkingFundPercentage: 20,
        securityExpense: 63000,
        electricityExpense: 25000,
        miscExpense: 9000,
        cleaningExpense: 5000,
        garbageExpense: 3000,
        gymExpense: 6000,
        stpMaintenanceExpense: 1000,
        emergencyFundExpense: 21000,
      },
    });

    console.log('✅ Society settings created/updated');

    // Final Summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 RECOVERY SUMMARY');
    console.log('='.repeat(60));
    console.log(`\n👤 Admin User: ${admin.email}`);
    console.log(`\n🏘️  Villa Migration:`);
    console.log(`   ✅ Created: ${created}`);
    console.log(`   🔄 Updated: ${updated}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📊 Total: ${PLOT_REGISTRY.length}`);
    console.log(`\n⚙️  Society Settings: Configured`);

    if (errors === 0) {
      console.log('\n🎉 Database recovery completed successfully!');
    } else {
      console.log('\n⚠️  Database recovery completed with some errors.');
    }

    console.log('\n📝 Login Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n' + '='.repeat(60));

  } catch (error: unknown) {
    console.error('\n❌ Recovery failed:', (error as Error).message);
    console.error((error as Error).stack);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run recovery
recoverDatabase()
  .then(() => {
    console.log('\n✨ Recovery script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Recovery script failed:', error);
    process.exit(1);
  });