"use client";
import { useEffect, useRef, useState } from "react";
import { EventBus } from "@/game/EventBus";

// ── Content ───────────────────────────────────────────────────────────────────

interface AgentStep {
  id: string;
  name: string;
  color: string;
  role: string;
  zone: string;
  message: string;
  stat: string;
}

const AGENTS: AgentStep[] = [
  {
    id: "scout", name: "The Scout", color: "#3B82F6", role: "Intelligence", zone: "Scout Desk",
    message: "TIPS 2026 Spring Cohort confirmed as primary target. Ministry of SMEs and Startups — government R&D grant up to ₩1B with required private co-investment. NeuroSync scores 91/100 on our eligibility matrix. Application deadline: 15 April 2026. We are well within the preparation window.",
    stat: "91/100 eligibility score",
  },
  {
    id: "strategist", name: "The Strategist", color: "#10B981", role: "Narrative", zone: "Strategy Room",
    message: "Grant narrative locked. NeuroSync is not a BCI device company — it is Korea's national cognitive-computing infrastructure layer. TIPS evaluators prioritise deep-tech with domestic IP and manufacturing potential. We lead with the KAIST patent family and the Gwangju production roadmap.",
    stat: "Top 3% narrative score",
  },
  {
    id: "writer", name: "The Writer", color: "#F59E0B", role: "Proposal", zone: "Writing Bay",
    message: "TIPS application complete: 8 sections, 4,200 words. Technology section grounded in 6 KAIST patent filings. Impact projections validated by Korean Institute of S&T Evaluation. Executive summary: one page, evaluator-ready. Awaiting your final review.",
    stat: "8 sections · 4,200 words",
  },
  {
    id: "architect", name: "The Architect", color: "#8B5CF6", role: "Budget", zone: "Budget Corner",
    message: "Budget framework finalised: ₩1.3B total over 24 months. TIPS grant: ₩1B. Private matching: ₩300M from NeoPlux Capital. Indirect cost rate: 18% — within the 20% ceiling. Six R&D milestones defined across four work packages.",
    stat: "₩1.3B · 6 milestones",
  },
  {
    id: "team", name: "The Team Builder", color: "#EF4444", role: "Consortium", zone: "Team Builder",
    message: "Consortium confirmed. KAIST BCI Lab letter of intent signed. NeoPlux Capital committed ₩300M. Board advisor Dr. Park Sung-won, former TIPS Program Director, added. All eligibility criteria met — application is ready for submission.",
    stat: "All criteria met",
  },
];

const STEP_DURATION = 6000; // ms each agent speaks (office mode driven by GameScene)
const TYPE_SPEED = 13;

// ── Typewriter ────────────────────────────────────────────────────────────────

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

// ── Briefing card ─────────────────────────────────────────────────────────────

function BriefingCard({ agent, active, done }: { agent: AgentStep; active: boolean; done: boolean }) {
  const text = useTypewriter(agent.message, active);
  return (
    <div style={{
      borderRadius: 8,
      border: `1px solid ${active || done ? agent.color + "55" : "rgba(255,255,255,0.06)"}`,
      background: active ? `${agent.color}10` : done ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.15)",
      padding: "12px 14px", transition: "all 0.4s ease", opacity: !active && !done ? 0.3 : 1,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: active || done ? agent.color : "#333",
          boxShadow: active ? `0 0 8px ${agent.color}` : "none",
          transition: "all 0.3s",
          animation: active ? "demoPulse 1s infinite" : "none",
        }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{agent.name}</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>— {agent.role}</span>
        {done && <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 600, color: agent.color }}>✓ {agent.stat}</span>}
        {active && <span style={{ marginLeft: "auto", fontSize: 10, color: agent.color, animation: "demoBlink 0.8s infinite" }}>LIVE</span>}
      </div>
      {(active || done) && (
        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 1.65 }}>
          {active ? text : agent.message}
          {active && <span style={{ animation: "demoBlink 0.6s infinite", color: agent.color }}>▌</span>}
        </p>
      )}
    </div>
  );
}

// ── Human-in-the-loop ─────────────────────────────────────────────────────────

function HumanInput() {
  const [value, setValue] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div style={{ borderRadius: 8, border: "1px solid rgba(0,204,126,0.2)", background: "rgba(0,204,126,0.04)", padding: "14px 16px" }}>
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
            style={{ padding: "9px 16px", background: "#00cc7e", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, color: "#000", cursor: "pointer", whiteSpace: "nowrap" }}
          >Send ↵</button>
        </div>
      )}
    </div>
  );
}

// ── Briefing final reveal ─────────────────────────────────────────────────────

function FinalReveal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ borderRadius: 8, background: "rgba(0,204,126,0.06)", border: "1px solid rgba(0,204,126,0.2)", padding: "16px 18px" }}>
      <div style={{ fontSize: 10, letterSpacing: "3px", color: "#00cc7e", marginBottom: 12, textTransform: "uppercase" }}>
        Application Ready — TIPS 2026 Spring Cohort
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 14 }}>
        {[
          { label: "Total budget",        value: "₩1.3B",       sub: "TIPS ₩1B + NeoPlux ₩300M" },
          { label: "R&D grant requested", value: "₩1B",          sub: "Ministry of SMEs & Startups" },
          { label: "Proposal",            value: "8 sections",   sub: "4,200 words · submission-ready" },
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
      <button
        onClick={onClose}
        style={{ marginTop: 12, width: "100%", padding: "9px 0", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer" }}
      >Close</button>
    </div>
  );
}

// ── Office View HUD — lives entirely below the game header ────────────────────

function OfficeHUD({
  activeIdx, doneSet, phase, onClose,
}: {
  activeIdx: number;
  doneSet: Set<number>;
  phase: "init" | "walking" | "speaking" | "done";
  onClose: () => void;
}) {
  const agent = activeIdx >= 0 && activeIdx < AGENTS.length ? AGENTS[activeIdx] : null;

  return (
    <>
      <style>{`
        @keyframes demoPulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes demoFadeUp { from{opacity:0;transform:translateX(-50%) translateY(8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes demoFadeCenter { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
      `}</style>

      {/* Progress strip — sits just below the game header (~48px) */}
      <div style={{
        position: "fixed", top: 50, left: "50%", transform: "translateX(-50%)",
        zIndex: 9998, display: "flex", alignItems: "center", gap: 8,
        background: "rgba(6,9,20,0.82)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20, padding: "5px 14px", backdropFilter: "blur(10px)",
        pointerEvents: "none",
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00cc7e", flexShrink: 0,
          animation: phase !== "done" ? "demoPulse 1.5s infinite" : "none" }} />
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase" }}>
          {phase === "done" ? "Complete" : "Office View"}
        </span>
        <div style={{ display: "flex", gap: 4, alignItems: "center", marginLeft: 4 }}>
          {AGENTS.map((a, i) => (
            <div key={a.id} title={a.name} style={{
              width: activeIdx === i ? 18 : 7, height: 7, borderRadius: 4,
              background: doneSet.has(i) ? a.color : activeIdx === i ? a.color : "rgba(255,255,255,0.15)",
              transition: "all 0.3s",
              boxShadow: activeIdx === i ? `0 0 6px ${a.color}` : "none",
            }} />
          ))}
        </div>
        {agent && (
          <span style={{ fontSize: 10, color: agent.color, fontWeight: 600, marginLeft: 4 }}>
            {agent.name}
          </span>
        )}
      </div>

      {/* Agent walking label */}
      {agent && phase === "walking" && (
        <div style={{
          position: "fixed", bottom: 80, left: "50%", zIndex: 9998,
          transform: "translateX(-50%)",
          background: "rgba(6,9,20,0.7)", border: `1px solid ${agent.color}33`,
          borderRadius: 8, padding: "6px 14px",
          backdropFilter: "blur(8px)", pointerEvents: "none",
          animation: "demoFadeUp 0.3s ease",
        }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
            <span style={{ color: agent.color }}>{agent.name}</span> is walking over…
          </span>
        </div>
      )}

      {/* Speaking message strip */}
      {agent && phase === "speaking" && (
        <div style={{
          position: "fixed", bottom: 80, left: "50%", zIndex: 9998,
          transform: "translateX(-50%)", width: 460,
          background: "rgba(6,9,20,0.92)", border: `1px solid ${agent.color}55`,
          borderRadius: 10, padding: "12px 16px",
          backdropFilter: "blur(12px)", pointerEvents: "none",
          animation: "demoFadeUp 0.35s ease",
        }}>
          <div style={{ fontSize: 9, color: agent.color, fontWeight: 700, marginBottom: 5, letterSpacing: "1px", textTransform: "uppercase" }}>
            {agent.name} · {agent.zone}
          </div>
          <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
            {agent.message}
          </p>
        </div>
      )}

      {/* Done — human-in-the-loop + close */}
      {phase === "done" && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          zIndex: 9999, width: 480,
          background: "rgba(6,9,20,0.96)", border: "1px solid rgba(0,204,126,0.2)",
          borderRadius: 12, padding: "16px 18px",
          backdropFilter: "blur(14px)", pointerEvents: "all",
          animation: "demoFadeCenter 0.4s ease",
        }}>
          <HumanInput />
          <button
            onClick={onClose}
            style={{ marginTop: 12, width: "100%", padding: "8px 0", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "rgba(255,255,255,0.35)", fontSize: 11, cursor: "pointer" }}
          >Exit demo</button>
        </div>
      )}

      {/* Exit button — bottom-right corner, always visible */}
      {phase !== "done" && (
        <button
          onClick={onClose}
          style={{
            position: "fixed", bottom: 24, right: 20, zIndex: 9999,
            background: "rgba(6,9,20,0.8)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, padding: "7px 14px", color: "rgba(255,255,255,0.4)",
            fontSize: 11, cursor: "pointer", backdropFilter: "blur(8px)",
            pointerEvents: "all",
          }}
        >✕ Exit demo</button>
      )}
    </>
  );
}

// ── Main DemoPlayer ───────────────────────────────────────────────────────────

type Mode = "briefing" | "office";
type OfficePhase = "init" | "walking" | "speaking" | "done";

export default function DemoPlayer({ initialMode = "briefing", onClose }: { initialMode?: Mode; onClose: () => void }) {
  const [mode] = useState<Mode>(initialMode);

  // ── Briefing state ──────────────────────────────────────────────────────────
  const [briefPhase, setBriefPhase] = useState<"init" | "agents" | "done">("init");
  const [briefActiveIdx, setBriefActiveIdx] = useState(-1);
  const [briefDoneSet, setBriefDoneSet] = useState<Set<number>>(new Set());

  // ── Office state (driven by GameScene events) ───────────────────────────────
  const [officePhase, setOfficePhase] = useState<OfficePhase>("init");
  const [officeActiveIdx, setOfficeActiveIdx] = useState(-1);
  const [officeDoneSet, setOfficeDoneSet] = useState<Set<number>>(new Set());

  const handleClose = () => {
    EventBus.emit("demo:office-end", {});
    onClose();
  };

  // ── Office mode: tell GameScene to start, listen for progress events ────────
  useEffect(() => {
    if (mode !== "office") return;

    // Kick off the Phaser-driven sequence
    setTimeout(() => {
      EventBus.emit("demo:office-start", {
        steps: AGENTS.map(a => ({ npcName: a.name, message: a.message, durationMs: STEP_DURATION })),
      });
    }, 600);

    const onWalking = (data: { npcName: string; idx: number }) => {
      setOfficeActiveIdx(data.idx);
      setOfficePhase("walking");
    };
    const onSpeaking = (data: { npcName: string; idx: number }) => {
      setOfficeActiveIdx(data.idx);
      setOfficePhase("speaking");
    };
    const onComplete = () => {
      setOfficeDoneSet(new Set(AGENTS.map((_, i) => i)));
      setOfficeActiveIdx(-1);
      setOfficePhase("done");
    };

    EventBus.on("demo:npc-walking", onWalking);
    EventBus.on("demo:npc-speaking", onSpeaking);
    EventBus.on("demo:complete", onComplete);

    return () => {
      EventBus.off("demo:npc-walking", onWalking);
      EventBus.off("demo:npc-speaking", onSpeaking);
      EventBus.off("demo:complete", onComplete);
    };
  }, [mode]);

  // Mark done when speaking phase transitions
  useEffect(() => {
    if (officePhase === "walking" && officeActiveIdx > 0) {
      setOfficeDoneSet(prev => new Set([...prev, officeActiveIdx - 1]));
    }
  }, [officePhase, officeActiveIdx]);

  // ── Briefing mode: React drives the timing ──────────────────────────────────
  useEffect(() => {
    if (mode !== "briefing") return;
    setBriefPhase("init");
    setBriefActiveIdx(-1);
    setBriefDoneSet(new Set());
    const t = setTimeout(() => setBriefPhase("agents"), 800);
    return () => clearTimeout(t);
  }, [mode]);

  useEffect(() => {
    if (mode !== "briefing" || briefPhase !== "agents") return;
    let idx = 0;
    const next = () => {
      if (idx >= AGENTS.length) { setBriefPhase("done"); setBriefActiveIdx(-1); return; }
      setBriefActiveIdx(idx);
      const i = idx;
      setTimeout(() => {
        setBriefDoneSet(prev => new Set([...prev, i]));
        idx++;
        setTimeout(next, 300);
      }, STEP_DURATION);
    };
    const t = setTimeout(next, 200);
    return () => clearTimeout(t);
  }, [mode, briefPhase]);

  // ── Office mode render ──────────────────────────────────────────────────────
  if (mode === "office") {
    return (
      <OfficeHUD
        activeIdx={officeActiveIdx}
        doneSet={officeDoneSet}
        phase={officePhase}
        onClose={handleClose}
      />
    );
  }

  // ── Briefing mode render ────────────────────────────────────────────────────
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(14px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
    }}>
      <style>{`
        @keyframes demoPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes demoBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes demoFadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
      `}</style>

      <div style={{
        width: "100%", maxWidth: 700, maxHeight: "90vh", overflow: "auto",
        background: "rgba(6,9,20,0.98)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14, boxShadow: "0 40px 120px rgba(0,0,0,0.8)",
      }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,204,126,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00cc7e", animation: "demoPulse 1.5s infinite" }} />
              <span style={{ fontSize: 10, letterSpacing: "3px", color: "#00cc7e", textTransform: "uppercase" }}>FrontierLabs · Live Session</span>
            </div>
            <p style={{ margin: "3px 0 1px", fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>
              NeuroSync Korea — TIPS 2026 Spring Cohort
            </p>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
              Ministry of SMEs &amp; Startups · ₩1B R&amp;D grant · Deadline 15 April 2026
            </p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "6px 13px", color: "rgba(255,255,255,0.45)", fontSize: 12, cursor: "pointer" }}>
            ✕ Close
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {briefPhase === "init" && (
            <div style={{ textAlign: "center", padding: "36px 0" }}>
              <div style={{ fontSize: 11, letterSpacing: "2px", color: "#00cc7e", marginBottom: 14 }}>INITIALISING AGENT NETWORK</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 5 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#00cc7e", animation: `demoPulse 1s ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          {(briefPhase === "agents" || briefPhase === "done") && AGENTS.map((a, i) => (
            <BriefingCard key={a.id} agent={a} active={briefActiveIdx === i} done={briefDoneSet.has(i)} />
          ))}
          {briefPhase === "done" && <FinalReveal onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}
