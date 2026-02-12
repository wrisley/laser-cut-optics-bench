import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { incidentSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireRole(req, ["referee", "organizer", "admin"]);
    const input = incidentSchema.parse(await req.json());

    const incident = await prisma.incident.create({
      data: {
        tenantId: ctx.tenantId,
        eventId: input.eventId,
        summary: input.summary,
        visibility: input.visibility,
        reportedById: ctx.userId
      }
    });

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 403 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireRole(req, ["referee", "organizer", "admin"]);
    const visibilityFilter = ctx.role === "admin" ? {} : { visibility: "staff" };
    const incidents = await prisma.incident.findMany({
      where: { tenantId: ctx.tenantId, ...visibilityFilter },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(incidents);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 403 });
  }
}
