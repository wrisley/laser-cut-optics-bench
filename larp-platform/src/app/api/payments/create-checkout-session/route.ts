import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireRole(req, ["player", "admin", "organizer"]);
    const { registrationId } = await req.json();

    const registration = await prisma.registration.findFirst({
      where: { id: registrationId, tenantId: ctx.tenantId },
      include: { ticketTier: true }
    });

    if (!registration) return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    if (!registration.ticketTier.isPaid) {
      return NextResponse.json({ message: "No payment required" });
    }

    return NextResponse.json({
      checkoutUrl: "https://checkout.stripe.com/test-session-placeholder",
      note: "Replace with Stripe SDK session creation in production"
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 403 });
  }
}
