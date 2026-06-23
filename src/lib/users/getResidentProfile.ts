import "server-only";
import { prisma } from "@/lib/prisma";

export interface ResidentProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: Date | null;
    plotNumber: string | null;
    createdAt: Date;
  };
  villa: {
    id: string;
    villaNo: number;
    type: string;
    areaInSqFt: number;
    ownerName: string;
  } | null;
  familyMembers: Array<{
    id: string;
    name: string;
    relationship: string;
    contact: string;
    addedAt: Date;
  }>;
}

export async function getResidentProfile(
  userId: string,
): Promise<ResidentProfileData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId, role: "RESIDENT" },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      plotNumber: true,
      createdAt: true,
      villa: {
        select: {
          id: true,
          villaNo: true,
          type: true,
          areaInSqFt: true,
          ownerName: true,
        },
      },
      familyMembers: {
        select: {
          id: true,
          name: true,
          relationship: true,
          contact: true,
          addedAt: true,
        },
        orderBy: { addedAt: "desc" },
      },
    },
  });

  if (!user) return null;

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      plotNumber: user.plotNumber,
      createdAt: user.createdAt,
    },
    villa: user.villa,
    familyMembers: user.familyMembers,
  };
}
