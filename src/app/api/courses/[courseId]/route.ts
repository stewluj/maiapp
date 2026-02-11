import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/courses/[courseId] - get a single course with enrollment status
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      _count: { select: { listings: { where: { status: "ACTIVE" } }, enrollments: true } },
    },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Check if user is enrolled
  const enrollment = await prisma.userCourse.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  });

  return NextResponse.json({
    course,
    enrollment: enrollment ? { id: enrollment.id, status: enrollment.status } : null,
  });
}
