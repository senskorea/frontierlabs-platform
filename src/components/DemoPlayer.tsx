"use client";
import { useEffect, useRef, useState } from "react";

interface AgentStep {
  id: string;
  name: string;
  color: string;
  role: string;
  message: string;
  stat?: string;
}

const AGENTS: AgentStep[] = [
  {
    id: "scout",
    name: "The Scout",
    color: "#3B82F6",
    role: "Intelligence",
    message: "Scanned 847 Korean VC contacts. Samsung Ventures scores 94/100 fit — their 'Next Paradigm' fund targets exactly this TRL range. Lead partner: Lee Min-jun. First meeting window confirmed: 14 March 2026.",
    stat: "94/100 fit score",
  },
  {
    id: "strategist",
    name: "The Strategist",
    color: "#10B981",
    role: "Narrative",
    message: "Positioning locked. NeuroSync is not a BCI device company — it's Korea's first neuro-data infrastructure layer. This framing maps directly to Samsung's thesis and sidesteps the medical device regulatory question entirely.",
    stat: "Narrative validated",
  },
  {
    id: "writer",
    name: "The Writer",
    color: "#F59E0B",
    role: "Documents",
    message: "Pitch deck complete: 14 slides, zero filler. Executive summary: one page. Data room indexed: 47 documents. Every claim backed by a primary source. Ready to send to Samsung Ventures on your instruction.",
    stat: "47 docs indexed",
  },
  {
    id: "architect",
    name: "The Architect",
    color: "#8B5CF6",
    role: "Financials",
    message: "Raise: ₩6B at ₩30B pre-money. Use of funds: 35% R&D, 30% clinical validation, 25% expansion, 10% ops. Runway confirmed at 32 months. Break-even at month 26. Sensitivity analysis complete.",
    stat: "32-month runway",
  },
  {
    id: "team",
    name: "The Team Builder",
    color: "#EF4444",
    role: "Consortium",
    message: "Lead investor confirmed: Samsung Ventures (₩4B). Co-investor confirmed: Kakao Ventures (₩2B). Board advisor added: Prof. Kim Hyun-soo, KAIST BCI Lab Director. All reference checks cleared.",
    stat: "₩6B committed",
  },
];

const STEP_DURATION = 4200;
const TYPE_SPEED = 18;

function useTypewriter(text: string, active: boolean) {
  const [displayed, setDisplayed] = useState("");
  const idx = useRef(0);
  useEffect(() => {
    if (!active) { setDisplayed(""); idx.current = 0; return; }
    idx.current = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      idx.current += 1;
      setDisplayed(text.slice(0, idx.current));
      if (idx.current >= text.length) clearInterval(interval);
    }, TYPE_SPEED);
    return () => clearInterval(interval);
  }, [text, active]);
  return displayed;
}

function AgentCard({ agent, active, done }: { agent: AgentStep; active: boolean; done: boolean }) {
  const text = useTypewriter(agent.message, active);
  return (
    <div style={{
      borderRadius: 10,
      border: `1px solid ${active || done ? agent.color + "55" : "rgba(255,255,255,0.06)"}`,
      background: active ? `${agent.color}10` : done ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.2)",
      padding: "14px 16px",
      transition: "all 0.4s ease",
      opacity: !active && !done ? 0.35 : 1,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%",
          background: active || done ? agent.color : "#444",
          boxShadow: active ? `0 0 10px ${agent.color}` : "none",
          transition: "all 0.3s",
          animation: active ? "pulse 1s infinite" : "none",
        }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "0.3px" }}>{agent.name}</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginLeft: 2 }}>— {agent.role}</span>
        {done && agent.stat && (
          <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, color: agent.color, letterSpacing: "0.5px" }}>
            ✓ {agent.stat}
          </span>
        )}
        {active && (
          <span style={{ marginLeft: "auto", fontSize: 11, color: agent.color, animation: "blink 0.8s infinite" }}>
            LIVE
          </span>
        )}
      </div>
      {(active || done) && (
        <p style={{ margin: 0, fontSize: 12.5, color: "rgba(255,255,255,0.7)", lineHeight: 1.65 }}>
          {active ? text : agent.message}
          {active && <span style={{ animation: "blink 0.6s infinite", color: agent.color }}>▌</span>}
        </p>
      )}
    </div>
  );
}

export default function DemoPlayer({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<"init" | "agents" | "done">("init");
  const [activeIdx, setActiveIdx] = useState(-1);
  const [doneSet, setDoneSet] = useState<Set<number>>(new Set());

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("agents"), 1200);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (phase !== "agents") return;
    let idx = 0;
    const next = () => {
      if (idx >= AGENTS.length) { setPhase("done"); setActiveIdx(-1); return; }
      setActiveIdx(idx);
      const i = idx;
      setTimeout(() => {
        setDoneSet(prev => new Set([...prev, i]));
        idx++;
        setTimeout(next, 400);
      }, STEP_DURATION);
    };
    const t = setTimeout(next, 300);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.88)",
      backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes slideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }
        @keyframes countUp { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
      `}</style>

      <div style={{
        width: "100%", maxWidth: 680,
        background: "rgba(8,12,24,0.97)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        boxShadow: "0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,204,126,0.08)",
        overflow: "hidden",
        animation: "fadeIn 0.35s ease",
      }}>

        {/* Header */}
        <div style={{
          padding: "18px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,204,126,0.04)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00cc7e", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: 11, letterSpacing: "3px", color: "#00cc7e", textTransform: "uppercase" }}>
                FrontierLabs · Live Session
              </span>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>
              NeuroSync Korea — Series A 2026
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              Samsung Ventures + Kakao Ventures · ₩6B raise
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 14px", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}
          >
            ✕ Close
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 10 }}>

          {phase === "init" && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.4)", animation: "fadeIn 0.3s ease" }}>
              <div style={{ fontSize: 13, letterSpacing: "2px", marginBottom: 16, color: "#00cc7e" }}>INITIALISING AGENT NETWORK</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#00cc7e", animation: `pulse 1s ${i * 0.25}s infinite` }} />
                ))}
              </div>
            </div>
          )}

          {(phase === "agents" || phase === "done") && AGENTS.map((agent, i) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              active={activeIdx === i}
              done={doneSet.has(i)}
            />
          ))}
        </div>

        {/* Footer — final reveal */}
        {phase === "done" && (
          <div style={{
            margin: "0 24px 24px",
            borderRadius: 10,
            background: "linear-gradient(135deg, rgba(0,204,126,0.12), rgba(0,136,255,0.08))",
            border: "1px solid rgba(0,204,126,0.25)",
            padding: "20px 24px",
            animation: "countUp 0.5s ease",
          }}>
            <div style={{ fontSize: 11, letterSpacing: "3px", color: "#00cc7e", marginBottom: 12, textTransform: "uppercase" }}>
              Series A Ready
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {[
                { label: "Total raise", value: "₩6B", sub: "Samsung ₩4B + Kakao ₩2B" },
                { label: "Pre-money valuation", value: "₩30B", sub: "94/100 investor fit score" },
                { label: "Runway", value: "32 months", sub: "Break-even at month 26" },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              Term sheet expected by 21 March 2026 · All 5 agents standing by
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
