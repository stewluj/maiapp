import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/marketplace - get general marketplace listings (non-course items)
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const category = req.nextUrl.searchParams.get("category");
  const search = req.nextUrl.searchParams.get("search");

  const where: Record<string, unknown> = {
    status: "ACTIVE",
    courseId: null, // General marketplace items have no course
    universityId: user.universityId,
  };

  if (category) {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const listings = await prisma.listing.findMany({
    where,
    include: {
      seller: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ listings });
}

// POST /api/marketplace - create a general marketplace listing
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { title, description, price, category, condition, imageUrl } = await req.json();

  if (!title || !category) {
    return NextResponse.json({ error: "Title and category are required" }, { status: 400 });
  }

  const listing = await prisma.listing.create({
    data: {
      title,
      description,
      price: price ? parseFloat(price) : null,
      category,
      type: "SELLING",
      condition,
      imageUrl: imageUrl || null,
      sellerId: user.id,
      universityId: user.universityId,
    },
    include: {
      seller: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({ listing });
}
