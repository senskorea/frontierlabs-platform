import { db, jsonForDb } from "@/db";
import { users, characters, channels, channelMembers, npcs } from "@/db";
import { signJWT, isSecureCookie } from "@/lib/jwt";
import { hashPassword } from "@/lib/password";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

const DEMO_LOGIN_ID = "mark";
const DEMO_CHANNEL = "NeuroSync Korea — TIPS 2026 Spring Cohort";

// ── Map builder (matches seed-demo.ts layout) ─────────────────────────────────

function buildDemoMap() {
  const COLS = 30, ROWS = 20;
  const FLOOR = 1, WALL = 2, CARPET = 12;

  const floor: number[][] = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
  const walls: number[][] = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));

  // Perimeter walls
  for (let c = 0; c < COLS; c++) { walls[0][c] = WALL; walls[ROWS - 1][c] = WALL; }
  for (let r = 0; r < ROWS; r++) { walls[r][0] = WALL; walls[r][COLS - 1] = WALL; }

  // Interior floor
  for (let r = 1; r < ROWS - 1; r++)
    for (let c = 1; c < COLS - 1; c++)
      floor[r][c] = FLOOR;

  // Zone carpets
  for (let r = 1; r <= 8; r++) for (let c = 1; c <= 9; c++) floor[r][c] = CARPET;
  for (let r = 1; r <= 8; r++) for (let c = 11; c <= 19; c++) floor[r][c] = CARPET;
  for (let r = 11; r <= 18; r++) for (let c = 1; c <= 9; c++) floor[r][c] = CARPET;
  for (let r = 11; r <= 18; r++) for (let c = 11; c <= 19; c++) floor[r][c] = CARPET;
  for (let r = 1; r <= 18; r++) for (let c = 21; c <= 28; c++) floor[r][c] = CARPET;

  const objects = [
    // Scout Desk zone
    { id: randomUUID(), type: "desk",      col: 3, row: 2,  direction: "down" },
    { id: randomUUID(), type: "chair",     col: 3, row: 3,  direction: "up"   },
    { id: randomUUID(), type: "computer",  col: 4, row: 2,  direction: "down" },
    { id: randomUUID(), type: "plant",     col: 1, row: 1,  direction: "down" },
    { id: randomUUID(), type: "bookshelf", col: 8, row: 1,  direction: "down" },
    // Strategy Room zone
    { id: randomUUID(), type: "desk",          col: 13, row: 2, direction: "down" },
    { id: randomUUID(), type: "chair",         col: 13, row: 3, direction: "up"   },
    { id: randomUUID(), type: "whiteboard",    col: 11, row: 1, direction: "down" },
    { id: randomUUID(), type: "meeting_table", col: 16, row: 4, direction: "down" },
    { id: randomUUID(), type: "plant",         col: 19, row: 1, direction: "down" },
    // Writing Bay zone
    { id: randomUUID(), type: "desk",      col: 3,  row: 13, direction: "down" },
    { id: randomUUID(), type: "chair",     col: 3,  row: 14, direction: "up"   },
    { id: randomUUID(), type: "computer",  col: 4,  row: 13, direction: "down" },
    { id: randomUUID(), type: "bookshelf", col: 8,  row: 12, direction: "down" },
    { id: randomUUID(), type: "bookshelf", col: 8,  row: 13, direction: "down" },
    // Budget Corner zone
    { id: randomUUID(), type: "desk",     col: 13, row: 13, direction: "down" },
    { id: randomUUID(), type: "chair",    col: 13, row: 14, direction: "up"   },
    { id: randomUUID(), type: "computer", col: 14, row: 13, direction: "down" },
    { id: randomUUID(), type: "plant",    col: 19, row: 18, direction: "down" },
    // Team Builder zone
    { id: randomUUID(), type: "desk",          col: 24, row: 7,  direction: "down" },
    { id: randomUUID(), type: "chair",         col: 24, row: 8,  direction: "up"   },
    { id: randomUUID(), type: "meeting_table", col: 23, row: 12, direction: "down" },
    { id: randomUUID(), type: "whiteboard",    col: 28, row: 3,  direction: "down" },
    { id: randomUUID(), type: "plant",         col: 21, row: 1,  direction: "down" },
    { id: randomUUID(), type: "plant",         col: 28, row: 18, direction: "down" },
    // Shared / corridor
    { id: randomUUID(), type: "coffee",       col: 10, row: 2,  direction: "down" },
    { id: randomUUID(), type: "water_cooler", col: 20, row: 10, direction: "down" },
    { id: randomUUID(), type: "plant",        col: 1,  row: 18, direction: "down" },
  ];

  return { layers: { floor, walls }, objects };
}

// ── NPC definitions ───────────────────────────────────────────────────────────

const DEMO_AGENTS = [
  {
    name: "The Scout",
    color: "#3B82F6",
    positionX: 3, positionY: 3,
    bio: "I scan Korean government grant databases, score fit against NeuroSync's technology profile, and identify the highest-probability TIPS cohort and track for this application cycle.",
  },
  {
    name: "The Strategist",
    color: "#10B981",
    positionX: 13, positionY: 3,
    bio: "I define the grant narrative, positioning NeuroSync as Korea's national cognitive-computing infrastructure layer to match TIPS evaluator priorities around deep-tech IP and domestic manufacturing.",
  },
  {
    name: "The Writer",
    color: "#F59E0B",
    positionX: 3, positionY: 14,
    bio: "I produce the full TIPS application: technical description, impact narrative, work packages, and executive summary. Every claim is backed by a primary source from NeuroSync's uploaded documents.",
  },
  {
    name: "The Architect",
    color: "#8B5CF6",
    positionX: 13, positionY: 14,
    bio: "I build the TIPS budget framework — total project cost, government grant share, private co-investment, indirect cost rate, and 24-month milestone plan — ensuring compliance with TIPS ceiling rules.",
  },
  {
    name: "The Team Builder",
    color: "#EF4444",
    positionX: 24, positionY: 8,
    bio: "I identify and confirm the required private co-investor, research partners, and advisors that strengthen NeuroSync's eligibility and credibility under the TIPS deep-tech SME track.",
  },
];

// ── Seed function ─────────────────────────────────────────────────────────────

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
        body:      { itemKey: "body",                 variant: "light"     },
        eye_color: { itemKey: "eye_color",            variant: "brown"     },
        hair:      { itemKey: "hair_bangs",           variant: "brown"     },
        torso:     { itemKey: "torso_clothes_tshirt", variant: "teal"      },
        legs:      { itemKey: "legs_pants",           variant: "dark_grey" },
        feet:      { itemKey: "feet_shoes_basic",     variant: "black"     },
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
    const mapData = jsonForDb(buildDemoMap());
    const mapConfig = jsonForDb({ spawnCol: 10, spawnRow: 9 });

    const [created] = await db
      .insert(channels)
      .values({
        id: randomUUID(),
        name: DEMO_CHANNEL,
        description: "FrontierLabs is preparing NeuroSync Korea's TIPS grant application — Ministry of SMEs & Startups, ₩1B R&D grant, deadline 15 April 2026.",
        ownerId: user.id,
        isPublic: true,
        maxPlayers: 50,
        mapData,
        mapConfig,
      })
      .returning();
    channel = created;

    await db.insert(channelMembers).values({
      id: randomUUID(),
      channelId: channel.id,
      userId: user.id,
      role: "member",
    });
  }

  // NPCs — seed all agents if none exist in this channel
  const existingNpcs = await db.select().from(npcs).where(eq(npcs.channelId, channel.id));
  if (existingNpcs.length === 0) {
    for (const agent of DEMO_AGENTS) {
      await db.insert(npcs).values({
        id: randomUUID(),
        channelId: channel.id,
        name: agent.name,
        positionX: agent.positionX,
        positionY: agent.positionY,
        direction: "down",
        appearance: jsonForDb({ color: agent.color, type: "circle" }),
        openclawConfig: jsonForDb({ systemPrompt: agent.bio }),
        adapterType: "openclaw",
      });
    }
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
