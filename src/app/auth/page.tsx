"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n";
import { getLocalizedErrorMessage } from "@/lib/i18n/error-codes";
import LocaleSwitcher from "@/components/LocaleSwitcher";

const isComingSoon = process.env.NEXT_PUBLIC_COMING_SOON === "true";
const isRegistrationDisabled = process.env.NEXT_PUBLIC_REGISTRATION_DISABLED === "true";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loginId, setLoginId] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
    }).catch(() => {
      setChecking(false);
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload =
      mode === "login"
        ? { loginId, password }
        : { loginId, nickname, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(getLocalizedErrorMessage(t, data));
        return;
      }

      router.push("/characters");
    } catch {
      setError(t("common.networkError"));
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="theme-web min-h-screen flex items-center justify-center bg-bg text-text">
        {t("auth.checkingAuth")}
      </div>
    );
  }

  return (
    <div className="theme-web min-h-screen relative bg-white">

      {/* Language switcher */}
      <div className="fixed top-4 right-4 z-30">
        <LocaleSwitcher />
      </div>

      {/* Login card - centered */}
      <div className="fixed inset-0 flex items-start justify-center pt-[15vh] z-20 pointer-events-none">
        <div className="max-w-[360px] w-[90%] pointer-events-auto">
          {/* Title */}
          <div className="text-center mb-4">
            {/* FrontierLabs logo */}
            <div className="flex justify-center mb-2">
              <svg viewBox="0 0 400 100" width="280" height="70">
                <text x="75" y="62" fontFamily="'Outfit', system-ui, sans-serif" fontSize="40" fill="#111827" fontWeight="700">Frontier</text>
                <text x="258" y="62" fontFamily="'JetBrains Mono', monospace" fontSize="36" fill="#374151" fontWeight="700">·labs</text>
              </svg>
            </div>
            <p
              className="text-[10px] tracking-[6px] mt-1"
              style={{ color: "#374151" }}
            >
              {t("auth.heroTagline")}
            </p>
            <p className="mt-3 text-sm text-gray-500">
              {t("auth.heroSubtitle")}
            </p>
          </div>

          {/* Card */}
          <div
            className="rounded-[14px] p-6"
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
          >
            {isComingSoon ? (
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-5">{t("auth.comingSoon")}</div>
                <a
                  href="https://github.com/dandacompany/deskrpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full py-2.5 rounded-lg text-white font-semibold text-sm text-center"
                  style={{
                  background: "#111827",
                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                }}
                >
                  {t("auth.comingSoonGithub")}
                </a>
              </div>
            ) : (
            <>
            {/* Tab switcher — hidden during fresh setup or when registration is disabled */}
            {hasUsers && !isRegistrationDisabled && (
              <div className="flex mb-5 rounded-lg overflow-hidden border border-border">
                <button
                  onClick={() => setMode("login")}
                  className={`flex-1 py-2.5 text-center text-sm font-semibold transition-colors ${
                    mode === "login"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {t("auth.register")}
                </button>
              </div>
            )}

            {/* Fresh install description */}
            {!hasUsers && (
              <p className="text-center text-sm text-text-secondary mb-5">
                {t("auth.setupDescription")}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder={t("auth.loginIdPlaceholder")}
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm placeholder-gray-400"
                minLength={2}
                maxLength={50}
                required
              />
              {mode === "register" && (
                <input
                  type="text"
                  placeholder={t("auth.displayNamePlaceholder")}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm placeholder-gray-400"
                  minLength={2}
                  maxLength={50}
                  required
                />
              )}
              <input
                type="password"
                placeholder={t("auth.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm placeholder-gray-400"
                minLength={4}
                required
              />
              {error && <p className="text-danger text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-white font-semibold text-sm disabled:opacity-50 mt-2"
                style={{
                  background: "#111827",
                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                }}
              >
                {loading
                  ? mode === "login"
                    ? t("auth.loggingIn")
                    : t("auth.registering")
                  : !hasUsers
                  ? t("auth.getStarted")
                  : mode === "login"
                  ? t("auth.login")
                  : t("auth.register")}
              </button>
            </form>
            </>
            )}
          {/* Demo button */}
          <div className="mt-4 text-center">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <button
              onClick={async () => {
                setError("");
                setLoading(true);
                try {
                  const res = await fetch("/api/auth/demo", { method: "POST" });
                  let data: { error?: string; characterId?: string; channelId?: string } = {};
                  try { data = await res.json(); } catch { /* non-JSON response */ }
                  if (!res.ok) {
                    setError(data.error || "Demo unavailable — please try again.");
                    return;
                  }
                  if (data.characterId && data.channelId) {
                    router.push(`/game?characterId=${data.characterId}&channelId=${data.channelId}`);
                  } else {
                    router.push("/characters");
                  }
                } catch {
                  setError("Network error");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
              style={{
                background: "transparent",
                border: "1px solid #d1d5db",
                color: "#374151",
              }}
            >
              ✦ Try the Demo
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
