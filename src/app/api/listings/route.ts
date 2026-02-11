import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/listings - get listings for a course or user's courses
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const courseId = req.nextUrl.searchParams.get("courseId");
  const type = req.nextUrl.searchParams.get("type");
  const category = req.nextUrl.searchParams.get("category");
  const mine = req.nextUrl.searchParams.get("mine");
  const search = req.nextUrl.searchParams.get("search");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { status: "ACTIVE" };

  if (courseId) {
    where.courseId = courseId;
  } else {
    // Only show listings from the user's university
    where.course = { universityId: user.universityId };
    where.NOT = { courseId: null };
  }

  if (type && ["SELLING", "LOOKING_FOR"].includes(type)) {
    where.type = type;
  }

  if (category) {
    where.category = category;
  }

  if (mine === "true") {
    where.sellerId = user.id;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { course: { name: { contains: search, mode: "insensitive" } } },
      { course: { courseNumber: { contains: search, mode: "insensitive" } } },
      { course: { department: { contains: search, mode: "insensitive" } } },
    ];
  }

  const listings = await prisma.listing.findMany({
    where,
    include: {
      seller: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, name: true, courseNumber: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ listings });
}

// POST /api/listings - create a listing
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { title, description, price, category, type, condition, courseId } = await req.json();

  if (!title || !category || !type || !courseId) {
    return NextResponse.json({ error: "Title, category, type, and courseId are required" }, { status: 400 });
  }

  // Verify the course belongs to user's university
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.universityId !== user.universityId) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const listing = await prisma.listing.create({
    data: {
      title,
      description,
      price: price ? parseFloat(price) : null,
      category,
      type,
      condition,
      courseId,
      sellerId: user.id,
    },
    include: {
      seller: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, name: true, courseNumber: true } },
    },
  });

  return NextResponse.json({ listing });
}
