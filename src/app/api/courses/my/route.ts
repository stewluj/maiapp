import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/courses/my - get user's enrolled courses
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const enrollments = await prisma.userCourse.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          _count: { select: { listings: true } },
        },
      },
    },
  });

  return NextResponse.json({ enrollments });
}

// POST /api/courses/my - add a course
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { courseId, status } = await req.json();

  if (!courseId || !status) {
    return NextResponse.json({ error: "courseId and status are required" }, { status: 400 });
  }

  if (!["TAKING", "TOOK"].includes(status)) {
    return NextResponse.json({ error: "Status must be TAKING or TOOK" }, { status: 400 });
  }

  // Verify course belongs to user's university
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.universityId !== user.universityId) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const enrollment = await prisma.userCourse.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    update: { status },
    create: { userId: user.id, courseId, status },
    include: { course: true },
  });

  return NextResponse.json({ enrollment });
}

// DELETE /api/courses/my - remove a course
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { courseId } = await req.json();

  await prisma.userCourse.deleteMany({
    where: { userId: user.id, courseId },
  });

  return NextResponse.json({ success: true });
}
