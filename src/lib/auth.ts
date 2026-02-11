import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { cookies } from "next/headers";

const SESSION_COOKIE = "mai_session";

// Simple token-based session (no external auth library needed for MVP)
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function extractEmailDomain(email: string): string {
  return email.split("@")[1]?.toLowerCase() ?? "";
}

export function isEduEmail(email: string): boolean {
  return email.toLowerCase().endsWith(".edu");
}

export async function createSession(userId: string): Promise<string> {
  const token = uuid();
  // Store session token in a cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, `${userId}:${token}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
  return token;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session?.value) return null;

  const userId = session.value.split(":")[0];
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { university: true },
  });

  return user;
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
