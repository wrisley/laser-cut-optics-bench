import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validation";
import { verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const input = signupSchema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    return NextResponse.json({ userId: user.id, message: "Use X-User-Id header for protected API calls" });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
