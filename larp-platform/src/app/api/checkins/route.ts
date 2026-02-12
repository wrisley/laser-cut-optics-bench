import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { checkinSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireRole(req, ["referee", "organizer", "admin"]);
    const input = checkinSchema.parse(await req.json());

    const registration = await prisma.registration.findFirst({
      where: { id: input.registrationId, eventId: input.eventId, tenantId: ctx.tenantId, status: "confirmed" }
    });

    if (!registration) {
      return NextResponse.json({ error: "Confirmed registration not found" }, { status: 404 });
    }

    const checkin = await prisma.checkIn.create({
      data: {
        tenantId: ctx.tenantId,
        eventId: input.eventId,
        registrationId: input.registrationId,
        checkedInById: ctx.userId
      }
    });

    return NextResponse.json(checkin, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 403 });
  }
}
