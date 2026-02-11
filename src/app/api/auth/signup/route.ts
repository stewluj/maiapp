import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, isEduEmail, extractEmailDomain, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, name, password } = await req.json();

  if (!email || !name || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (!isEduEmail(email)) {
    return NextResponse.json({ error: "A valid .edu email address is required" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
  }

  const domain = extractEmailDomain(email);
  let university = await prisma.university.findUnique({ where: { emailDomain: domain } });

  if (!university) {
    return NextResponse.json({ error: "Your university is not yet supported. Contact us to add it!" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name,
      passwordHash,
      emailVerified: true, // Skip email verification for MVP
      universityId: university.id,
    },
  });

  await createSession(user.id);

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, universityId: user.universityId },
  });
}
