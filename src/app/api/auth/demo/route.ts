import { db } from "@/db";
import { users, characters, channels } from "@/db";
import { signJWT, isSecureCookie } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const [user] = await db.select().from(users).where(eq(users.loginId, "mark")).limit(1);

    if (!user) {
      return NextResponse.json(
        { errorCode: "demo_not_seeded", error: "Demo account not found — please contact support." },
        { status: 404 },
      );
    }

    const [character] = await db.select().from(characters).where(eq(characters.userId, user.id)).limit(1);
    const [channel] = await db.select().from(channels).where(eq(channels.name, "EIC Accelerator 2025")).limit(1);

    const token = await signJWT({ userId: user.id, nickname: user.nickname });

    const response = NextResponse.json({
      user: { id: user.id, nickname: user.nickname },
      characterId: character?.id ?? null,
      channelId: channel?.id ?? null,
    });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: isSecureCookie(),
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[demo] failed:", err);
    return NextResponse.json(
      { errorCode: "demo_error", error: "Demo unavailable — please try again." },
      { status: 500 },
    );
  }
}
