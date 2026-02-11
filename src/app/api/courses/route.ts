import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/courses - get courses for user's university (searchable)
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const search = req.nextUrl.searchParams.get("search") || "";

  const courses = await prisma.course.findMany({
    where: {
      universityId: user.universityId,
      OR: search
        ? [
            { name: { contains: search, mode: "insensitive" as const } },
            { courseNumber: { contains: search, mode: "insensitive" as const } },
            { department: { contains: search, mode: "insensitive" as const } },
          ]
        : undefined,
    },
    include: {
      _count: { select: { listings: true, enrollments: true } },
    },
    orderBy: { courseNumber: "asc" },
  });

  return NextResponse.json({ courses });
}
