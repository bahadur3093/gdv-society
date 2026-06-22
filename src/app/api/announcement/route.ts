import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { HttpStatus } from "@/types";
import { requireAdmin } from "@/lib/auth/auth";

// Validation schema for creating a new announcement
const createAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().default("General"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  isActive: z.boolean().default(true),
  publishDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : new Date())),
  files: z
    .array(
      z.object({
        url: z.string().url("File URL must be a valid URL"),
        name: z.string().min(1, "File name is required"),
      }),
    )
    .optional(),
});

/**
 * GET /api/announcement
 * Fetch all announcements (with optional filtering)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") !== "false";
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : undefined;

    const announcements = await prisma.announcement.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: {
        files: true,
      },
      orderBy: {
        publishDate: "desc",
      },
      take: limit,
    });

    return NextResponse.json(
      {
        success: true,
        data: announcements,
      },
      { status: HttpStatus.OK },
    );
  } catch (error: any) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch announcements",
      },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    );
  }
}

/**
 * PUT /api/announcement
 * Create a new announcement (Admin only)
 * Query params: id
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const parsed = createAnnouncementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues.map((e) => e.message).join(", "),
        },
        { status: HttpStatus.BAD_REQUEST },
      );
    }

    const { files, ...announcementData } = parsed.data;

    const announcement = await prisma.announcement.create({
      data: {
        ...announcementData,
        files:
          files && files.length > 0
            ? {
                create: files,
              }
            : undefined,
      },
      include: {
        files: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: announcement,
        message: "Announcement created successfully",
      },
      { status: HttpStatus.CREATED },
    );
  } catch (error: any) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create announcement",
      },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    );
  }
}
