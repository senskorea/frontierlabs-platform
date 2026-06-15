"use client";
import { useEffect, useRef, useState } from "react";
import { EventBus } from "@/game/EventBus";

// ── TIPS Program content ──────────────────────────────────────────────────────

interface AgentStep {
  id: string;
  name: string;
  color: string;
  role: string;
  zone: string;
  message: string;
  stat: string;
  x: number;
  y: number;
}

const AGENTS: AgentStep[] = [
  {
    id: "scout", name: "The Scout", color: "#3B82F6", role: "Intelligence", zone: "Scout Desk",
    message: "TIPS 2026 Spring Cohort confirmed as primary target. Ministry of SMEs and Startups — government R&D grant up to ₩1B with required private co-investment. NeuroSync scores 91/100 on our eligibility matrix. Application deadline: 15 April 2026. We are well within the preparation window.",
    stat: "91/100 eligibility score",
    x: 18, y: 22,
  },
  {
    id: "strategist", name: "The Strategist", color: "#10B981", role: "Narrative", zone: "Strategy Room",
    message: "Grant narrative locked. NeuroSync is not a BCI device company — it is Korea's national cognitive-computing infrastructure layer. TIPS evaluators prioritise deep-tech with domestic IP and manufacturing potential. We lead with the KAIST patent family and the Gwangju production roadmap. This framing scores in the top 3% of previous successful applications.",
    stat: "Top 3% narrative score",
    x: 52, y: 22,
  },
  {
    id: "writer", name: "The Writer", color: "#F59E0B", role: "Proposal", zone: "Writing Bay",
    message: "TIPS application complete: 8 sections, 4,200 words. Technology section grounded in 6 KAIST patent filings. Impact projections validated by Korean Institute of S&T Evaluation. Market size confirmed at ₩180B TAM. Executive summary: one page, evaluator-ready. Awaiting your final review before submission.",
    stat: "8 sections · 4,200 words",
    x: 18, y: 70,
  },
  {
    id: "architect", name: "The Architect", color: "#8B5CF6", role: "Budget", zone: "Budget Corner",
    message: "Budget framework finalised: ₩1.3B total over 24 months. Government TIPS grant: ₩1B. Private matching: ₩300M committed by NeoPlux Capital. Indirect cost rate: 18% — within the TIPS 20% ceiling. Six R&D milestones defined. WP1: Signal processing (₩420M), WP2: Platform (₩380M), WP3: Clinical validation (₩240M), WP4: Commercialisation (₩260M).",
    stat: "₩1.3B · 6 milestones",
    x: 52, y: 70,
  },
  {
    id: "team", name: "The Team Builder", color: "#EF4444", role: "Consortium", zone: "Team Builder",
    message: "Consortium confirmed. Tech partner: KAIST BCI Lab, Prof. Kim Hyun-soo — letter of intent signed. Private co-investor lead: NeoPlux Capital (₩300M, committed). Board advisor added: Dr. Park Sung-won, former TIPS Program Director. All eligibility criteria under the TIPS deep-tech SME track met. Application is ready for submission.",
    stat: "All criteria met",
    x: 83, y: 46,
  },
];

const STEP_DURATION = 5200;
const TYPE_SPEED = 14;

// ── Typewriter hook ───────────────────────────────────────────────────────────

function useTypewriter(text: string, active: boolean) {
  const [displayed, setDisplayed] = useState("");
  const idx = useRef(0);
  useEffect(() => {
    if (!active) { setDisplayed(""); idx.current = 0; return; }
    idx.current = 0; setDisplayed("");
    const iv = setInterval(() => {
      idx.current += 1;
      setDisplayed(text.slice(0, idx.current));
      if (idx.current >= text.length) clearInterval(iv);
    }, TYPE_SPEED);
    return () => clearInterval(iv);
  }, [text, active]);
  return displayed;
}

// ── Briefing mode — agent card ────────────────────────────────────────────────

function BriefingCard({ agent, active, done }: { agent: AgentStep; active: boolean; done: boolean }) {
  const text = useTypewriter(agent.message, active);
  return (
    <div style={{
      borderRadius: 8, border: `1px solid ${active || done ? agent.color + "55" : "rgba(255,255,255,0.06)"}`,
      background: active ? `${agent.color}10` : done ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.15)",
      padding: "12px 14px", transition: "all 0.4s ease", opacity: !active && !done ? 0.3 : 1,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: active || done ? agent.color : "#333",
          boxShadow: active ? `0 0 8px ${agent.color}` : "none", transition: "all 0.3s",
          animation: active ? "pulse 1s infinite" : "none" }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{agent.name}</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>— {agent.role}</span>
        {done && <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 600, color: agent.color }}>✓ {agent.stat}</span>}
        {active && <span style={{ marginLeft: "auto", fontSize: 10, color: agent.color, animation: "blink 0.8s infinite" }}>LIVE</span>}
      </div>
      {(active || done) && (
        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 1.65 }}>
          {active ? text : agent.message}
          {active && <span style={{ animation: "blink 0.6s infinite", color: agent.color }}>▌</span>}
        </p>
      )}
    </div>
  );
}

// ── Human-in-the-loop input ───────────────────────────────────────────────────

function HumanInput() {
  const [value, setValue] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div style={{ borderRadius: 8, border: "1px solid rgba(0,204,126,0.2)",
      background: "rgba(0,204,126,0.04)", padding: "14px 16px" }}>
      <div style={{ fontSize: 10, letterSpacing: "2px", color: "#00cc7e", marginBottom: 10, textTransform: "uppercase" }}>
        Your input — Human in the loop
      </div>
      {sent ? (
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", padding: "8px 0" }}>
          <span style={{ color: "#00cc7e" }}>✓</span> Message received. Agents will incorporate your feedback into the next draft.
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Add a note, correction, or new instruction for the agents…"
            style={{
              flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6, padding: "9px 12px", fontSize: 12, color: "#fff",
              outline: "none", fontFamily: "inherit",
            }}
          />
          <button
            onClick={() => value.trim() && setSent(true)}
            style={{
              padding: "9px 16px", background: "#00cc7e", border: "none", borderRadius: 6,
              fontSize: 12, fontWeight: 600, color: "#000", cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            Send ↵
          </button>
        </div>
      )}
    </div>
  );
}

// ── Final stats reveal (briefing mode) ───────────────────────────────────────

function FinalReveal() {
  return (
    <div style={{ borderRadius: 8, background: "rgba(0,204,126,0.06)",
      border: "1px solid rgba(0,204,126,0.2)", padding: "16px 18px" }}>
      <div style={{ fontSize: 10, letterSpacing: "3px", color: "#00cc7e", marginBottom: 12, textTransform: "uppercase" }}>
        Application Ready — TIPS 2026 Spring Cohort
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 14 }}>
        {[
          { label: "Total budget",        value: "₩1.3B",     sub: "TIPS ₩1B + NeoPlux ₩300M" },
          { label: "R&D grant requested", value: "₩1B",        sub: "Ministry of SMEs & Startups" },
          { label: "Proposal sections",   value: "8 sections", sub: "4,200 words · submission-ready" },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
        <HumanInput />
      </div>
    </div>
  );
}

// ── Office mode HUD (transparent, overlaid on Phaser game) ───────────────────

function OfficeHUD({
  activeIdx, doneSet, phase, mode, setMode, onClose,
}: {
  activeIdx: number;
  doneSet: Set<number>;
  phase: "init" | "agents" | "done";
  mode: "briefing" | "office";
  setMode: (m: "briefing" | "office") => void;
  onClose: () => void;
}) {
  const agent = activeIdx >= 0 ? AGENTS[activeIdx] : null;

  return (
    <>
      <style>{`
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateX(-50%) translateY(8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes fadeUpCenter { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
      `}</style>

      {/* Top gradient + HUD */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, transparent 100%)",
        padding: "10px 16px 28px",
        display: "flex", alignItems: "center", gap: 14,
        pointerEvents: "none",
      }}>
        {/* Live indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, pointerEvents: "none" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00cc7e",
            animation: phase === "agents" ? "pulse 1.5s infinite" : "none" }} />
          <span style={{ fontSize: 10, letterSpacing: "2px", color: "#00cc7e", textTransform: "uppercase" }}>
            {phase === "init" ? "Initialising…" : phase === "done" ? "Complete" : "Office View · Live"}
          </span>
        </div>

        {/* Mode switcher */}
        <div style={{ display: "flex", pointerEvents: "all",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, overflow: "hidden" }}>
          {([["briefing", "📋 Briefing"], ["office", "🏢 Office View"]] as ["briefing"|"office", string][]).map(([m, label]) => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: "5px 12px", fontSize: 10, fontWeight: 500, border: "none", cursor: "pointer",
              background: mode === m ? "rgba(0,204,126,0.25)" : "rgba(0,0,0,0.5)",
              color: mode === m ? "#00cc7e" : "rgba(255,255,255,0.45)",
              borderRight: m === "briefing" ? "1px solid rgba(255,255,255,0.08)" : "none",
            }}>{label}</button>
          ))}
        </div>

        {/* Agent progress pills */}
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {AGENTS.map((a, i) => (
            <div key={a.id} title={a.name} style={{
              width: activeIdx === i ? 22 : 8, height: 8, borderRadius: 4,
              background: doneSet.has(i) ? a.color : activeIdx === i ? a.color : "rgba(255,255,255,0.18)",
              transition: "all 0.3s",
              boxShadow: activeIdx === i ? `0 0 8px ${a.color}` : "none",
            }} />
          ))}
        </div>

        {agent && (
          <span style={{ fontSize: 11, color: agent.color, fontWeight: 600 }}>
            {agent.name} · {agent.role}
          </span>
        )}
        {phase === "done" && (
          <span style={{ fontSize: 11, color: "#00cc7e", fontWeight: 600 }}>✓ All agents complete</span>
        )}

        <div style={{ flex: 1 }} />

        <button
          onClick={onClose}
          style={{
            pointerEvents: "all", background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)", borderRadius: 6,
            padding: "4px 12px", color: "rgba(255,255,255,0.55)", fontSize: 10, cursor: "pointer",
          }}
        >
          ✕ Exit demo
        </button>
      </div>

      {/* Current agent message strip at bottom */}
      {agent && phase === "agents" && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", zIndex: 9999,
          transform: "translateX(-50%)", width: 440,
          background: "rgba(6,9,20,0.88)", border: `1px solid ${agent.color}44`,
          borderRadius: 10, padding: "10px 14px",
          backdropFilter: "blur(10px)", animation: "fadeUp 0.35s ease",
          pointerEvents: "none",
        }}>
          <div style={{ fontSize: 9, color: agent.color, fontWeight: 700, marginBottom: 4, letterSpacing: "1px", textTransform: "uppercase" }}>
            {agent.name} · {agent.zone}
          </div>
          <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.72)", lineHeight: 1.55 }}>
            {agent.message.slice(0, 130)}…
          </p>
        </div>
      )}

      {/* Done — human-in-the-loop */}
      {phase === "done" && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          zIndex: 9999, width: 480,
          background: "rgba(6,9,20,0.95)", border: "1px solid rgba(0,204,126,0.2)",
          borderRadius: 12, padding: "16px 18px",
          backdropFilter: "blur(14px)", animation: "fadeUpCenter 0.4s ease",
          pointerEvents: "all",
        }}>
          <HumanInput />
        </div>
      )}
    </>
  );
}

// ── Main DemoPlayer ───────────────────────────────────────────────────────────

type Mode = "briefing" | "office";

export default function DemoPlayer({ initialMode = "briefing", onClose }: { initialMode?: Mode; onClose: () => void }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [phase, setPhase] = useState<"init" | "agents" | "done">("init");
  const [activeIdx, setActiveIdx] = useState(-1);
  const [doneSet, setDoneSet] = useState<Set<number>>(new Set());

  // Reset + start sequence on mode change
  useEffect(() => {
    setPhase("init");
    setActiveIdx(-1);
    setDoneSet(new Set());
    const t = setTimeout(() => setPhase("agents"), 800);
    return () => clearTimeout(t);
  }, [mode]);

  // Drive the agent sequence
  useEffect(() => {
    if (phase !== "agents") return;
    let idx = 0;
    const next = () => {
      if (idx >= AGENTS.length) { setPhase("done"); setActiveIdx(-1); return; }
      setActiveIdx(idx);
      const i = idx;

      if (mode === "office") {
        EventBus.emit("demo:npc-speak", {
          npcName: AGENTS[i].name,
          message: AGENTS[i].message,
          durationMs: STEP_DURATION,
        });
      }

      setTimeout(() => {
        setDoneSet(prev => new Set([...prev, i]));
        idx++;
        setTimeout(next, 300);
      }, STEP_DURATION);
    };
    const t = setTimeout(next, 200);
    return () => clearTimeout(t);
  }, [phase, mode]);

  const handleClose = () => {
    if (mode === "office") EventBus.emit("demo:office-end", {});
    onClose();
  };

  // ── Office mode: transparent HUD only (game stays fully visible) ──────────
  if (mode === "office") {
    return (
      <OfficeHUD
        activeIdx={activeIdx}
        doneSet={doneSet}
        phase={phase}
        mode={mode}
        setMode={setMode}
        onClose={handleClose}
      />
    );
  }

  // ── Briefing mode: dark cinematic overlay ─────────────────────────────────
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(14px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <style>{`
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
      `}</style>

      <div style={{ width: "100%", maxWidth: 700, maxHeight: "90vh", overflow: "auto",
        background: "rgba(6,9,20,0.98)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14, boxShadow: "0 40px 120px rgba(0,0,0,0.8)" }}>

        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,204,126,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00cc7e", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: 10, letterSpacing: "3px", color: "#00cc7e", textTransform: "uppercase" }}>
                FrontierLabs · Live Session
              </span>
            </div>
            <p style={{ margin: "3px 0 1px", fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>
              NeuroSync Korea — TIPS 2026 Spring Cohort
            </p>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
              Ministry of SMEs &amp; Startups · ₩1B R&amp;D grant · Deadline 15 April 2026
            </p>
          </div>
          <button onClick={handleClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 7, padding: "6px 13px", color: "rgba(255,255,255,0.45)", fontSize: 12, cursor: "pointer" }}>
            ✕ Close
          </button>
        </div>

        {/* Mode switcher */}
        <div style={{ display: "flex", margin: "16px 20px 12px",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, overflow: "hidden", width: "fit-content" }}>
          {([["briefing", "📋 Briefing"], ["office", "🏢 Office View"]] as [Mode, string][]).map(([m, label]) => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: "7px 16px", fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer",
              background: mode === m ? "rgba(0,204,126,0.15)" : "transparent",
              color: mode === m ? "#00cc7e" : "rgba(255,255,255,0.4)",
              borderRight: m === "briefing" ? "1px solid rgba(255,255,255,0.08)" : "none",
              transition: "all 0.2s",
            }}>{label}</button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {phase === "init" && (
            <div style={{ textAlign: "center", padding: "36px 0" }}>
              <div style={{ fontSize: 11, letterSpacing: "2px", color: "#00cc7e", marginBottom: 14 }}>
                INITIALISING AGENT NETWORK
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 5 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#00cc7e",
                    animation: `pulse 1s ${i*0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}

          {(phase === "agents" || phase === "done") && AGENTS.map((a, i) => (
            <BriefingCard key={a.id} agent={a} active={activeIdx === i} done={doneSet.has(i)} />
          ))}

          {phase === "done" && <FinalReveal />}
        </div>
      </div>
    </div>
  );
}
