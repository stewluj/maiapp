import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/feed - feed of active listings at user's university
// ?tab=courses  -> only course-linked listings (optionally filtered by courseId)
// ?tab=campus   -> only general marketplace listings (no course, optionally filtered by category/search)
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const tab = req.nextUrl.searchParams.get("tab") || "courses";
  const courseId = req.nextUrl.searchParams.get("courseId");
  const category = req.nextUrl.searchParams.get("category");
  const search = req.nextUrl.searchParams.get("search");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    status: "ACTIVE",
  };

  if (tab === "campus") {
    // General marketplace items (no course association)
    where.courseId = null;
    where.universityId = user.universityId;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }
  } else {
    // Course-linked listings
    if (courseId) {
      where.courseId = courseId;
    } else {
      where.course = { universityId: user.universityId };
      where.NOT = { courseId: null };
    }
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
