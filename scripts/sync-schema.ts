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
    console.log('✅ Villa table and indexes created successfully!');
    
    console.log('📢 Creating Announcement and AnnouncementFile tables...');
    
    // Create Announcement table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Announcement" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "priority" TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
        "publishDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
      );
    `);

    // Create AnnouncementFile table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "AnnouncementFile" (
        "id" TEXT NOT NULL,
        "announcementId" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "AnnouncementFile_pkey" PRIMARY KEY ("id")
      );
    `);

    console.log('📇 Creating Announcement indexes and foreign keys...');
    
    // Create Announcement indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS "Announcement_publishDate_idx" ON "Announcement"("publishDate");`);
    await pool.query(`CREATE INDEX IF NOT EXISTS "Announcement_category_idx" ON "Announcement"("category");`);
    await pool.query(`CREATE INDEX IF NOT EXISTS "Announcement_priority_idx" ON "Announcement"("priority");`);
    await pool.query(`CREATE INDEX IF NOT EXISTS "Announcement_isActive_idx" ON "Announcement"("isActive");`);

    // Create AnnouncementFile indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS "AnnouncementFile_announcementId_idx" ON "AnnouncementFile"("announcementId");`);

    // Add foreign key constraint safely
    try {
      await pool.query(`
        ALTER TABLE "AnnouncementFile" 
        ADD CONSTRAINT "AnnouncementFile_announcementId_fkey" 
        FOREIGN KEY ("announcementId") 
        REFERENCES "Announcement"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
      `);
    } catch (fkError: any) {
      if (fkError.code === '42710') {
        console.log('  - Foreign key constraint already exists, skipping.');
      } else {
        throw fkError;
      }
    }

    console.log('✅ Announcement tables and constraints created successfully!');
    
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
