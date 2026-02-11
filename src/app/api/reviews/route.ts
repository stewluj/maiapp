import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/reviews?sellerId=xxx - get reviews for a seller
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const sellerId = req.nextUrl.searchParams.get("sellerId");
  if (!sellerId) {
    return NextResponse.json({ error: "sellerId is required" }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: { sellerId },
    include: {
      reviewer: { select: { id: true, name: true } },
      listing: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate average rating
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  return NextResponse.json({
    reviews,
    stats: {
      count: reviews.length,
      averageRating: Math.round(averageRating * 10) / 10,
    },
  });
}

// POST /api/reviews - create a review for a seller
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { sellerId, rating, comment, listingId } = await req.json();

  if (!sellerId || !rating) {
    return NextResponse.json({ error: "sellerId and rating are required" }, { status: 400 });
  }

  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return NextResponse.json({ error: "Rating must be an integer between 1 and 5" }, { status: 400 });
  }

  if (sellerId === user.id) {
    return NextResponse.json({ error: "You cannot review yourself" }, { status: 400 });
  }

  // Check if user already reviewed this seller for this listing
  const existing = await prisma.review.findUnique({
    where: {
      reviewerId_sellerId_listingId: {
        reviewerId: user.id,
        sellerId,
        listingId: listingId || null,
      },
    },
  });

  if (existing) {
    return NextResponse.json({ error: "You have already reviewed this seller" }, { status: 409 });
  }

  const review = await prisma.review.create({
    data: {
      rating,
      comment: comment || null,
      reviewerId: user.id,
      sellerId,
      listingId: listingId || null,
    },
    include: {
      reviewer: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ review });
}
