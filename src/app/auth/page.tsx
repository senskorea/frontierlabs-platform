"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n";
import { getLocalizedErrorMessage } from "@/lib/i18n/error-codes";

const isComingSoon = process.env.NEXT_PUBLIC_COMING_SOON === "true";
const isRegistrationDisabled = process.env.NEXT_PUBLIC_REGISTRATION_DISABLED === "true";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loginId, setLoginId] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasUsers, setHasUsers] = useState(true);
  const router = useRouter();
  const t = useT();

  useEffect(() => {
    Promise.all([
      fetch("/api/characters", { redirect: "manual" }),
      fetch("/api/auth/status").then((r) => r.ok ? r.json() : { hasUsers: true }).catch(() => ({ hasUsers: true })),
    ]).then(([charRes, status]) => {
      if (charRes.ok) {
        router.replace("/characters");
      } else {
        setHasUsers(status.hasUsers);
        if (!status.hasUsers) setMode("register");
        else if (isRegistrationDisabled) setMode("login");
        setChecking(false);
      }
    }).catch(() => setChecking(false));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload = mode === "login" ? { loginId, password } : { loginId, nickname, password };
    try {
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { setError(getLocalizedErrorMessage(t, data)); return; }
      router.push("/characters");
    } catch {
      setError(t("common.networkError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo() {
    setError("");
    setDemoLoading(true);
    try {
      const res = await fetch("/api/auth/demo", { method: "POST" });
      let data: { error?: string; characterId?: string; channelId?: string } = {};
      try { data = await res.json(); } catch { /* non-JSON */ }
      if (!res.ok) { setError(data.error || "Demo unavailable — please try again."); return; }
      if (data.characterId && data.channelId) {
        router.push(`/game?characterId=${data.characterId}&channelId=${data.channelId}`);
      } else {
        router.push("/characters");
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setDemoLoading(false);
    }
  }

  if (checking) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", color: "#111" }}>Loading…</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column" }}>

      {/* Top bar */}
      <header style={{ borderBottom: "1px solid #e5e5e5", padding: "0 40px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Globe mark */}
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <circle cx="13" cy="13" r="11.5" stroke="#111" strokeWidth="1.2"/>
            <ellipse cx="13" cy="13" rx="5.5" ry="11.5" stroke="#111" strokeWidth="1"/>
            <ellipse cx="13" cy="13" rx="11.5" ry="4" stroke="#111" strokeWidth="1.2"/>
            <line x1="13" y1="1.5" x2="13" y2="24.5" stroke="#111" strokeWidth="0.8"/>
            <circle cx="13" cy="13" r="2" fill="#111"/>
          </svg>
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.3px", color: "#111", fontFamily: "system-ui, sans-serif" }}>
            Frontier<span style={{ color: "#00b86b" }}>·labs</span>
          </span>
        </div>
        <span style={{ fontSize: 11, letterSpacing: "3px", color: "#999", textTransform: "uppercase" }}>
          Grant Intelligence Platform
        </span>
      </header>

      {/* Main layout */}
      <div style={{ flex: 1, display: "flex" }}>

        {/* Left — hero copy */}
        <div style={{ flex: 1, padding: "80px 60px", display: "flex", flexDirection: "column", justifyContent: "center", borderRight: "1px solid #e5e5e5" }}>
          <p style={{ fontSize: 11, letterSpacing: "4px", color: "#00b86b", marginBottom: 24, textTransform: "uppercase" }}>The Citadel</p>
          <h1 style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.05, color: "#111", margin: "0 0 24px", letterSpacing: "-1.5px", fontFamily: "system-ui, sans-serif" }}>
            Your AI grant<br />writing team,<br />ready to deploy.
          </h1>
          <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7, maxWidth: 360, margin: 0 }}>
            Five specialised agents work in parallel — scouting opportunities,
            shaping narratives, drafting proposals, building budgets, and assembling consortia.
          </p>
          <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { label: "The Scout", desc: "Identifies high-fit funding calls" },
              { label: "The Strategist", desc: "Shapes your narrative angle" },
              { label: "The Writer", desc: "Drafts grounded proposal sections" },
              { label: "The Architect", desc: "Structures budgets and workplans" },
              { label: "The Team Builder", desc: "Assembles and validates consortia" },
            ].map((a) => (
              <div key={a.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00b86b", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#111", fontWeight: 500 }}>{a.label}</span>
                <span style={{ fontSize: 13, color: "#999" }}>— {a.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — login form */}
        <div style={{ width: 400, padding: "80px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>

          {isComingSoon ? (
            <div>
              <p style={{ fontSize: 24, fontWeight: 700, color: "#111", marginBottom: 16 }}>{t("auth.comingSoon")}</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 22, fontWeight: 700, color: "#111", margin: "0 0 32px", letterSpacing: "-0.5px" }}>
                {!hasUsers ? "Create your account" : mode === "login" ? "Sign in" : "Create account"}
              </p>

              {/* Demo button — primary CTA */}
              <button
                onClick={handleDemo}
                disabled={demoLoading || loading}
                style={{
                  width: "100%", padding: "13px 0", background: "#111", color: "#fff",
                  border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600,
                  cursor: demoLoading ? "wait" : "pointer", marginBottom: 24,
                  letterSpacing: "0.1px", transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#333")}
                onMouseLeave={e => (e.currentTarget.style.background = "#111")}
              >
                {demoLoading ? "Loading…" : "✦ Try the demo"}
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ flex: 1, height: 1, background: "#e5e5e5" }} />
                <span style={{ fontSize: 12, color: "#aaa" }}>or sign in</span>
                <div style={{ flex: 1, height: 1, background: "#e5e5e5" }} />
              </div>

              {/* Tab switcher */}
              {hasUsers && !isRegistrationDisabled && (
                <div style={{ display: "flex", gap: 0, marginBottom: 24, border: "1px solid #e5e5e5", borderRadius: 6, overflow: "hidden" }}>
                  {(["login", "register"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => { setMode(m); setError(""); }}
                      style={{
                        flex: 1, padding: "9px 0", fontSize: 13, fontWeight: 500,
                        background: mode === m ? "#111" : "#fff",
                        color: mode === m ? "#fff" : "#666",
                        border: "none", cursor: "pointer", transition: "all 0.15s",
                      }}
                    >
                      {m === "login" ? "Sign in" : "Register"}
                    </button>
                  ))}
                </div>
              )}

              {!hasUsers && (
                <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>{t("auth.setupDescription")}</p>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input
                  type="text"
                  placeholder="Login ID"
                  value={loginId}
                  onChange={e => setLoginId(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", border: "1px solid #e5e5e5", borderRadius: 6, fontSize: 14, color: "#111", outline: "none", boxSizing: "border-box" }}
                  minLength={2} maxLength={50} required
                />
                {mode === "register" && (
                  <input
                    type="text"
                    placeholder="Display name"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    style={{ width: "100%", padding: "11px 14px", border: "1px solid #e5e5e5", borderRadius: 6, fontSize: 14, color: "#111", outline: "none", boxSizing: "border-box" }}
                    minLength={2} maxLength={50} required
                  />
                )}
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", border: "1px solid #e5e5e5", borderRadius: 6, fontSize: 14, color: "#111", outline: "none", boxSizing: "border-box" }}
                  minLength={4} required
                />
                {error && <p style={{ fontSize: 13, color: "#d00", margin: 0 }}>{error}</p>}
                <button
                  type="submit"
                  disabled={loading || demoLoading}
                  style={{
                    width: "100%", padding: "11px 0", background: "#fff", color: "#111",
                    border: "1px solid #111", borderRadius: 6, fontSize: 14, fontWeight: 600,
                    cursor: loading ? "wait" : "pointer", marginTop: 4,
                  }}
                >
                  {loading ? "Loading…" : mode === "login" ? "Sign in" : "Create account"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #e5e5e5", padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#bbb" }}>© 2025 FrontierLabs</span>
        <span style={{ fontSize: 12, color: "#bbb" }}>AI-powered grant intelligence</span>
      </footer>
    </div>
  );
}
