import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { eventSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireRole(req, ["organizer", "admin"]);
    const input = eventSchema.parse(await req.json());
    const event = await prisma.event.create({
      data: {
        tenantId: ctx.tenantId,
        campaignId: input.campaignId,
        name: input.name,
        capacity: input.capacity,
        startsAt: new Date(input.startsAt)
      }
    });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 403 });
  }
}
