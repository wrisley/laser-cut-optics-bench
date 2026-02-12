import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const campaignSchema = z.object({ name: z.string().min(2) });

export const eventSchema = z.object({
  name: z.string().min(2),
  capacity: z.number().int().positive(),
  startsAt: z.string().datetime(),
  campaignId: z.string().optional()
});

export const ticketTierSchema = z.object({
  eventId: z.string(),
  name: z.string().min(2),
  priceCents: z.number().int().nonnegative(),
  capacity: z.number().int().positive()
});

export const registrationSchema = z.object({
  eventId: z.string(),
  ticketTierId: z.string()
});

export const checkinSchema = z.object({
  eventId: z.string(),
  registrationId: z.string()
});

export const incidentSchema = z.object({
  eventId: z.string(),
  summary: z.string().min(5),
  visibility: z.enum(["staff", "admin"]).default("staff")
});
