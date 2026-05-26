import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });

async function syncSchema() {
  try {
    console.log('🔄 Syncing Prisma schema to database...');
    console.log('📊 Creating Villa table...');
    
    // Create Villa table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Villa" (
        "id" TEXT NOT NULL,
        "villaNo" INTEGER NOT NULL,
        "type" TEXT NOT NULL,
        "areaInSqM" DOUBLE PRECISION NOT NULL,
        "ownerName" TEXT NOT NULL,
        "areaInSqFt" DOUBLE PRECISION NOT NULL,
        "remarks" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Villa_pkey" PRIMARY KEY ("id")
      );
    `);

    console.log('📇 Creating indexes...');
    
    // Create unique index on villaNo
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Villa_villaNo_key" ON "Villa"("villaNo");
    `);

    // Create index on villaNo for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "Villa_villaNo_idx" ON "Villa"("villaNo");
    `);

    // Create index on ownerName for faster searches
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "Villa_ownerName_idx" ON "Villa"("ownerName");
    `);

    console.log('✅ Villa table and indexes created successfully!');
    console.log('\n📋 Table structure:');
    console.log('  - id: TEXT (Primary Key)');
    console.log('  - villaNo: INTEGER (Unique)');
    console.log('  - type: TEXT');
    console.log('  - areaInSqM: DOUBLE PRECISION');
    console.log('  - ownerName: TEXT');
    console.log('  - areaInSqFt: DOUBLE PRECISION');
    console.log('  - remarks: TEXT (Optional)');
    console.log('  - createdAt: TIMESTAMP');
    console.log('  - updatedAt: TIMESTAMP');
    console.log('\n🎉 Schema sync completed successfully!');
    
  } catch (error: any) {
    console.error('❌ Error syncing schema:', error.message);
    if (error.code === '42P07') {
      console.log('ℹ️  Table already exists, skipping creation.');
    } else {
      throw error;
    }
  } finally {
    await pool.end();
  }
}

// Run the sync
syncSchema().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
