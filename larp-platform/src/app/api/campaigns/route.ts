import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { campaignSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireRole(req, ["organizer", "admin"]);
    const input = campaignSchema.parse(await req.json());
    const campaign = await prisma.campaign.create({ data: { tenantId: ctx.tenantId, name: input.name } });
    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 403 });
  }
}
