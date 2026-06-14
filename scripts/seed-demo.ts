// scripts/seed-demo.ts — FrontierLabs demo data seed (NeuroSync Korea)
// Usage: npx tsx scripts/seed-demo.ts
// Safe to run multiple times (idempotent — skips if user already exists)

import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import path from "node:path";

const DB_PATH = process.env.SQLITE_PATH || "data/deskrpg.db";
const db = new Database(path.resolve(DB_PATH));
db.pragma("foreign_keys = ON");

const now = new Date().toISOString();

// ── Map layout helpers ────────────────────────────────────────────────────────

const COLS = 30, ROWS = 20;
const FLOOR = 1, WALL = 2, CARPET = 12;

function buildMap() {
  const floor: number[][] = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
  const walls: number[][] = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));

  // Perimeter walls
  for (let c = 0; c < COLS; c++) { walls[0][c] = WALL; walls[ROWS-1][c] = WALL; }
  for (let r = 0; r < ROWS; r++) { walls[r][0] = WALL; walls[r][COLS-1] = WALL; }

  // Interior: fill all as floor
  for (let r = 1; r < ROWS-1; r++)
    for (let c = 1; c < COLS-1; c++)
      floor[r][c] = FLOOR;

  // Zone carpets
  // Scout Desk:     rows 1-8,   cols 1-9
  for (let r = 1; r <= 8; r++) for (let c = 1; c <= 9; c++) floor[r][c] = CARPET;
  // Strategy Room:  rows 1-8,   cols 11-19
  for (let r = 1; r <= 8; r++) for (let c = 11; c <= 19; c++) floor[r][c] = CARPET;
  // Writing Bay:    rows 11-18, cols 1-9
  for (let r = 11; r <= 18; r++) for (let c = 1; c <= 9; c++) floor[r][c] = CARPET;
  // Budget Corner:  rows 11-18, cols 11-19
  for (let r = 11; r <= 18; r++) for (let c = 11; c <= 19; c++) floor[r][c] = CARPET;
  // Team Builder:   rows 1-18,  cols 21-28
  for (let r = 1; r <= 18; r++) for (let c = 21; c <= 28; c++) floor[r][c] = CARPET;
  // Horizontal corridor: rows 9-10, cols 1-28 stays FLOOR (already set)

  const objects = [
    // ── Scout Desk zone ──
    { id: randomUUID(), type: "desk",      col: 3, row: 2, direction: "down" },
    { id: randomUUID(), type: "chair",     col: 3, row: 3, direction: "up"   },
    { id: randomUUID(), type: "computer",  col: 4, row: 2, direction: "down" },
    { id: randomUUID(), type: "plant",     col: 1, row: 1, direction: "down" },
    { id: randomUUID(), type: "bookshelf", col: 8, row: 1, direction: "down" },

    // ── Strategy Room zone ──
    { id: randomUUID(), type: "desk",          col: 13, row: 2, direction: "down" },
    { id: randomUUID(), type: "chair",         col: 13, row: 3, direction: "up"   },
    { id: randomUUID(), type: "whiteboard",    col: 11, row: 1, direction: "down" },
    { id: randomUUID(), type: "meeting_table", col: 16, row: 4, direction: "down" },
    { id: randomUUID(), type: "plant",         col: 19, row: 1, direction: "down" },

    // ── Writing Bay zone ──
    { id: randomUUID(), type: "desk",      col: 3, row: 13, direction: "down" },
    { id: randomUUID(), type: "chair",     col: 3, row: 14, direction: "up"   },
    { id: randomUUID(), type: "computer",  col: 4, row: 13, direction: "down" },
    { id: randomUUID(), type: "bookshelf", col: 8, row: 12, direction: "down" },
    { id: randomUUID(), type: "bookshelf", col: 8, row: 13, direction: "down" },

    // ── Budget Corner zone ──
    { id: randomUUID(), type: "desk",     col: 13, row: 13, direction: "down" },
    { id: randomUUID(), type: "chair",    col: 13, row: 14, direction: "up"   },
    { id: randomUUID(), type: "computer", col: 14, row: 13, direction: "down" },
    { id: randomUUID(), type: "plant",    col: 19, row: 18, direction: "down" },

    // ── Team Builder zone ──
    { id: randomUUID(), type: "desk",          col: 24, row: 7,  direction: "down" },
    { id: randomUUID(), type: "chair",         col: 24, row: 8,  direction: "up"   },
    { id: randomUUID(), type: "meeting_table", col: 23, row: 12, direction: "down" },
    { id: randomUUID(), type: "whiteboard",    col: 28, row: 3,  direction: "down" },
    { id: randomUUID(), type: "plant",         col: 21, row: 1,  direction: "down" },
    { id: randomUUID(), type: "plant",         col: 28, row: 18, direction: "down" },

    // ── Shared / corridor ──
    { id: randomUUID(), type: "coffee",      col: 10, row: 2,  direction: "down" },
    { id: randomUUID(), type: "water_cooler",col: 20, row: 10, direction: "down" },
    { id: randomUUID(), type: "plant",       col: 1,  row: 18, direction: "down" },
  ];

  return { layers: { floor, walls }, objects };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const existingUser = db.prepare("SELECT id FROM users WHERE login_id = ?").get("mark") as { id: string } | undefined;
  if (existingUser) {
    console.log("✓ Demo user already exists — skipping seed.");
    db.close();
    return;
  }

  // ── 1. User ────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const userId = randomUUID();
  db.prepare(`INSERT INTO users (id, login_id, nickname, password_hash, system_role, created_at, updated_at) VALUES (?, ?, ?, ?, 'user', ?, ?)`)
    .run(userId, "mark", "Mark", passwordHash, now, now);
  console.log("✓ Created user: mark / demo1234");

  // ── 2. Character ───────────────────────────────────────────────────────────
  const characterId = randomUUID();
  const appearance = JSON.stringify({
    bodyType: "male",
    layers: {
      body:   { itemKey: "body",                variant: "light"     },
      eye_color: { itemKey: "eye_color",        variant: "brown"     },
      hair:   { itemKey: "hair_bangs",          variant: "brown"     },
      torso:  { itemKey: "torso_clothes_tshirt",variant: "teal"      },
      legs:   { itemKey: "legs_pants",          variant: "dark_grey" },
      feet:   { itemKey: "feet_shoes_basic",    variant: "black"     },
    },
  });
  db.prepare(`INSERT INTO characters (id, user_id, name, appearance, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(characterId, userId, "Mark", appearance, now, now);
  console.log("✓ Created character: Mark");

  // ── 3. Channel ─────────────────────────────────────────────────────────────
  const channelId = randomUUID();
  const mapData = JSON.stringify(buildMap());
  const mapConfig = JSON.stringify({ spawnCol: 10, spawnRow: 9 });

  db.prepare(`INSERT INTO channels (id, name, description, owner_id, is_public, max_players, map_data, map_config, created_at, updated_at) VALUES (?, ?, ?, ?, 1, 50, ?, ?, ?, ?)`)
    .run(channelId, "NeuroSync Korea — Series A 2026",
      "FrontierLabs is preparing NeuroSync Korea's ₩6B Series A pitch targeting Samsung Ventures and Kakao Ventures.",
      userId, mapData, mapConfig, now, now);
  console.log("✓ Created channel: NeuroSync Korea — Series A 2026");

  db.prepare(`INSERT INTO channel_members (id, channel_id, user_id, role, joined_at) VALUES (?, ?, ?, 'member', ?)`)
    .run(randomUUID(), channelId, userId, now);
  console.log("✓ Added Mark as channel member");

  // ── 4. NPCs ────────────────────────────────────────────────────────────────
  const AGENTS = [
    {
      name: "The Scout",
      color: "#3B82F6",
      x: 3, y: 3,
      bio: "I scan Korean and global investor databases, score fit against NeuroSync's profile, and identify the highest-probability targets for this round.",
    },
    {
      name: "The Strategist",
      color: "#10B981",
      x: 13, y: 3,
      bio: "I define the investment narrative, positioning NeuroSync as a neuro-data infrastructure company — not a device company — to match Samsung Ventures' Next Paradigm thesis.",
    },
    {
      name: "The Writer",
      color: "#F59E0B",
      x: 3, y: 14,
      bio: "I produce the pitch deck, executive summary, and data room. Every claim is backed by a primary source from NeuroSync's uploaded documents.",
    },
    {
      name: "The Architect",
      color: "#8B5CF6",
      x: 13, y: 14,
      bio: "I build the financial model — raise size, valuation, use of funds, and runway — and stress-test it against Series A benchmarks in the Korean deep-tech market.",
    },
    {
      name: "The Team Builder",
      color: "#EF4444",
      x: 24, y: 8,
      bio: "I identify co-investors, advisors, and board candidates who strengthen NeuroSync's credibility with Samsung Ventures and Kakao Ventures.",
    },
  ];

  const npcIds: Record<string, string> = {};
  for (const agent of AGENTS) {
    const npcId = randomUUID();
    npcIds[agent.name] = npcId;
    const npcAppearance = JSON.stringify({ color: agent.color, type: "circle" });
    const openclawConfig = JSON.stringify({ systemPrompt: agent.bio });
    db.prepare(`INSERT INTO npcs (id, channel_id, name, position_x, position_y, direction, appearance, openclaw_config, adapter_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'down', ?, ?, 'openclaw', ?, ?)`)
      .run(npcId, channelId, agent.name, agent.x, agent.y, npcAppearance, openclawConfig, now, now);
    console.log(`✓ Created NPC: ${agent.name}`);
  }

  // ── 5. Pre-written chat messages ───────────────────────────────────────────
  const CHAT = [
    {
      npc: "The Scout",
      content: "I've screened 847 Korean VC contacts. Samsung Ventures scores 94/100 fit — their 'Next Paradigm' fund targets exactly this TRL range. Lead partner: Lee Min-jun. First meeting window: 14 March 2026.",
    },
    {
      npc: "The Strategist",
      content: "Positioning locked. NeuroSync is not a BCI device company — it's Korea's first neuro-data infrastructure layer. That framing maps directly to Samsung's thesis and avoids the medical device regulatory question entirely.",
    },
    {
      npc: "The Writer",
      content: "Pitch deck complete: 14 slides, zero filler. Executive summary: one page. Data room indexed: 47 documents. Every claim is backed by a primary source. Ready to send to Samsung Ventures on your instruction.",
    },
    {
      npc: "The Architect",
      content: "Raise: ₩6B at ₩30B pre-money valuation. Use of funds: 35% R&D, 30% clinical validation at KAIST, 25% Korea/Japan expansion, 10% operations. Runway: 32 months. Break-even confirmed at month 26.",
    },
    {
      npc: "The Team Builder",
      content: "Lead investor confirmed: Samsung Ventures (₩4B). Co-investor confirmed: Kakao Ventures (₩2B). Board advisor added: Prof. Kim Hyun-soo, KAIST BCI Lab Director. All reference checks cleared.",
    },
    {
      npc: "The Scout",
      content: "Follow-up meeting with Samsung Ventures confirmed for 21 March 2026. Term sheet expected within 10 business days. We are on track.",
    },
  ];

  for (const msg of CHAT) {
    db.prepare(`INSERT INTO chat_messages (id, character_id, npc_id, role, content, created_at) VALUES (?, ?, ?, 'assistant', ?, ?)`)
      .run(randomUUID(), characterId, npcIds[msg.npc], msg.content, now);
  }
  console.log("✓ Seeded 6 pre-written chat messages");

  // ── 6. Tasks ───────────────────────────────────────────────────────────────
  const TASKS = [
    {
      npc: "The Scout",
      title: "Confirm Samsung Ventures meeting — 14 March 2026",
      summary: "Lee Min-jun (Samsung Ventures) confirmed for 14 March. Prepare briefing note: NeuroSync profile, ask, three key differentiators. Send 48 hours before meeting.",
      status: "in_progress",
    },
    {
      npc: "The Strategist",
      title: "Validate NeuroSync narrative against Kakao Ventures thesis",
      summary: "Kakao Ventures 2026 fund focuses on AI-native B2B infrastructure. Cross-check NeuroSync positioning deck against their published investment criteria. Flag any gaps.",
      status: "in_progress",
    },
    {
      npc: "The Writer",
      title: "Finalise Series A pitch deck",
      summary: "14-slide deck. Slides 1-5 complete. Slides 6-10 (traction, team, market) in draft. Slides 11-14 (financials, ask, roadmap) pending Architect sign-off. Target: investor-ready by 10 March 2026.",
      status: "in_progress",
    },
    {
      npc: "The Architect",
      title: "Run sensitivity analysis on ₩6B raise",
      summary: "Model three scenarios: base (₩6B / ₩30B pre-money), conservative (₩4B / ₩22B), stretch (₩8B / ₩38B). Output: runway, break-even, dilution table for each. Needed for slide 12.",
      status: "in_progress",
    },
    {
      npc: "The Team Builder",
      title: "Secure KAIST IP licensing confirmation letter",
      summary: "Samsung Ventures requires written confirmation that NeuroSync holds exclusive commercial rights to the KAIST BCI patent family. Contact: Prof. Kim Hyun-soo. Deadline: 7 March 2026.",
      status: "in_progress",
    },
  ];

  for (const task of TASKS) {
    db.prepare(`INSERT INTO tasks (id, channel_id, npc_id, assigner_id, npc_task_id, title, summary, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(randomUUID(), channelId, npcIds[task.npc], characterId, randomUUID(), task.title, task.summary, task.status, now, now);
    console.log(`✓ Created task: ${task.title.slice(0, 50)}…`);
  }

  console.log("\n🎉 Demo seed complete — NeuroSync Korea Series A 2026");
  console.log("   Login at http://localhost:3000 with mark / demo1234");
  db.close();
}

main().catch((err) => { console.error(err); process.exit(1); });
