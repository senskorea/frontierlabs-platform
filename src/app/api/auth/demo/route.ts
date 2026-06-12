import { db } from "@/db";
import { users, characters, channels } from "@/db";
import { signJWT, isSecureCookie } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    let [user] = await db.select().from(users).where(eq(users.loginId, "mark")).limit(1);

    if (!user) {
      try {
        await db.insert(users).values({
          loginId: "mark",
          nickname: "Mark",
          passwordHash: "demo_hash",
        });
      } catch (e) {
        console.error("demo user insert failed:", e);
      }
      const [fetchedUser] = await db.select().from(users).where(eq(users.loginId, "mark")).limit(1);
      user = fetchedUser;
    }

    if (!user) {
      return NextResponse.json(
        { errorCode: "demo_not_seeded", error: "Demo account not found — please contact support." },
        { status: 404 },
      );
    }

    let [character] = await db.select().from(characters).where(eq(characters.userId, user.id)).limit(1);

    if (!character) {
      try {
        await db.insert(characters).values({
          userId: user.id,
          name: "Mark Character",
          appearance: "{}"
        });
      } catch (e) {
        console.error("demo character insert failed:", e);
      }
      const [fetchedChar] = await db.select().from(characters).where(eq(characters.userId, user.id)).limit(1);
      character = fetchedChar;
    }

    let [channel] = await db.select().from(channels).where(eq(channels.name, "EIC Accelerator 2025")).limit(1);

    if (!channel) {
      try {
        await db.insert(channels).values({
          name: "EIC Accelerator 2025",
          description: "Demo Channel",
          ownerId: user.id,
          isPublic: true
        });
      } catch (e) {
        console.error("demo channel insert failed:", e);
      }
      const [fetchedChannel] = await db.select().from(channels).where(eq(channels.name, "EIC Accelerator 2025")).limit(1);
      channel = fetchedChannel;
    }

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
