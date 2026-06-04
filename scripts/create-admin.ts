/**
 * Script to create or update a user to ADMIN role
 * Run with: npx tsx scripts/create-admin.ts
 */

import { config } from 'dotenv';
import { PrismaClient } from '.prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import * as bcrypt from 'bcryptjs';

// Load environment variables from .env file
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set. Please check your .env file.');
}

// Create Neon adapter with connectionString (PoolConfig)
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function createAdmin() {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@gdv-society.com';
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Admin@1234';
  const adminName = 'System Administrator';

  try {
    // Check if admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      // Update existing user to ADMIN role
      const updatedUser = await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'ADMIN' },
      });

      console.log('✅ Updated existing user to ADMIN role:');
      console.log({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      });
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      const newAdmin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: adminName,
          role: 'ADMIN',
          plotNumber: null, // Admins don't need plot numbers
        },
      });

      console.log('✅ Created new ADMIN user:');
      console.log({
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
      });
    }

    console.log('\n📧 Admin Credentials:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('\n⚠️  Please change the password after first login!');
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the admin creation
createAdmin()
  .then(() => {
    console.log('\n✅ Admin account setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed to create admin:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Ensure DATABASE_URL is set in your .env file');
    console.error('2. Run `npx prisma generate` to generate Prisma Client');
    console.error('3. Run `npx prisma migrate dev` to apply database migrations');
    process.exit(1);
  });