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
    .run(channelId, "NeuroSync Korea — TIPS 2026 Spring Cohort",
      "FrontierLabs is preparing NeuroSync Korea's TIPS grant application — Ministry of SMEs & Startups, ₩1B R&D grant, deadline 15 April 2026.",
      userId, mapData, mapConfig, now, now);
  console.log("✓ Created channel: NeuroSync Korea — TIPS 2026 Spring Cohort");

  db.prepare(`INSERT INTO channel_members (id, channel_id, user_id, role, joined_at) VALUES (?, ?, ?, 'member', ?)`)
    .run(randomUUID(), channelId, userId, now);
  console.log("✓ Added Mark as channel member");

  // ── 4. NPCs ────────────────────────────────────────────────────────────────
  const AGENTS = [
    {
      name: "The Scout",
      color: "#3B82F6",
      x: 3, y: 3,
      bio: "I scan Korean government grant databases, score fit against NeuroSync's technology profile, and identify the highest-probability TIPS cohort and track for this application cycle.",
    },
    {
      name: "The Strategist",
      color: "#10B981",
      x: 13, y: 3,
      bio: "I define the grant narrative, positioning NeuroSync as Korea's national cognitive-computing infrastructure layer — not a device company — to match TIPS evaluator priorities around deep-tech IP and domestic manufacturing.",
    },
    {
      name: "The Writer",
      color: "#F59E0B",
      x: 3, y: 14,
      bio: "I produce the full TIPS application: technical description, impact narrative, work packages, and executive summary. Every claim is backed by a primary source from NeuroSync's uploaded documents and KAIST patent filings.",
    },
    {
      name: "The Architect",
      color: "#8B5CF6",
      x: 13, y: 14,
      bio: "I build the TIPS budget framework — total project cost, government grant share, private co-investment, indirect cost rate, and 24-month milestone plan — ensuring compliance with TIPS ceiling rules.",
    },
    {
      name: "The Team Builder",
      color: "#EF4444",
      x: 24, y: 8,
      bio: "I identify and confirm the required private co-investor, research partners, and advisors that strengthen NeuroSync's eligibility and credibility under the TIPS deep-tech SME track.",
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
      content: "TIPS 2026 Spring Cohort confirmed as primary target. Ministry of SMEs and Startups — government R&D grant up to ₩1B with required private co-investment. NeuroSync scores 91/100 on our eligibility matrix. Application deadline: 15 April 2026.",
    },
    {
      npc: "The Strategist",
      content: "Grant narrative locked. NeuroSync is not a BCI device company — it's Korea's national cognitive-computing infrastructure layer. TIPS evaluators prioritise deep-tech with domestic IP and manufacturing potential. We lead with the KAIST patent family and the Gwangju production roadmap.",
    },
    {
      npc: "The Writer",
      content: "TIPS application complete: 8 sections, 4,200 words. Technology section grounded in 6 KAIST patent filings. Impact projections validated by Korean Institute of S&T Evaluation. Executive summary: one page, evaluator-ready.",
    },
    {
      npc: "The Architect",
      content: "Budget framework finalised: ₩1.3B total over 24 months. Government TIPS grant: ₩1B. Private matching: ₩300M committed by NeoPlux Capital. Indirect cost rate: 18% — within TIPS 20% ceiling. Six R&D milestones defined.",
    },
    {
      npc: "The Team Builder",
      content: "Consortium confirmed. Tech partner: KAIST BCI Lab, Prof. Kim Hyun-soo — letter of intent signed. Private co-investor lead: NeoPlux Capital (₩300M, committed). Advisor: Dr. Park Sung-won, former TIPS Program Director.",
    },
    {
      npc: "The Scout",
      content: "All eligibility criteria under the TIPS deep-tech SME track met. Application package ready for your final review before submission on 15 April 2026.",
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
      title: "Confirm TIPS 2026 Spring Cohort eligibility — deep-tech SME track",
      summary: "Cross-check NeuroSync against all TIPS eligibility criteria: company age, employee count, private investment lead, and technology readiness level. Output: eligibility confirmation memo. Deadline: 1 April 2026.",
      status: "in_progress",
    },
    {
      npc: "The Strategist",
      title: "Validate grant narrative against TIPS evaluation rubric",
      summary: "TIPS evaluators score on: technological innovation (30pts), commercialisation potential (25pts), team capability (20pts), social impact (15pts), budget validity (10pts). Map our narrative to each criterion. Flag any gaps.",
      status: "in_progress",
    },
    {
      npc: "The Writer",
      title: "Finalise TIPS application — 8 sections",
      summary: "Sections 1-5 complete. Section 6 (work packages) in draft. Sections 7-8 (budget justification, expected outcomes) pending Architect sign-off. Target: submission-ready by 10 April 2026.",
      status: "in_progress",
    },
    {
      npc: "The Architect",
      title: "Validate budget against TIPS ceiling rules",
      summary: "Confirm indirect cost rate ≤20%, direct labour ≥40% of total, equipment costs justified. Run three scenarios: base (₩1.3B), reduced (₩1.1B), minimum viable (₩900M). Output: budget justification memo.",
      status: "in_progress",
    },
    {
      npc: "The Team Builder",
      title: "Secure KAIST letter of intent and NeoPlux co-investment confirmation",
      summary: "TIPS requires signed letter of intent from research partner (KAIST BCI Lab) and written co-investment commitment from private lead (NeoPlux Capital ₩300M). Both needed before submission. Deadline: 8 April 2026.",
      status: "in_progress",
    },
  ];

  for (const task of TASKS) {
    db.prepare(`INSERT INTO tasks (id, channel_id, npc_id, assigner_id, npc_task_id, title, summary, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(randomUUID(), channelId, npcIds[task.npc], characterId, randomUUID(), task.title, task.summary, task.status, now, now);
    console.log(`✓ Created task: ${task.title.slice(0, 50)}…`);
  }

  console.log("\n🎉 Demo seed complete — NeuroSync Korea TIPS 2026 Spring Cohort");
  console.log("   Login at http://localhost:3000 with mark / demo1234");
  db.close();
}

main().catch((err) => { console.error(err); process.exit(1); });
