// prisma/seed.ts

import { PrismaClient, BillStatus, PaymentMethod, AdjustmentType } from '@prisma/client';
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';
import * as dotenv from 'dotenv';

dotenv.config();
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

// ═══════════════════════════════════════════════════════════════
//  CONFIG — billing setup
// ═══════════════════════════════════════════════════════════════

const RATE_PER_SQ_FT = 3;

// ═══════════════════════════════════════════════════════════════
//  Find existing users (no creation)
// ═══════════════════════════════════════════════════════════════

async function findExistingUsers() {
  console.log('\n👥 Finding existing users...');

  // Find any admin
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    throw new Error(
      '❌ No admin user found in DB. Sign up an admin first via the app.'
    );
  }
  console.log(`   ✅ Admin: ${admin.email} (${admin.name})`);

  // Find any resident with a plotNumber set
  const resident = await prisma.user.findFirst({
    where: {
      role: 'RESIDENT',
      plotNumber: { not: null },
    },
  });

  if (!resident) {
    throw new Error(
      '❌ No resident user found in DB. Sign up a resident first via the app.'
    );
  }
  console.log(`   ✅ Resident: ${resident.email} (plot ${resident.plotNumber})`);

  return { admin, resident };
}

// ═══════════════════════════════════════════════════════════════
//  Find existing villa OR link existing villa to resident
// ═══════════════════════════════════════════════════════════════

async function ensureVillaForResident(
  residentId: string,
  residentName: string,
  plotNumber: string
) {
  console.log('\n🏠 Ensuring villa exists for resident...');

  const villaNo = parseInt(plotNumber, 10);
  if (isNaN(villaNo)) {
    throw new Error(`❌ Resident plotNumber "${plotNumber}" is not a number`);
  }

  // Check if villa with this number already exists
  let villa = await prisma.villa.findUnique({
    where: { villaNo },
  });

  if (villa) {
    console.log(`   📌 Found existing Villa ${villaNo} (${villa.areaInSqFt} sqft)`);
    
    // Link to resident if not already linked
    if (villa.userId !== residentId) {
      villa = await prisma.villa.update({
        where: { id: villa.id },
        data: { userId: residentId },
      });
      console.log(`   🔗 Linked Villa ${villaNo} to ${residentName}`);
    } else {
      console.log(`   ✅ Already linked to ${residentName}`);
    }
  } else {
    // Create new villa if doesn't exist (sensible defaults)
    villa = await prisma.villa.create({
      data: {
        villaNo,
        type: 'Standard',
        areaInSqM: 111.48,
        areaInSqFt: 1200,
        ownerName: residentName,
        userId: residentId,
      },
    });
    console.log(`   🆕 Created Villa ${villaNo} (1200 sqft) → ${residentName}`);
  }

  return villa;
}

// ═══════════════════════════════════════════════════════════════
//  Seed maintenance billing (uses villa's actual sqft)
// ═══════════════════════════════════════════════════════════════

async function seedMaintenanceBilling(
  residentId: string,
  villa: { id: string; areaInSqFt: number; villaNo: number },
  adminId: string
) {
  console.log('\n💰 Seeding maintenance billing...');

  const monthlyAmount = villa.areaInSqFt * RATE_PER_SQ_FT;
  console.log(
    `   Rate: ₹${RATE_PER_SQ_FT}/sqft × ${villa.areaInSqFt} sqft = ₹${monthlyAmount}/month`
  );

  // ── Clear prior billing data (idempotent) ────────────────
  console.log('   🧹 Clearing prior billing data...');
  await prisma.paymentAllocation.deleteMany({
    where: { payment: { userId: residentId } },
  });
  await prisma.payment.deleteMany({ where: { userId: residentId } });
  await prisma.specialLevy.deleteMany({ where: { userId: residentId } });
  await prisma.adjustment.deleteMany({ where: { userId: residentId } });
  await prisma.maintenanceBill.deleteMany({ where: { userId: residentId } });

  // ── Bills ────────────────────────────────────────────────
  console.log('   📄 Creating bills (April, May, June 2026)...');

  const billApr = await prisma.maintenanceBill.create({
    data: {
      userId: residentId,
      villaId: villa.id,
      month: 4,
      year: 2026,
      areaInSqFt: villa.areaInSqFt,
      ratePerSqFt: RATE_PER_SQ_FT,
      amount: monthlyAmount,
      dueDate: new Date(Date.UTC(2026, 3, 10)),
      status: BillStatus.PAID,
      createdAt: new Date(Date.UTC(2026, 3, 1)),
    },
  });
  console.log(`      ✅ April: ₹${monthlyAmount} → PAID`);

  const billMay = await prisma.maintenanceBill.create({
    data: {
      userId: residentId,
      villaId: villa.id,
      month: 5,
      year: 2026,
      areaInSqFt: villa.areaInSqFt,
      ratePerSqFt: RATE_PER_SQ_FT,
      amount: monthlyAmount,
      dueDate: new Date(Date.UTC(2026, 4, 10)),
      status: BillStatus.PARTIAL,
      createdAt: new Date(Date.UTC(2026, 4, 1)),
    },
  });
  console.log(`      ⚠️  May:   ₹${monthlyAmount} → PARTIAL`);

  const billJun = await prisma.maintenanceBill.create({
    data: {
      userId: residentId,
      villaId: villa.id,
      month: 6,
      year: 2026,
      areaInSqFt: villa.areaInSqFt,
      ratePerSqFt: RATE_PER_SQ_FT,
      amount: monthlyAmount,
      dueDate: new Date(Date.UTC(2026, 5, 10)),
      status: BillStatus.PENDING,
      createdAt: new Date(Date.UTC(2026, 5, 1)),
    },
  });
  console.log(`      🔴 June:  ₹${monthlyAmount} → PENDING`);

  // ── Payments + Allocations ───────────────────────────────
  console.log('   💳 Creating payments...');

  // Payment 1: pays April in full (use exact bill amount)
  await prisma.payment.create({
    data: {
      userId: residentId,
      amount: monthlyAmount,
      method: PaymentMethod.UPI,
      reference: 'UPI-APR-12345',
      paidAt: new Date('2026-04-08T10:00:00.000Z'),
      recordedBy: adminId,
      allocations: {
        create: [{ billId: billApr.id, amount: monthlyAmount }],
      },
    },
  });
  console.log(`      ✅ Apr 8:  ₹${monthlyAmount} UPI → fully covered April`);

  // Payment 2: partial on May (roughly 55% of monthly)
  const partialAmount = Math.round(monthlyAmount * 0.55);
  await prisma.payment.create({
    data: {
      userId: residentId,
      amount: partialAmount,
      method: PaymentMethod.UPI,
      reference: 'UPI-MAY-67890',
      notes: 'Partial payment',
      paidAt: new Date('2026-05-15T14:30:00.000Z'),
      recordedBy: adminId,
      allocations: {
        create: [{ billId: billMay.id, amount: partialAmount }],
      },
    },
  });
  console.log(`      ⚠️  May 15: ₹${partialAmount} UPI → partial on May`);

  // ── Special Levy (unpaid emergency) ──────────────────────
  console.log('   🚨 Creating special levy...');
  await prisma.specialLevy.create({
    data: {
      userId: residentId,
      title: 'Emergency plumbing repair',
      reason: 'Main pipe burst on 25th May',
      amount: 1000,
      status: BillStatus.PENDING,
      createdAt: new Date('2026-05-25T12:00:00.000Z'),
    },
  });
  console.log(`      🔴 Plumbing emergency: ₹1,000 → PENDING`);

  // ── Adjustment (late fee) ────────────────────────────────
  console.log('   📝 Creating adjustment...');
  await prisma.adjustment.create({
    data: {
      userId: residentId,
      amount: 100,
      type: AdjustmentType.LATE_FEE,
      reason: 'May bill paid after due date',
      createdById: adminId,
      createdAt: new Date('2026-05-11T00:00:00.000Z'),
    },
  });
  console.log(`      ⚠️  LATE_FEE: ₹100 (May late payment)`);

  // ── Summary ──────────────────────────────────────────────
  const totalDue = monthlyAmount * 3 + 1000 + 100;
  const totalPaid = monthlyAmount + partialAmount;
  const outstanding = totalDue - totalPaid;

  console.log('\n   📊 Resident financial summary:');
  console.log(`      Villa:       ${villa.villaNo} (${villa.areaInSqFt} sqft)`);
  console.log(`      Total Due:   ₹${totalDue.toLocaleString('en-IN')}`);
  console.log(`      Total Paid:  ₹${totalPaid.toLocaleString('en-IN')}`);
  console.log(`      Outstanding: ₹${outstanding.toLocaleString('en-IN')}`);
}


async function seedAllVillas() {
  console.log('\n🏘️  Ensuring all 47 villas exist...');

  const existingCount = await prisma.villa.count();
  
  if (existingCount >= 47) {
    console.log(`   ✅ ${existingCount} villas already in DB — skipping`);
    return;
  }

  // Variety of sizes for realistic data
  const villaTypes = ['Standard', 'Corner', 'Premium'];
  const areaOptions = [1000, 1200, 1500, 1800, 2000];

  let created = 0;
  let updated = 0;

  for (let i = 1; i <= 47; i++) {
    const area = areaOptions[i % areaOptions.length];
    const type = villaTypes[i % villaTypes.length];
    const areaInSqM = Math.round((area / 10.764) * 100) / 100;

    const existing = await prisma.villa.findUnique({ where: { villaNo: i } });
    
    if (existing) {
      updated++;
      continue;
    }

    await prisma.villa.create({
      data: {
        villaNo: i,
        type,
        areaInSqM,
        areaInSqFt: area,
        ownerName: `Owner ${i}`,  // placeholder for unclaimed villas
      },
    });
    created++;
  }

  console.log(`   ✅ Created ${created} new villas, ${updated} already existed`);
}

// ═══════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log('🌱 Starting database seed...');

  const { admin, resident } = await findExistingUsers();
  await seedAllVillas();
  const villa = await ensureVillaForResident(
    resident.id,
    resident.name,
    resident.plotNumber!
  );
  await seedMaintenanceBilling(resident.id, villa, admin.id);

  console.log('\n🎉 Database seed completed!\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });