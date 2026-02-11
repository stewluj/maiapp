import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// POST /api/courses/create - let users add a course that doesn't exist yet
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { courseNumber, name, department } = body;

  if (!courseNumber || !name) {
    return NextResponse.json(
      { error: "Course number and name are required" },
      { status: 400 }
    );
  }

  // Check if course already exists at this university
  const existing = await prisma.course.findUnique({
    where: {
      universityId_courseNumber: {
        universityId: user.universityId,
        courseNumber: courseNumber.trim().toUpperCase(),
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "This course already exists", course: existing },
      { status: 409 }
    );
  }

  const course = await prisma.course.create({
    data: {
      courseNumber: courseNumber.trim().toUpperCase(),
      name: name.trim(),
      department: department?.trim() || null,
      universityId: user.universityId,
    },
    include: {
      _count: { select: { listings: true, enrollments: true } },
    },
  });

  return NextResponse.json({ course }, { status: 201 });
}
