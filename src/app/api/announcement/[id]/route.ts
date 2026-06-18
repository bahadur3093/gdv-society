import { requireAuth } from "@/lib/auth/auth-helpers";
import prisma from "@/lib/prisma";
import { ApiResponse, HttpStatus } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const updateAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  content: z.string().min(1, "Content is required").optional(),
  category: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  isActive: z.boolean().optional(),
  publishDate: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
  files: z
    .array(
      z.object({
        url: z.string().url("File URL must be a valid URL"),
        name: z.string().min(1, "File name is required"),
      }),
    )
    .optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/*
 * DELETE /api/announcement/:id
 * Delete announcements by announcementid
 * Query params: id (required)
 */
export async function DELETE(_: Request, { params }: RouteParams) {
  try {
    await requireAuth();

    const { id } = await params;

    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: "Announcement id is required",
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    // Check if config exists
    const existingAnnouncement = await prisma.announcement.findFirst({
      where: { id },
    });

    if (!existingAnnouncement) {
      const response: ApiResponse = {
        success: false,
        error: `Announcement not found for id: ${id}`,
      };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

    // Delete configuration
    await prisma.announcement.delete({
      where: {
        id,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: {
        message: `Announcement deleted successfully for id: ${id}`,
      },
    };

    return NextResponse.json(response, { status: HttpStatus.OK });
  } catch (error: unknown) {
    console.error("Delete config error:", error);

    const response: ApiResponse = {
      success: false,
      error: "Failed to delete announcement",
    };
    return NextResponse.json(response, {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
}

/*
 * PATCH /api/announcement/:id
 * Update announcements by id
 * Query params: id (required)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth();

    const body = await request.json();
    const parsed = updateAnnouncementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues.map((e) => e.message).join(", "),
        },
        { status: HttpStatus.BAD_REQUEST },
      );
    }

    const { id } = await params;

    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: "Announcement id is required",
      };
      return NextResponse.json(response, { status: HttpStatus.BAD_REQUEST });
    }

    const existingAnnouncement = await prisma.announcement.findFirst({
      where: { id },
    });

    if (!existingAnnouncement) {
      const response: ApiResponse = {
        success: false,
        error: `Announcement not found for id: ${id}`,
      };
      return NextResponse.json(response, { status: HttpStatus.NOT_FOUND });
    }

    const { files, ...updateData } = parsed.data;

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...updateData,

        ...(files !== undefined && {
          files: {
            deleteMany: {},
            create: files,
          },
        }),
      },
      include: { files: true },
    });

    return NextResponse.json({
      success: true,
      data: announcement,
      message: "Announcement updated successfully",
    });
  } catch (error: unknown) {
    console.error("Delete config error:", error);

    const response: ApiResponse = {
      success: false,
      error: "Failed to update announcement",
    };
    return NextResponse.json(response, {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
}
