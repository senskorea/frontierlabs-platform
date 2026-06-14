"use client";
import { useEffect, useRef, useState } from "react";

// ── TIPS Program content ──────────────────────────────────────────────────────

interface AgentStep {
  id: string;
  name: string;
  color: string;
  role: string;
  zone: string;
  message: string;
  stat: string;
  // Office view position (% of mini-map)
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

const STEP_DURATION = 5000;
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

// ── Office view mode — mini-map with speech bubbles ───────────────────────────

function OfficeBubble({ agent, active, done }: { agent: AgentStep; active: boolean; done: boolean }) {
  const text = useTypewriter(agent.message.slice(0, 120) + "…", active);
  return (
    <div style={{ position: "absolute", left: `${agent.x}%`, top: `${agent.y}%`, transform: "translate(-50%, -50%)", zIndex: 2 }}>
      {/* Speech bubble */}
      {(active || done) && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)",
          width: 160, background: "rgba(10,12,20,0.96)", border: `1px solid ${agent.color}66`,
          borderRadius: 8, padding: "8px 10px", animation: "fadeUp 0.3s ease",
          boxShadow: `0 4px 20px rgba(0,0,0,0.6), 0 0 0 1px ${agent.color}22`,
          pointerEvents: "none",
        }}>
          <div style={{ fontSize: 9, color: agent.color, fontWeight: 700, marginBottom: 4, letterSpacing: "0.5px" }}>
            {agent.name.toUpperCase()}
          </div>
          <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.8)", lineHeight: 1.55 }}>
            {active ? text : agent.message.slice(0, 120) + "…"}
            {active && <span style={{ animation: "blink 0.6s infinite", color: agent.color }}>▌</span>}
          </p>
          {/* Bubble tail */}
          <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
            width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
            borderTop: `6px solid ${agent.color}66` }} />
        </div>
      )}
      {/* Agent avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: "50%", background: agent.color,
        border: `2px solid ${active ? "#fff" : done ? agent.color : "rgba(255,255,255,0.2)"}`,
        boxShadow: active ? `0 0 16px ${agent.color}` : done ? `0 0 6px ${agent.color}66` : "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, color: "#fff",
        transition: "all 0.4s", animation: active ? "pulse 1s infinite" : "none",
        cursor: "default",
      }}>
        {agent.name.split(" ")[1][0]}
      </div>
      {/* Zone label */}
      <div style={{ textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 4, whiteSpace: "nowrap" }}>
        {agent.zone}
      </div>
    </div>
  );
}

function OfficeView({ activeIdx, doneSet }: { activeIdx: number; doneSet: Set<number> }) {
  return (
    <div style={{ position: "relative", width: "100%", height: 320, background: "rgba(8,12,24,0.6)",
      border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden", margin: "0 0 12px" }}>
      {/* Zone backgrounds */}
      {[
        { label: "Scout Desk",    x: 0,    y: 0,    w: "36%", h: "50%", color: "#3B82F6" },
        { label: "Strategy Room", x: "36%", y: 0,    w: "36%", h: "50%", color: "#10B981" },
        { label: "Writing Bay",   x: 0,    y: "50%", w: "36%", h: "50%", color: "#F59E0B" },
        { label: "Budget Corner", x: "36%", y: "50%", w: "36%", h: "50%", color: "#8B5CF6" },
        { label: "Team Builder",  x: "72%", y: 0,    w: "28%", h: "100%", color: "#EF4444" },
      ].map(z => (
        <div key={z.label} style={{
          position: "absolute", left: z.x, top: z.y, width: z.w, height: z.h,
          background: `${z.color}08`, borderRight: "1px solid rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}>
          <span style={{ position: "absolute", bottom: 6, right: 8, fontSize: 9,
            color: `${z.color}55`, letterSpacing: "0.5px", textTransform: "uppercase" }}>
            {z.label}
          </span>
        </div>
      ))}
      {/* Corridor */}
      <div style={{ position: "absolute", left: 0, top: "48%", width: "72%", height: "4%",
        background: "rgba(255,255,255,0.03)" }} />
      {/* Agents */}
      {AGENTS.map((a, i) => (
        <OfficeBubble key={a.id} agent={a} active={activeIdx === i} done={doneSet.has(i)} />
      ))}
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
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", padding: "8px 0", animation: "fadeUp 0.3s ease" }}>
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

// ── Final stats reveal ────────────────────────────────────────────────────────

function FinalReveal() {
  return (
    <div style={{ borderRadius: 8, background: "rgba(0,204,126,0.06)",
      border: "1px solid rgba(0,204,126,0.2)", padding: "16px 18px", animation: "fadeUp 0.5s ease" }}>
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

// ── Main DemoPlayer ───────────────────────────────────────────────────────────

type Mode = "briefing" | "office";

export default function DemoPlayer({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<Mode>("briefing");
  const [phase, setPhase] = useState<"init" | "agents" | "done">("init");
  const [activeIdx, setActiveIdx] = useState(-1);
  const [doneSet, setDoneSet] = useState<Set<number>>(new Set());

  // Reset when mode changes
  useEffect(() => {
    setPhase("init"); setActiveIdx(-1); setDoneSet(new Set());
    const t = setTimeout(() => setPhase("agents"), 1000);
    return () => clearTimeout(t);
  }, [mode]);

  useEffect(() => {
    if (phase !== "agents") return;
    let idx = 0;
    const next = () => {
      if (idx >= AGENTS.length) { setPhase("done"); setActiveIdx(-1); return; }
      setActiveIdx(idx);
      const i = idx;
      setTimeout(() => {
        setDoneSet(prev => new Set([...prev, i]));
        idx++; setTimeout(next, 300);
      }, STEP_DURATION);
    };
    const t = setTimeout(next, 200);
    return () => clearTimeout(t);
  }, [phase]);

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
        borderRadius: 14, boxShadow: "0 40px 120px rgba(0,0,0,0.8)", animation: "fadeUp 0.3s ease" }}>

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
              Ministry of SMEs & Startups · ₩1B R&D grant · Deadline 15 April 2026
            </p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 7, padding: "6px 13px", color: "rgba(255,255,255,0.45)", fontSize: 12, cursor: "pointer" }}>
            ✕ Close
          </button>
        </div>

        {/* Mode switcher */}
        <div style={{ display: "flex", gap: 0, margin: "16px 20px 12px",
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
            <div style={{ textAlign: "center", padding: "36px 0", animation: "fadeUp 0.3s ease" }}>
              <div style={{ fontSize: 11, letterSpacing: "2px", color: "#00cc7e", marginBottom: 14 }}>
                INITIALISING AGENT NETWORK
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 5 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#00cc7e", animation: `pulse 1s ${i*0.2}s infinite` }} />)}
              </div>
            </div>
          )}

          {(phase === "agents" || phase === "done") && (
            <>
              {mode === "office" && <OfficeView activeIdx={activeIdx} doneSet={doneSet} />}
              {mode === "briefing" && AGENTS.map((a, i) => (
                <BriefingCard key={a.id} agent={a} active={activeIdx === i} done={doneSet.has(i)} />
              ))}
            </>
          )}

          {phase === "done" && <FinalReveal />}
        </div>
      </div>
    </div>
  );
}
