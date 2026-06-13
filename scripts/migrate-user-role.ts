import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString });

async function migrateUserRoleEnum() {
  const client = await pool.connect();
  try {
    console.log('Starting UserRole enum migration...');
    
    // Step 0: Clean up any orphaned UserRole_new enum
    console.log('Cleaning up orphaned types...');
    try {
      await client.query(`DROP TYPE IF EXISTS "UserRole_new" CASCADE;`);
      console.log('✅ Orphaned UserRole_new cleaned up');
    } catch (err) {
      console.log('⏭️  No orphaned types found');
    }
    
    // Step 1: Add RESIDENT to existing enum (skip if already exists)
    console.log('Checking if RESIDENT exists in UserRole enum...');
    try {
      await client.query(`
        ALTER TYPE "UserRole" ADD VALUE 'RESIDENT' BEFORE 'USER';
      `);
      console.log('✅ RESIDENT added to enum');
    } catch (err: any) {
      if (err.code === '42710') {
        console.log('⏭️  RESIDENT already exists in enum, skipping...');
      } else {
        throw err;
      }
    }

    // Step 2: Update existing USER values to RESIDENT
    console.log('Converting USER values to RESIDENT...');
    await client.query(
      `UPDATE "User" SET role = 'RESIDENT' WHERE role = 'USER'`
    );
    console.log('✅ USER values converted to RESIDENT');

    // Step 3: Create new enum type without USER
    console.log('Creating new UserRole_new enum...');
    await client.query(`
      CREATE TYPE "UserRole_new" AS ENUM ('RESIDENT', 'ADMIN');
    `);
    console.log('✅ New enum created');

    // Step 4: Drop the default constraint
    console.log('Dropping default constraint...');
    await client.query(`
      ALTER TABLE "User" ALTER COLUMN role DROP DEFAULT;
    `);
    console.log('✅ Default constraint dropped');

    // Step 5: Convert column to use new enum
    console.log('Updating User table role column...');
    await client.query(`
      ALTER TABLE "User" 
      ALTER COLUMN role TYPE "UserRole_new" USING role::"text"::"UserRole_new";
    `);
    console.log('✅ Column converted');

    // Step 6: Add new default
    console.log('Adding new default value...');
    await client.query(`
      ALTER TABLE "User" ALTER COLUMN role SET DEFAULT 'RESIDENT';
    `);
    console.log('✅ New default set');

    // Step 7: Drop old enum
    console.log('Dropping old UserRole enum...');
    await client.query(`
      DROP TYPE "UserRole";
    `);
    console.log('✅ Old enum dropped');

    // Step 8: Rename new enum to UserRole
    console.log('Renaming new enum to UserRole...');
    await client.query(`
      ALTER TYPE "UserRole_new" RENAME TO "UserRole";
    `);
    console.log('✅ Enum renamed');

    console.log('\n✨ Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await client.release();
    await pool.end();
  }
}

migrateUserRoleEnum();
