import { db, jsonForDb } from "@/db";
import { users, characters, channels, channelMembers } from "@/db";
import { signJWT, isSecureCookie } from "@/lib/jwt";
import { hashPassword } from "@/lib/password";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

const DEMO_LOGIN_ID = "mark";
const DEMO_CHANNEL = "EIC Accelerator 2025";

async function ensureDemoData() {
  // User
  let [user] = await db.select().from(users).where(eq(users.loginId, DEMO_LOGIN_ID)).limit(1);
  if (!user) {
    const passwordHash = await hashPassword("demo1234");
    const [created] = await db
      .insert(users)
      .values({ id: randomUUID(), loginId: DEMO_LOGIN_ID, nickname: "Mark", passwordHash, systemRole: "user" })
      .returning();
    user = created;
  }

  // Character
  let [character] = await db.select().from(characters).where(eq(characters.userId, user.id)).limit(1);
  if (!character) {
    const appearance = jsonForDb({
      bodyType: "male",
      layers: {
        body: { itemKey: "body", variant: "light" },
        eye_color: { itemKey: "eye_color", variant: "brown" },
        hair: { itemKey: "hair_bangs", variant: "brown" },
        torso: { itemKey: "torso_clothes_tshirt", variant: "teal" },
        legs: { itemKey: "legs_pants", variant: "dark_grey" },
        feet: { itemKey: "feet_shoes_basic", variant: "black" },
      },
    });
    const [created] = await db
      .insert(characters)
      .values({ id: randomUUID(), userId: user.id, name: "Mark", appearance })
      .returning();
    character = created;
  }

  // Channel
  let [channel] = await db.select().from(channels).where(eq(channels.name, DEMO_CHANNEL)).limit(1);
  if (!channel) {
    const [created] = await db
      .insert(channels)
      .values({
        id: randomUUID(),
        name: DEMO_CHANNEL,
        description: "Active proposal pipeline for Horizon Europe EIC Accelerator — September 2025 deadline",
        ownerId: user.id,
        isPublic: true,
        maxPlayers: 50,
      })
      .returning();
    channel = created;

    // Add mark as member
    await db.insert(channelMembers).values({
      id: randomUUID(),
      channelId: channel.id,
      userId: user.id,
      role: "member",
    });
  }

  return { user, character, channel };
}

export async function POST() {
  try {
    const { user, character, channel } = await ensureDemoData();
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
