import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type !== "checkout.session.completed") {
      return NextResponse.json({ ignored: true });
    }

    const eventId = body.id as string;
    const registrationId = body.data?.object?.metadata?.registrationId as string;
    const amount = Number(body.data?.object?.amount_total ?? 0);
    const sessionId = body.data?.object?.id as string;

    if (!registrationId) {
      return NextResponse.json({ error: "Missing registrationId metadata" }, { status: 400 });
    }

    await prisma.payment.upsert({
      where: { stripeEventId: eventId },
      update: {},
      create: {
        stripeEventId: eventId,
        stripeSessionId: sessionId,
        registrationId,
        amountCents: amount,
        status: "reconciled"
      }
    });

    await prisma.registration.update({
      where: { id: registrationId },
      data: { status: "confirmed" }
    });

    return NextResponse.json({ reconciled: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
