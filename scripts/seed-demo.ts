// scripts/seed-demo.ts — FrontierLabs demo data seed
// Usage: npx tsx scripts/seed-demo.ts
// Safe to run multiple times (idempotent)

import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import path from "node:path";

const DB_PATH = process.env.SQLITE_PATH || "data/deskrpg.db";
const db = new Database(path.resolve(DB_PATH));
db.pragma("foreign_keys = ON");

const now = new Date().toISOString();

// ── 1. Demo user ─────────────────────────────────────────────────────────────

async function main() {
const existingUser = db.prepare("SELECT id FROM users WHERE login_id = ?").get("mark") as { id: string } | undefined;

if (existingUser) {
  console.log("✓ Demo user already exists — skipping seed.");
  db.close();
  return;
}

const passwordHash = await bcrypt.hash("demo1234", 10);
const userId = randomUUID();

db.prepare(`
  INSERT INTO users (id, login_id, nickname, password_hash, system_role, created_at, updated_at)
  VALUES (?, ?, ?, ?, 'user', ?, ?)
`).run(userId, "mark", "mark", passwordHash, now, now);

console.log("✓ Created user: mark / demo1234");

// ── 2. Character for mark ────────────────────────────────────────────────────

const characterId = randomUUID();
const defaultAppearance = JSON.stringify({ body: "light", hair: "short_brown", outfit: "suit" });

db.prepare(`
  INSERT INTO characters (id, user_id, name, appearance, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(characterId, userId, "Mark", defaultAppearance, now, now);

console.log("✓ Created character: Mark");

// ── 3. Channel: EIC Accelerator 2025 ────────────────────────────────────────

const channelId = randomUUID();

db.prepare(`
  INSERT INTO channels (id, name, description, owner_id, is_public, max_players, created_at, updated_at)
  VALUES (?, ?, ?, ?, 1, 50, ?, ?)
`).run(
  channelId,
  "EIC Accelerator 2025",
  "Active proposal pipeline for Horizon Europe EIC Accelerator — September 2025 deadline",
  userId,
  now,
  now
);

console.log("✓ Created channel: EIC Accelerator 2025");

// ── 4. NPCs ──────────────────────────────────────────────────────────────────

const AGENTS = [
  {
    name: "The Scout",
    bio: "I hunt global funding opportunities and score them for strategic fit with your profile",
    color: "#3B82F6",
    x: 5, y: 5,
  },
  {
    name: "The Strategist",
    bio: "I develop your core project idea and select the most compelling narrative angles for funders",
    color: "#10B981",
    x: 10, y: 5,
  },
  {
    name: "The Writer",
    bio: "I draft all proposal sections and clip every claim directly to your uploaded corporate documents",
    color: "#F59E0B",
    x: 15, y: 5,
  },
  {
    name: "The Architect",
    bio: "I shape your project blueprint and enforce fiscal boundaries across multi-currency budgets",
    color: "#8B5CF6",
    x: 20, y: 5,
  },
  {
    name: "The Team Builder",
    bio: "I assemble your multi-national consortium and validate complex eligibility rules",
    color: "#EF4444",
    x: 25, y: 5,
  },
]

const npcIds: Record<string, string> = {};

for (const agent of AGENTS) {
  const npcId = randomUUID();
  npcIds[agent.name] = npcId;

  const appearance = JSON.stringify({ color: agent.color, type: "circle" });
  const openclawConfig = JSON.stringify({ systemPrompt: agent.bio });

  db.prepare(`
    INSERT INTO npcs (id, channel_id, name, position_x, position_y, direction, appearance, openclaw_config, adapter_type, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'down', ?, ?, 'openclaw', ?, ?)
  `).run(npcId, channelId, agent.name, agent.x, agent.y, appearance, openclawConfig, now, now);

  console.log(`✓ Created NPC: ${agent.name}`);
}

// ── 5. Pre-written chat messages ─────────────────────────────────────────────

const CHAT = [
  { npc: "The Scout",        role: "assistant", content: "I've identified 3 high-fit calls. HE-2025-CL4 scores 87/100 for your TRL profile." },
  { npc: "The Strategist",   role: "assistant", content: "Confirmed. Narrative angle: position the platform as closing the compliance communication gap, not just an AI writing tool." },
  { npc: "The Writer",       role: "assistant", content: "Section 1.1 Excellence drafted. Grounded in 4 uploaded corporate docs. Ready for review." },
  { npc: "The Architect",    role: "assistant", content: "Budget envelope set at €2.4M. Overhead cap at 25% enforced. WP2 anchored to TRL 7 target." },
  { npc: "The Team Builder", role: "assistant", content: "RWTH Aachen confirmed as technical partner. LMIC eligibility validated — Kenya partner added." },
  { npc: "The Scout",        role: "assistant", content: "Deadline confirmed: 12 September 2025. We are on track." },
]

for (const msg of CHAT) {
  db.prepare(`
    INSERT INTO chat_messages (id, character_id, npc_id, role, content, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(randomUUID(), characterId, npcIds[msg.npc], msg.role, msg.content, now);
}

console.log("✓ Seeded 6 pre-written chat messages");

// ── 6. Task ───────────────────────────────────────────────────────────────────

db.prepare(`
  INSERT INTO tasks (id, channel_id, npc_id, assigner_id, npc_task_id, title, summary, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, 'in_progress', ?, ?)
`).run(
  randomUUID(),
  channelId,
  npcIds["The Writer"],
  characterId,
  randomUUID(),
  "Draft Excellence Section — HE-2025-CL4",
  "Write Section 1.1 of the EIC Accelerator proposal. Ground all claims in uploaded corporate documents. Target: 3,000 words.",
  now,
  now
);

console.log("✓ Created task: Draft Excellence Section — HE-2025-CL4");
console.log("\n🎉 Demo seed complete. Login at http://localhost:3001 with mark / demo1234");

db.close();
}

main().catch((err) => { console.error(err); process.exit(1); });
