import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/feed - unified feed of all active listings at user's university
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const courseId = req.nextUrl.searchParams.get("courseId");
  const courseSearch = req.nextUrl.searchParams.get("courseSearch");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    status: "ACTIVE",
  };

  if (courseId) {
    // Filter to a specific course
    where.courseId = courseId;
  } else if (courseSearch) {
    // Filter listings whose course matches the search text
    where.course = {
      universityId: user.universityId,
      OR: [
        { courseNumber: { contains: courseSearch } },
        { name: { contains: courseSearch } },
      ],
    };
  } else {
    // All listings at user's university (course-based + general)
    where.OR = [
      { course: { universityId: user.universityId } },
      { universityId: user.universityId },
    ];
  }

  const listings = await prisma.listing.findMany({
    where,
    include: {
      seller: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, name: true, courseNumber: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ listings });
}
