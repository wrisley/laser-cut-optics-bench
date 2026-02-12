import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export type RequestContext = { userId: string; tenantId: string; role: Role };

export async function requireRole(req: NextRequest, allowed: Role[]): Promise<RequestContext> {
  const userId = req.headers.get("x-user-id");
  const tenantId = req.headers.get("x-tenant-id");
  if (!userId || !tenantId) throw new Error("Missing X-User-Id or X-Tenant-Id headers");

  const membership = await prisma.membership.findUnique({
    where: { tenantId_userId: { tenantId, userId } }
  });

  if (!membership || !allowed.includes(membership.role)) {
    throw new Error("Forbidden");
  }

  return { userId, tenantId, role: membership.role };
}
