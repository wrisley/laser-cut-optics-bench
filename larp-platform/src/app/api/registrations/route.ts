import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { registrationSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireRole(req, ["player", "organizer", "admin"]);
    const input = registrationSchema.parse(await req.json());

    const tier = await prisma.ticketTier.findFirst({
      where: { id: input.ticketTierId, eventId: input.eventId, tenantId: ctx.tenantId }
    });
    if (!tier) return NextResponse.json({ error: "Tier not found" }, { status: 404 });

    const status = tier.isPaid ? "pending" : "confirmed";
    const registration = await prisma.registration.create({
      data: { tenantId: ctx.tenantId, eventId: input.eventId, userId: ctx.userId, ticketTierId: tier.id, status }
    });

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 403 });
  }
}
