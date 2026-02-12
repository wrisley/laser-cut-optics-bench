import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { id: "demo-tenant" },
    update: {},
    create: { id: "demo-tenant", name: "Demo LARP Org" }
  });

  const users = await Promise.all([
    ["organizer@demo.local", Role.organizer],
    ["player@demo.local", Role.player],
    ["ref@demo.local", Role.referee],
    ["admin@demo.local", Role.admin]
  ].map(async ([email, role]) => {
    const user = await prisma.user.upsert({
      where: { email: String(email) },
      update: {},
      create: { email: String(email), passwordHash: await bcrypt.hash("password123", 10) }
    });

    await prisma.membership.upsert({
      where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
      update: { role: role as Role },
      create: { tenantId: tenant.id, userId: user.id, role: role as Role }
    });

    return user;
  }));

  const campaign = await prisma.campaign.create({ data: { tenantId: tenant.id, name: "Demo Campaign" } });
  const event = await prisma.event.create({
    data: {
      tenantId: tenant.id,
      campaignId: campaign.id,
      name: "Spring Battle",
      capacity: 100,
      startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.ticketTier.createMany({
    data: [
      { tenantId: tenant.id, eventId: event.id, name: "Free Spectator", priceCents: 0, isPaid: false, capacity: 50 },
      { tenantId: tenant.id, eventId: event.id, name: "Player Admission", priceCents: 2500, isPaid: true, capacity: 50 }
    ]
  });

  console.log("Seed complete", { tenantId: tenant.id, userIds: users.map((u) => u.id), eventId: event.id });
}

main().finally(() => prisma.$disconnect());
