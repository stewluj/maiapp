import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/users?search=... - search for students at the same university
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const search = req.nextUrl.searchParams.get("search") || "";

  if (search.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const users = await prisma.user.findMany({
    where: {
      universityId: user.universityId,
      NOT: { id: user.id },
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    take: 10,
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ users });
}
