import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ticketTierSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireRole(req, ["organizer", "admin"]);
    const input = ticketTierSchema.parse(await req.json());

    const tier = await prisma.ticketTier.create({
      data: {
        tenantId: ctx.tenantId,
        eventId: input.eventId,
        name: input.name,
        priceCents: input.priceCents,
        capacity: input.capacity,
        isPaid: input.priceCents > 0
      }
    });

    return NextResponse.json(tier, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 403 });
  }
}
