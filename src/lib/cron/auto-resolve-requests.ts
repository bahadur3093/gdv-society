/**
 * Auto-resolve requests cron job
 * 
 * This script auto-resolves requests where the resident hasn't replied for 7 days.
 * It should be run daily via a cron job or scheduled task.
 * 
 * Usage:
 * - Next.js API route: Create /api/cron/auto-resolve-requests
 * - Vercel Cron: Configure in vercel.json
 * - Manual: Run via npm script or node command
 */

import { prisma } from '@/lib/prisma';

/**
 * Auto-resolves requests that meet the following criteria:
 * 1. Status is PENDING, IN_PROGRESS, or REOPENED
 * 2. lastResidentReplyAt is more than 7 days ago
 * 3. Request has at least one admin comment (indicating admin has responded)
 * 
 * @returns Object with count of auto-resolved requests
 */
export async function autoResolveRequests() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find requests eligible for auto-resolution
    const eligibleRequests = await prisma.residentRequest.findMany({
      where: {
        status: {
          in: ['PENDING', 'IN_PROGRESS', 'REOPENED'],
        },
        lastResidentReplyAt: {
          lt: sevenDaysAgo,
        },
        // Only auto-resolve if admin has commented (there's a conversation)
        comments: {
          some: {
            isAdminComment: true,
          },
        },
      },
      select: {
        id: true,
        userId: true,
        requestType: true,
        description: true,
        lastResidentReplyAt: true,
      },
    });

    if (eligibleRequests.length === 0) {
      console.log('No requests eligible for auto-resolution');
      return {
        success: true,
        autoResolvedCount: 0,
        message: 'No requests eligible for auto-resolution',
      };
    }

    console.log(`Found ${eligibleRequests.length} requests eligible for auto-resolution`);

    // Auto-resolve eligible requests
    const updatePromises = eligibleRequests.map(async (req) => {
      return prisma.$transaction(async (tx) => {
        // Update request to RESOLVED
        await tx.residentRequest.update({
          where: { id: req.id },
          data: {
            status: 'RESOLVED',
            resolvedAt: new Date(),
            resolvedBy: 'SYSTEM', // Special marker for auto-resolved
            updatedAt: new Date(),
          },
        });

        // Add a system comment explaining the auto-resolution
        await tx.requestComment.create({
          data: {
            requestId: req.id,
            authorId: req.userId, // Use the resident's ID as author
            content: '**Auto-resolved by system**\n\nThis request has been automatically resolved due to no response from the resident for 7 days. If you still need assistance, you can reopen this request.',
            isAdminComment: false,
          },
        });

        console.log(`Auto-resolved request ${req.id} (type: ${req.requestType})`);
      });
    });

    await Promise.all(updatePromises);

    console.log(`Successfully auto-resolved ${eligibleRequests.length} requests`);

    return {
      success: true,
      autoResolvedCount: eligibleRequests.length,
      message: `Auto-resolved ${eligibleRequests.length} request(s)`,
      resolvedRequestIds: eligibleRequests.map(r => r.id),
    };
  } catch (error) {
    console.error('Auto-resolve requests error:', error);
    throw error;
  }
}

/**
 * Standalone execution (for manual testing or direct cron jobs)
 */
if (require.main === module) {
  autoResolveRequests()
    .then((result) => {
      console.log('Auto-resolve completed:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Auto-resolve failed:', error);
      process.exit(1);
    });
}