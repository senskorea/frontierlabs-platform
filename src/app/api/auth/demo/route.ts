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
    const MAP_W = 30, MAP_H = 20, TILE = 32;
    const empty = new Array(MAP_W * MAP_H).fill(0);
    const defaultMapData = {
      compressionlevel: -1, width: MAP_W, height: MAP_H,
      tilewidth: TILE, tileheight: TILE,
      orientation: "orthogonal", renderorder: "right-down",
      infinite: false, type: "map", version: "1.10", tiledversion: "1.11.2",
      nextlayerid: 7, nextobjectid: 2, tilesets: [],
      layers: [
        { id: 1, name: "Floor",      type: "tilelayer",   width: MAP_W, height: MAP_H, x: 0, y: 0, opacity: 1,   visible: true, data: [...empty], properties: [{ name: "depth", type: "int",    value: 0 }] },
        { id: 2, name: "Walls",      type: "tilelayer",   width: MAP_W, height: MAP_H, x: 0, y: 0, opacity: 1,   visible: true, data: [...empty], properties: [{ name: "depth", type: "int",    value: 1 }] },
        { id: 3, name: "Foreground", type: "tilelayer",   width: MAP_W, height: MAP_H, x: 0, y: 0, opacity: 1,   visible: true, data: [...empty], properties: [{ name: "depth", type: "int",    value: 10000 }] },
        { id: 4, name: "Collision",  type: "tilelayer",   width: MAP_W, height: MAP_H, x: 0, y: 0, opacity: 0.7, visible: true, data: [...empty], properties: [{ name: "depth", type: "int",    value: -1 }] },
        { id: 5, name: "Objects",    type: "objectgroup", x: 0, y: 0, opacity: 1, visible: true, draworder: "topdown",
          objects: [{ id: 1, name: "spawn", type: "spawn", x: Math.floor(MAP_W / 2) * TILE, y: Math.floor(MAP_H / 2) * TILE, width: TILE, height: TILE, visible: true }],
          properties: [{ name: "depth", type: "string", value: "y-sort" }] },
      ],
    };
    const [created] = await db
      .insert(channels)
      .values({
        id: randomUUID(),
        name: DEMO_CHANNEL,
        description: "Active proposal pipeline for Horizon Europe EIC Accelerator — September 2025 deadline",
        ownerId: user.id,
        isPublic: true,
        maxPlayers: 50,
        mapData: jsonForDb(defaultMapData),
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
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[demo] failed:", msg);
    return NextResponse.json(
      { errorCode: "demo_error", error: `Demo error: ${msg}` },
      { status: 500 },
    );
  }
}
