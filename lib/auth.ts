import { createHash, randomBytes, randomInt } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "pearl_session";
export const USER_ROLES = ["owner", "staff", "customer"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function normalizePhone(phone: string) {
  const trimmed = phone.trim().replace(/[^\d+]/g, "");

  if (trimmed.startsWith("+")) {
    return `+${trimmed.slice(1).replace(/\D/g, "")}`;
  }

  return trimmed.replace(/\D/g, "");
}

export function isUserRole(value: string): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}

export function hashSecret(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function createVerificationCode() {
  return String(randomInt(100000, 1000000));
}

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      tokenHash: hashSecret(token),
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashSecret(token) },
    });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSecret(token) },
    include: { user: { include: { staff: true } } },
  });

  if (!session || session.expiresAt <= new Date()) {
    return null;
  }

  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireOwner() {
  const user = await requireUser();

  if (user.role !== "owner") {
    redirect(user.role === "staff" ? "/staff-calendar" : "/book");
  }

  return user;
}

export async function requireStaffOrOwner() {
  const user = await requireUser();

  if (user.role !== "owner" && user.role !== "staff") {
    redirect("/book");
  }

  return user;
}
