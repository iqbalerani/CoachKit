import { useState } from "react";

const COLORS = {
  bg: "#F2F3F7",
  card: "#FFFFFF",
  text: "#1A1D2E",
  textSecondary: "#6B7082",
  textMuted: "#A0A4B8",
  accent: "#3B5BDB",
  accentLight: "#EDF2FF",
  accentDark: "#2B4299",
  success: "#2B9E5A",
  successLight: "#E8F8EF",
  purple: "#7048C6",
  purpleLight: "#F3EFFE",
  orange: "#E8590C",
  border: "#E8EAF0",
  headerGradient1: "#1E2A5E",
  headerGradient2: "#3B5BDB",
  creatorGradient1: "#4C1D95",
  creatorGradient2: "#7C3AED",
};

const COACHES = [
  { id: 1, icon: "🎯", name: "The Essentialist", desc: "Focus & priorities", color: "#3B5BDB", tagline: "Do less, but better" },
  { id: 2, icon: "♟️", name: "The Strategist", desc: "Decisions & frameworks", color: "#7048C6", tagline: "Think in frameworks" },
  { id: 3, icon: "🚀", name: "Career Coach", desc: "Growth & negotiation", color: "#E8590C", tagline: "Level up your career" },
  { id: 4, icon: "✍️", name: "The Writer", desc: "Writing & storytelling", color: "#9C5087", tagline: "Craft better words" },
  { id: 5, icon: "🧘", name: "Mindset Coach", desc: "Clarity & resilience", color: "#1B9AAA", tagline: "Build inner strength" },
  { id: 6, icon: "💪", name: "Accountability", desc: "Goals & follow-through", color: "#C77A19", tagline: "Stay on track" },
];

const PhoneFrame = ({ children, screenLabel }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
    <div style={{
      width: 310, height: 644, borderRadius: 36, background: "#111",
      padding: 8, position: "relative",
      boxShadow: "0 24px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)",
    }}>
      <div style={{
        width: "100%", height: "100%", borderRadius: 30, background: COLORS.bg,
        overflow: "hidden", position: "relative", display: "flex", flexDirection: "column",
      }}>
        {children}
      </div>
    </div>
    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#666", fontWeight: 500 }}>
      {screenLabel}
    </span>
  </div>
);

const StatusBar = ({ light = false }) => (
  <div style={{
    height: 44, display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 24px", fontSize: 13, fontWeight: 600,
    color: light ? "#fff" : COLORS.text, flexShrink: 0, position: "relative", zIndex: 10,
  }}>
    <span>9:41</span>
    <div style={{
      width: 72, height: 22, background: light ? "rgba(0,0,0,0.3)" : "#000",
      borderRadius: 14, position: "absolute", left: "50%", transform: "translateX(-50%)", top: 8,
    }} />
    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
      <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
        <path d="M1 7.5h2v3H1zM5 5h2v6H5zM9 3h2v8H9zM13 0.5h2v10.5h-2z" fill={light ? "#fff" : COLORS.text} opacity="0.8"/>
      </svg>
    </div>
  </div>
);

const TabBar = ({ active = "home", isBuilder = false }) => {
  const seekerTabs = [
    { id: "home", label: "Home", icon: "M3 10.5L12 3l9 7.5v9.5a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z" },
    { id: "coaches", label: "Coaches", icon: "M12 2a4 4 0 100 8 4 4 0 000-8zM4 6a3 3 0 100 6 3 3 0 000-6z" },
    { id: "profile", label: "Profile", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" },
  ];
  const builderTabs = [
    { id: "home", label: "Home", icon: "M3 10.5L12 3l9 7.5v9.5a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z" },
    { id: "coaches", label: "Library", icon: "M12 2a4 4 0 100 8 4 4 0 000-8z" },
    { id: "create", label: "Create", icon: "M12 5v14M5 12h14" },
    { id: "profile", label: "Profile", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" },
  ];
  const tabs = isBuilder ? builderTabs : seekerTabs;
  
  return (
    <div style={{
      height: 58, display: "flex", borderTop: `1px solid ${COLORS.border}`,
      background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)", flexShrink: 0,
    }}>
      {tabs.map(t => (
        <div key={t.id} style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 3, cursor: "pointer",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke={active === t.id ? COLORS.accent : COLORS.textMuted}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={t.icon} />
          </svg>
          <span style={{
            fontSize: 10, fontWeight: active === t.id ? 700 : 500,
            color: active === t.id ? COLORS.accent : COLORS.textMuted,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {t.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const ProgressRing = ({ percent, size = 56, stroke = 5, color = COLORS.accent }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════
// ONBOARDING SCREENS
// ═══════════════════════════════════════════════════════════════

const OnboardingWelcome = () => (
  <div style={{
    height: "100%", display: "flex", flexDirection: "column",
    background: `linear-gradient(160deg, ${COLORS.headerGradient1} 0%, ${COLORS.headerGradient2} 100%)`,
  }}>
    <StatusBar light />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20, background: "rgba(255,255,255,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
        border: "1px solid rgba(255,255,255,0.15)",
      }}>
        <span style={{ fontSize: 36, color: "#fff", fontWeight: 800, fontFamily: "'DM Sans', sans-serif" }}>C</span>
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: 0, fontFamily: "'DM Sans', sans-serif", letterSpacing: -1 }}>
        CoachKit
      </h1>
      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", marginTop: 8, lineHeight: 1.55, fontFamily: "'DM Sans', sans-serif" }}>
        Your pocket team of AI coaches.<br />Get guidance. Build coaches. Share them.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 28 }}>
        {["🎯 Focused coaching", "🛠️ Build your own", "🔗 Share with anyone"].map((f, i) => (
          <span key={i} style={{
            background: "rgba(255,255,255,0.12)", borderRadius: 20, padding: "6px 14px",
            fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            {f}
          </span>
        ))}
      </div>
    </div>
    <div style={{ padding: "0 28px 36px" }}>
      <div style={{
        background: "#fff", color: COLORS.accent, borderRadius: 16, padding: "15px 0",
        fontSize: 16, fontWeight: 700, textAlign: "center", fontFamily: "'DM Sans', sans-serif",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      }}>
        Get Started
      </div>
    </div>
  </div>
);

const OnboardingIntent = () => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#fff" }}>
    <StatusBar />
    <div style={{ flex: 1, padding: "8px 24px 24px" }}>
      {/* Progress */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: COLORS.accent }} />
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: COLORS.border }} />
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: COLORS.border }} />
      </div>

      <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, margin: "0 0 6px", fontFamily: "'DM Sans', sans-serif", letterSpacing: -0.6 }}>
        What brings you here?
      </h2>
      <p style={{ fontSize: 13, color: COLORS.textSecondary, margin: "0 0 28px", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
        We'll personalize your experience based on your goal.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Seeker option */}
        <div style={{
          background: COLORS.accentLight, border: `2px solid ${COLORS.accent}`,
          borderRadius: 18, padding: "18px 20px", cursor: "pointer", position: "relative",
        }}>
          <div style={{
            position: "absolute", top: -10, right: 16,
            background: COLORS.accent, color: "#fff", fontSize: 9, fontWeight: 700,
            padding: "3px 10px", borderRadius: 10, fontFamily: "'DM Sans', sans-serif",
          }}>
            MOST POPULAR
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, background: `${COLORS.accent}20`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0,
            }}>
              🧭
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>
                I want coaching
              </div>
              <div style={{ fontSize: 12, color: COLORS.textSecondary, fontFamily: "'DM Sans', sans-serif", marginTop: 4, lineHeight: 1.5 }}>
                Get AI-powered guidance on goals, decisions, productivity, career, and more.
              </div>
            </div>
            <div style={{
              width: 22, height: 22, borderRadius: "50%", background: COLORS.accent,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 4,
            }}>
              ✓
            </div>
          </div>
        </div>

        {/* Builder option */}
        <div style={{
          background: "#fff", border: `2px solid ${COLORS.border}`,
          borderRadius: 18, padding: "18px 20px", cursor: "pointer",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, background: `${COLORS.purple}15`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0,
            }}>
              🛠️
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>
                I want to build
              </div>
              <div style={{ fontSize: 12, color: COLORS.textSecondary, fontFamily: "'DM Sans', sans-serif", marginTop: 4, lineHeight: 1.5 }}>
                Create custom AI coaches and share them with your audience or clients.
              </div>
            </div>
            <div style={{
              width: 22, height: 22, borderRadius: "50%", border: `2px solid ${COLORS.border}`,
              flexShrink: 0, marginTop: 4,
            }} />
          </div>
        </div>

        {/* Both option */}
        <div style={{
          background: "#fff", border: `2px solid ${COLORS.border}`,
          borderRadius: 18, padding: "18px 20px", cursor: "pointer",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, background: `${COLORS.orange}12`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0,
            }}>
              ✨
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>
                Both!
              </div>
              <div style={{ fontSize: 12, color: COLORS.textSecondary, fontFamily: "'DM Sans', sans-serif", marginTop: 4, lineHeight: 1.5 }}>
                Get coached AND build your own coaches for others.
              </div>
            </div>
            <div style={{
              width: 22, height: 22, borderRadius: "50%", border: `2px solid ${COLORS.border}`,
              flexShrink: 0, marginTop: 4,
            }} />
          </div>
        </div>
      </div>
    </div>

    <div style={{ padding: "12px 24px 28px", flexShrink: 0 }}>
      <div style={{
        background: COLORS.accent, color: "#fff", borderRadius: 16, padding: "15px 0",
        fontSize: 16, fontWeight: 700, textAlign: "center", fontFamily: "'DM Sans', sans-serif",
      }}>
        Continue
      </div>
    </div>
  </div>
);

const OnboardingContext = () => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#fff" }}>
    <StatusBar />
    <div style={{ flex: 1, overflow: "auto", padding: "8px 24px 24px" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: COLORS.accent }} />
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: COLORS.accent }} />
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: COLORS.border }} />
      </div>

      <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, margin: "0 0 4px", fontFamily: "'DM Sans', sans-serif", letterSpacing: -0.6 }}>
        About you
      </h2>
      <p style={{ fontSize: 13, color: COLORS.textSecondary, margin: "0 0 24px", fontFamily: "'DM Sans', sans-serif" }}>
        Your coaches will use this to personalize every session.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {[
          { label: "Your name", placeholder: "e.g. Simon", lines: 1 },
          { label: "What are you working on?", placeholder: "Building a YouTube channel about productivity...", lines: 2 },
          { label: "Biggest goal this year", placeholder: "Reach 100k subs and launch my first product...", lines: 2 },
        ].map((f, i) => (
          <div key={i}>
            <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 8, display: "block", fontFamily: "'DM Sans', sans-serif" }}>
              {f.label}
            </label>
            <div style={{
              background: COLORS.bg, border: `1.5px solid ${COLORS.border}`, borderRadius: 14,
              padding: "13px 16px", fontSize: 14, color: COLORS.textMuted,
              fontFamily: "'DM Sans', sans-serif", minHeight: f.lines > 1 ? 56 : "auto",
            }}>
              {f.placeholder}
            </div>
          </div>
        ))}
      </div>
    </div>

    <div style={{ padding: "12px 24px 28px", flexShrink: 0 }}>
      <div style={{
        background: COLORS.accent, color: "#fff", borderRadius: 16, padding: "15px 0",
        fontSize: 16, fontWeight: 700, textAlign: "center", fontFamily: "'DM Sans', sans-serif",
      }}>
        Continue
      </div>
    </div>
  </div>
);

const OnboardingStyle = () => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#fff" }}>
    <StatusBar />
    <div style={{ flex: 1, overflow: "auto", padding: "8px 24px 24px" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: COLORS.accent }} />
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: COLORS.accent }} />
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: COLORS.accent }} />
      </div>

      <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, margin: "0 0 4px", fontFamily: "'DM Sans', sans-serif", letterSpacing: -0.6 }}>
        Coaching style
      </h2>
      <p style={{ fontSize: 13, color: COLORS.textSecondary, margin: "0 0 24px", fontFamily: "'DM Sans', sans-serif" }}>
        How do you prefer to be coached?
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { label: "Gentle", desc: "Patient, encouraging. Guides you to your own answers.", emoji: "🌱", selected: false },
          { label: "Balanced", desc: "Warm but direct. Support with healthy challenge.", emoji: "⚖️", selected: true },
          { label: "Direct", desc: "Straight to it. No fluff. Challenges assumptions.", emoji: "⚡", selected: false },
        ].map((s, i) => (
          <div key={i} style={{
            background: s.selected ? COLORS.accentLight : "#fff",
            border: `2px solid ${s.selected ? COLORS.accent : COLORS.border}`,
            borderRadius: 16, padding: "14px 16px", cursor: "pointer",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: s.selected ? `${COLORS.accent}15` : COLORS.bg,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>
                {s.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>{s.label}</div>
                <div style={{ fontSize: 12, color: COLORS.textSecondary, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{s.desc}</div>
              </div>
              {s.selected && (
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", background: COLORS.accent,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 11, fontWeight: 700,
                }}>
                  ✓
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

    <div style={{ padding: "12px 24px 28px", flexShrink: 0 }}>
      <div style={{
        background: COLORS.accent, color: "#fff", borderRadius: 16, padding: "15px 0",
        fontSize: 16, fontWeight: 700, textAlign: "center", fontFamily: "'DM Sans', sans-serif",
      }}>
        Start Coaching →
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// SEEKER FLOW SCREENS
// ═══════════════════════════════════════════════════════════════

const SeekerHome = () => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
    <div style={{
      background: `linear-gradient(160deg, ${COLORS.headerGradient1} 0%, ${COLORS.headerGradient2} 100%)`,
      padding: "0 0 24px", flexShrink: 0, borderRadius: "0 0 26px 26px",
    }}>
      <StatusBar light />
      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: 21, fontWeight: 800, color: "#fff", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
              Good evening, Iqbal
            </h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "2px 0 0", fontFamily: "'DM Sans', sans-serif" }}>
              Ready for a coaching session?
            </p>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "6px 12px",
            fontSize: 13, color: "#fff", fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            🔥 5
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <div style={{
            flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "12px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <ProgressRing percent={60} size={40} stroke={4} color="#5CC8FF" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>3/5</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif" }}>Today</div>
            </div>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>12</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif" }}>Sessions</div>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>4</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif" }}>Coaches</div>
          </div>
        </div>
      </div>
    </div>

    <div style={{ flex: 1, overflow: "auto", padding: "16px 16px 8px" }}>
      {/* Continue Session */}
      <div style={{ marginBottom: 18 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, margin: "0 0 10px 2px", fontFamily: "'DM Sans', sans-serif" }}>
          Continue Session
        </h3>
        <div style={{
          background: COLORS.card, borderRadius: 16, padding: "14px",
          display: "flex", alignItems: "center", gap: 12,
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)", border: `1px solid ${COLORS.border}`,
        }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14,
            background: `linear-gradient(135deg, ${COACHES[0].color}20, ${COACHES[0].color}08)`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          }}>
            🎯
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>The Essentialist</div>
            <div style={{ fontSize: 11, color: COLORS.textSecondary, fontFamily: "'DM Sans', sans-serif" }}>
              "Let's revisit your priorities..."
            </div>
          </div>
          <div style={{
            width: 34, height: 34, borderRadius: 10, background: COLORS.accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 14,
          }}>
            ▶
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, margin: "0 0 10px 2px", fontFamily: "'DM Sans', sans-serif" }}>
          Quick Start
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            { icon: "🎯", label: "Focus", color: COACHES[0].color },
            { icon: "♟️", label: "Decide", color: COACHES[1].color },
            { icon: "🚀", label: "Career", color: COACHES[2].color },
            { icon: "🧘", label: "Mindset", color: COACHES[4].color },
          ].map((q, i) => (
            <div key={i} style={{
              background: COLORS.card, borderRadius: 12, padding: "12px 16px",
              display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
              border: `1px solid ${COLORS.border}`, flex: "1 1 45%", minWidth: 120,
            }}>
              <span style={{ fontSize: 18 }}>{q.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>{q.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade banner */}
      <div style={{
        marginTop: 18, background: `linear-gradient(135deg, ${COLORS.accent}12, ${COLORS.accent}05)`,
        borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
        border: `1px solid ${COLORS.accent}20`,
      }}>
        <div style={{ fontSize: 24 }}>⚡</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>
            2 messages left today
          </div>
          <div style={{ fontSize: 11, color: COLORS.textSecondary, fontFamily: "'DM Sans', sans-serif" }}>
            Upgrade to Pro for unlimited
          </div>
        </div>
        <div style={{
          background: COLORS.accent, color: "#fff", borderRadius: 8, padding: "6px 12px",
          fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
        }}>
          Upgrade
        </div>
      </div>
    </div>
    <TabBar active="home" isBuilder={false} />
  </div>
);

const SeekerPaywall = () => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#fff" }}>
    <StatusBar />
    <div style={{ flex: 1, overflow: "auto", padding: "0 22px", textAlign: "center" }}>
      <div style={{ fontSize: 13, color: COLORS.textMuted, cursor: "pointer", textAlign: "left", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>✕</div>

      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "8px auto 12px", fontSize: 26, color: "#fff", fontWeight: 800,
        fontFamily: "'DM Sans', sans-serif", boxShadow: `0 4px 16px ${COLORS.accent}40`,
      }}>
        C
      </div>
      <div style={{
        display: "inline-block", background: COLORS.accentLight, borderRadius: 20,
        padding: "4px 14px", marginBottom: 8,
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.accent, fontFamily: "'DM Sans', sans-serif" }}>PRO</span>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: "0 0 4px", fontFamily: "'DM Sans', sans-serif", letterSpacing: -0.5 }}>
        Unlimited Coaching
      </h2>
      <p style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>
        No limits. Just results.
      </p>

      {/* Features */}
      <div style={{ textAlign: "left", margin: "20px 0 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { icon: "∞", title: "Unlimited messages", desc: "Chat as much as you need", color: COLORS.accent },
          { icon: "🧠", title: "Extended context", desc: "Coaches know you deeply", color: COLORS.purple },
          { icon: "📥", title: "Export conversations", desc: "Save your best sessions", color: COLORS.orange },
          { icon: "⚡", title: "Priority responses", desc: "Faster AI processing", color: "#2B9E5A" },
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11, background: `${f.color}12`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
            }}>
              {f.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>{f.title}</div>
              <div style={{ fontSize: 11, color: COLORS.textSecondary, fontFamily: "'DM Sans', sans-serif" }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div style={{ display: "flex", gap: 10, margin: "8px 0" }}>
        <div style={{ flex: 1, border: `2px solid ${COLORS.border}`, borderRadius: 14, padding: "14px 8px", textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted, letterSpacing: 0.8, fontFamily: "'DM Sans', sans-serif" }}>MONTHLY</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: "4px 0 2px", fontFamily: "'DM Sans', sans-serif" }}>$4.99</div>
          <div style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: "'DM Sans', sans-serif" }}>/month</div>
        </div>
        <div style={{
          flex: 1, border: `2px solid ${COLORS.accent}`, borderRadius: 14, padding: "14px 8px",
          textAlign: "center", position: "relative", background: `${COLORS.accent}04`,
        }}>
          <div style={{
            position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)",
            background: COLORS.accent, color: "#fff", fontSize: 8, fontWeight: 800,
            padding: "2px 10px", borderRadius: 10, fontFamily: "'DM Sans', sans-serif",
          }}>
            BEST VALUE
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted, letterSpacing: 0.8, fontFamily: "'DM Sans', sans-serif" }}>YEARLY</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: "4px 0 2px", fontFamily: "'DM Sans', sans-serif" }}>$39.99</div>
          <div style={{ fontSize: 10, color: COLORS.accent, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Save 33%</div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 12, fontFamily: "'DM Sans', sans-serif" }}>
        Want to create coaches? <span style={{ color: COLORS.purple, fontWeight: 600, cursor: "pointer" }}>See Creator plan →</span>
      </div>
    </div>

    <div style={{ padding: "8px 22px 24px", flexShrink: 0 }}>
      <div style={{
        background: COLORS.accent, color: "#fff", borderRadius: 14, padding: "14px 0",
        fontSize: 15, fontWeight: 700, textAlign: "center", fontFamily: "'DM Sans', sans-serif",
      }}>
        Start 7-Day Free Trial
      </div>
      <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 8, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
        Cancel anytime · Restore purchase
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// BUILDER FLOW SCREENS
// ═══════════════════════════════════════════════════════════════

const BuilderHome = () => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
    <div style={{
      background: `linear-gradient(160deg, ${COLORS.creatorGradient1} 0%, ${COLORS.creatorGradient2} 100%)`,
      padding: "0 0 24px", flexShrink: 0, borderRadius: "0 0 26px 26px",
    }}>
      <StatusBar light />
      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: 21, fontWeight: 800, color: "#fff", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
              Welcome back, Iqbal
            </h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "2px 0 0", fontFamily: "'DM Sans', sans-serif" }}>
              Creator Dashboard
            </p>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "4px 10px",
            fontSize: 10, color: "#fff", fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
          }}>
            ✦ CREATOR
          </div>
        </div>

        {/* Creator Stats */}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>3</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif" }}>Coaches Built</div>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>47</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif" }}>Link Opens</div>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>156</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif" }}>Sessions</div>
          </div>
        </div>
      </div>
    </div>

    <div style={{ flex: 1, overflow: "auto", padding: "16px 16px 8px" }}>
      {/* Create CTA */}
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.purple}15, ${COLORS.purple}05)`,
        borderRadius: 16, padding: "16px", marginBottom: 18,
        border: `1.5px solid ${COLORS.purple}20`, cursor: "pointer",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: COLORS.purple,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, color: "#fff",
          }}>
            +
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>
              Create New Coach
            </div>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, fontFamily: "'DM Sans', sans-serif" }}>
              Build and share with your audience
            </div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.purple} strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>

      {/* My Coaches */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
            My Coaches
          </h3>
          <span style={{ fontSize: 12, color: COLORS.accent, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>See all</span>
        </div>
        
        {[
          { icon: "🧠", name: "The Brain Coach", opens: 32, shared: true },
          { icon: "📝", name: "Content Strategist", opens: 15, shared: true },
          { icon: "💰", name: "Money Mindset", opens: 0, shared: false },
        ].map((c, i) => (
          <div key={i} style={{
            background: COLORS.card, borderRadius: 14, padding: "12px 14px", marginBottom: 8,
            display: "flex", alignItems: "center", gap: 12, border: `1px solid ${COLORS.border}`,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, background: `${COLORS.purple}12`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}>
              {c.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>{c.name}</div>
              <div style={{ fontSize: 11, color: COLORS.textSecondary, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                {c.shared ? (
                  <>
                    <span style={{ color: COLORS.success }}>🔗 Shared</span>
                    <span>· {c.opens} opens</span>
                  </>
                ) : (
                  <span>Draft</span>
                )}
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        ))}
      </div>
    </div>
    <TabBar active="home" isBuilder={true} />
  </div>
);

const BuilderPaywall = () => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#fff" }}>
    <StatusBar />
    <div style={{ flex: 1, overflow: "auto", padding: "0 22px", textAlign: "center" }}>
      <div style={{ fontSize: 13, color: COLORS.textMuted, cursor: "pointer", textAlign: "left", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>✕</div>

      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: `linear-gradient(135deg, ${COLORS.creatorGradient1}, ${COLORS.creatorGradient2})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "8px auto 12px", fontSize: 26, color: "#fff", fontWeight: 800,
        fontFamily: "'DM Sans', sans-serif", boxShadow: `0 4px 16px ${COLORS.purple}40`,
      }}>
        C
      </div>
      <div style={{
        display: "inline-block", background: COLORS.purpleLight, borderRadius: 20,
        padding: "4px 14px", marginBottom: 8,
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.purple, fontFamily: "'DM Sans', sans-serif" }}>✦ CREATOR</span>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: "0 0 4px", fontFamily: "'DM Sans', sans-serif", letterSpacing: -0.5 }}>
        Build & Share Coaches
      </h2>
      <p style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>
        For creators, coaches, and power users.
      </p>

      {/* Features */}
      <div style={{ textAlign: "left", margin: "20px 0 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { icon: "✦", title: "Create unlimited coaches", desc: "Build AI coaches for any purpose", color: COLORS.purple },
          { icon: "🔗", title: "Share via link", desc: "Anyone can use your coaches", color: COLORS.orange },
          { icon: "📊", title: "Analytics", desc: "See opens and session counts", color: "#2B9E5A" },
          { icon: "∞", title: "Unlimited messages", desc: "Everything in Pro included", color: COLORS.accent },
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11, background: `${f.color}12`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
            }}>
              {f.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>{f.title}</div>
              <div style={{ fontSize: 11, color: COLORS.textSecondary, fontFamily: "'DM Sans', sans-serif" }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div style={{ display: "flex", gap: 10, margin: "8px 0" }}>
        <div style={{ flex: 1, border: `2px solid ${COLORS.border}`, borderRadius: 14, padding: "14px 8px", textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted, letterSpacing: 0.8, fontFamily: "'DM Sans', sans-serif" }}>MONTHLY</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: "4px 0 2px", fontFamily: "'DM Sans', sans-serif" }}>$9.99</div>
          <div style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: "'DM Sans', sans-serif" }}>/month</div>
        </div>
        <div style={{
          flex: 1, border: `2px solid ${COLORS.purple}`, borderRadius: 14, padding: "14px 8px",
          textAlign: "center", position: "relative", background: `${COLORS.purple}04`,
        }}>
          <div style={{
            position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)",
            background: COLORS.purple, color: "#fff", fontSize: 8, fontWeight: 800,
            padding: "2px 10px", borderRadius: 10, fontFamily: "'DM Sans', sans-serif",
          }}>
            BEST VALUE
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted, letterSpacing: 0.8, fontFamily: "'DM Sans', sans-serif" }}>YEARLY</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: "4px 0 2px", fontFamily: "'DM Sans', sans-serif" }}>$79.99</div>
          <div style={{ fontSize: 10, color: COLORS.purple, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Save 33%</div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 12, fontFamily: "'DM Sans', sans-serif" }}>
        Just want coaching? <span style={{ color: COLORS.accent, fontWeight: 600, cursor: "pointer" }}>See Pro plan →</span>
      </div>
    </div>

    <div style={{ padding: "8px 22px 24px", flexShrink: 0 }}>
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.creatorGradient1}, ${COLORS.creatorGradient2})`,
        color: "#fff", borderRadius: 14, padding: "14px 0",
        fontSize: 15, fontWeight: 700, textAlign: "center", fontFamily: "'DM Sans', sans-serif",
      }}>
        Start 7-Day Free Trial
      </div>
      <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 8, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
        Cancel anytime · Restore purchase
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// SHARED SCREENS (Both flows)
// ═══════════════════════════════════════════════════════════════

const ChatScreen = () => {
  const c = COACHES[0];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: COLORS.bg }}>
      <div style={{
        padding: "0 16px 10px", display: "flex", alignItems: "center", gap: 12,
        background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", flexShrink: 0,
        paddingTop: 44, borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <StatusBar />
        <span style={{ fontSize: 20, color: COLORS.textMuted, cursor: "pointer", position: "absolute", top: 52, left: 16 }}>‹</span>
        <div style={{
          width: 32, height: 32, borderRadius: 10, marginLeft: 20,
          background: `linear-gradient(135deg, ${c.color}20, ${c.color}08)`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
        }}>
          {c.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>{c.name}</div>
          <div style={{ fontSize: 10, color: COLORS.success, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Active</div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "14px 14px 8px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Coach message */}
        <div style={{ maxWidth: "85%", alignSelf: "flex-start" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{
              width: 24, height: 24, borderRadius: 7,
              background: `${c.color}15`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 12, flexShrink: 0,
            }}>
              🎯
            </div>
            <div style={{
              background: "#fff", borderRadius: "4px 14px 14px 14px", padding: "11px 14px",
              fontSize: 13, color: COLORS.text, lineHeight: 1.55, fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              Hey Iqbal. Of everything on your plate, what's the <strong>one thing</strong> that would make everything else easier?
            </div>
          </div>
        </div>

        {/* User message */}
        <div style={{ maxWidth: "78%", alignSelf: "flex-end" }}>
          <div style={{
            background: COLORS.accent, borderRadius: "14px 4px 14px 14px", padding: "11px 14px",
            fontSize: 13, color: "#fff", lineHeight: 1.55, fontFamily: "'DM Sans', sans-serif",
          }}>
            Creating a consistent content schedule.
          </div>
        </div>

        {/* Coach message 2 */}
        <div style={{ maxWidth: "85%", alignSelf: "flex-start" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{
              width: 24, height: 24, borderRadius: 7,
              background: `${c.color}15`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 12, flexShrink: 0,
            }}>
              🎯
            </div>
            <div style={{
              background: "#fff", borderRadius: "4px 14px 14px 14px", padding: "11px 14px",
              fontSize: 13, color: COLORS.text, lineHeight: 1.55, fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              Good. What are you doing that <em>feels</em> productive but isn't moving that forward?
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "8px 14px 16px", flexShrink: 0, background: "#fff", borderTop: `1px solid ${COLORS.border}` }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: COLORS.bg, borderRadius: 14, padding: "10px 12px",
        }}>
          <span style={{ flex: 1, fontSize: 13, color: COLORS.textMuted, fontFamily: "'DM Sans', sans-serif" }}>Message...</span>
          <div style={{
            width: 32, height: 32, borderRadius: 10, background: COLORS.accent,
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15,
          }}>
            ↑
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateCoach = () => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#fff" }}>
    <StatusBar />
    <div style={{ flex: 1, overflow: "auto", padding: "4px 20px" }}>
      <div style={{ fontSize: 13, color: COLORS.textSecondary, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginBottom: 10 }}>
        ← Back
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: "0 0 20px", fontFamily: "'DM Sans', sans-serif" }}>
        Create a Coach
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, marginBottom: 8, display: "block", fontFamily: "'DM Sans', sans-serif" }}>Icon</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["🧠", "📝", "💡", "🏋️", "🎨", "📊", "🔬", "🌟"].map((e, i) => (
              <div key={i} style={{
                width: 36, height: 36, borderRadius: 10,
                background: i === 0 ? `${COLORS.purple}12` : COLORS.bg,
                border: i === 0 ? `2px solid ${COLORS.purple}` : `1.5px solid ${COLORS.border}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
              }}>
                {e}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, marginBottom: 8, display: "block", fontFamily: "'DM Sans', sans-serif" }}>Name</label>
          <div style={{ background: COLORS.bg, border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 14px", fontSize: 13, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>
            The Brain Coach
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, marginBottom: 8, display: "block", fontFamily: "'DM Sans', sans-serif" }}>Description</label>
          <div style={{ background: COLORS.bg, border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 14px", fontSize: 13, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>
            Neuroscience-based focus & learning
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, marginBottom: 8, display: "block", fontFamily: "'DM Sans', sans-serif" }}>Instructions</label>
          <div style={{
            background: COLORS.bg, border: `1.5px solid ${COLORS.border}`, borderRadius: 12,
            padding: "12px 14px", fontSize: 12, color: COLORS.text, fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1.5, height: 72,
          }}>
            You use evidence-based brain science to help people learn faster and focus deeper...
          </div>
        </div>

        {/* Share toggle */}
        <div style={{
          background: COLORS.purpleLight, borderRadius: 12, padding: "12px 14px",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 18 }}>🔗</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>Share this coach</div>
            <div style={{ fontSize: 10, color: COLORS.textSecondary, fontFamily: "'DM Sans', sans-serif" }}>Anyone with link can use it</div>
          </div>
          <div style={{ width: 40, height: 22, borderRadius: 11, background: COLORS.purple, position: "relative" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, right: 2 }} />
          </div>
        </div>
      </div>
    </div>

    <div style={{ padding: "10px 20px 20px", flexShrink: 0 }}>
      <div style={{
        background: COLORS.purple, color: "#fff", borderRadius: 14, padding: "14px 0",
        fontSize: 15, fontWeight: 700, textAlign: "center", fontFamily: "'DM Sans', sans-serif",
      }}>
        Create Coach
      </div>
    </div>
  </div>
);

const SharedCoachImport = () => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#fff" }}>
    <StatusBar />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, textAlign: "center" }}>
      <div style={{
        width: 68, height: 68, borderRadius: 18,
        background: `linear-gradient(135deg, ${COLORS.purple}20, ${COLORS.purple}08)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 34, marginBottom: 14, border: `2px solid ${COLORS.purple}15`,
      }}>
        🧠
      </div>
      <h2 style={{ fontSize: 19, fontWeight: 800, color: COLORS.text, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
        The Brain Coach
      </h2>
      <p style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>
        Neuroscience-based focus & learning
      </p>

      <div style={{
        background: COLORS.bg, borderRadius: 12, padding: "12px 16px",
        marginTop: 18, width: "100%", textAlign: "left",
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.textMuted, marginBottom: 6, fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.5 }}>
          SHARED BY
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9, background: COLORS.purple,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
          }}>
            S
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>Simon</div>
            <div style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: "'DM Sans', sans-serif" }}>via CoachKit link</div>
          </div>
        </div>
      </div>

      <div style={{
        background: COLORS.bg, borderRadius: 12, padding: "12px 16px",
        marginTop: 8, width: "100%", textAlign: "left",
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.textMuted, marginBottom: 6, fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.5 }}>
          ABOUT
        </div>
        <div style={{ fontSize: 12, color: COLORS.text, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
          Uses evidence-based neuroscience to help you learn faster and focus deeper.
        </div>
      </div>
    </div>

    <div style={{ padding: "10px 22px 26px", flexShrink: 0 }}>
      <div style={{
        background: COLORS.accent, color: "#fff", borderRadius: 14, padding: "14px 0",
        fontSize: 15, fontWeight: 700, textAlign: "center", fontFamily: "'DM Sans', sans-serif",
      }}>
        Add to My Coaches
      </div>
      <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 8, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
        Free to use · No account needed
      </div>
    </div>
  </div>
);

const TierComparison = () => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#fff" }}>
    <StatusBar />
    <div style={{ flex: 1, overflow: "auto", padding: "4px 18px" }}>
      <div style={{ fontSize: 13, color: COLORS.textSecondary, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginBottom: 10 }}>
        ← Back
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: "0 0 4px", fontFamily: "'DM Sans', sans-serif" }}>
        Choose Your Plan
      </h2>
      <p style={{ fontSize: 12, color: COLORS.textSecondary, margin: "0 0 16px", fontFamily: "'DM Sans', sans-serif" }}>
        Start free. Upgrade when you're ready.
      </p>

      {/* Free */}
      <div style={{ border: `1.5px solid ${COLORS.border}`, borderRadius: 14, padding: "14px", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>Free</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>$0</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {["6 built-in coaches", "5 messages/day", "Use shared coaches"].map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: COLORS.success, fontSize: 11 }}>✓</span>
              <span style={{ fontSize: 11, color: COLORS.textSecondary, fontFamily: "'DM Sans', sans-serif" }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pro */}
      <div style={{ border: `2px solid ${COLORS.accent}`, borderRadius: 14, padding: "14px", marginBottom: 10, background: `${COLORS.accent}04` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>Pro</span>
            <span style={{ background: COLORS.accent, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>POPULAR</span>
          </div>
          <div>
            <span style={{ fontSize: 15, fontWeight: 800, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>$4.99</span>
            <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "'DM Sans', sans-serif" }}>/mo</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {["Everything in Free", "Unlimited messages", "Extended context", "Export chats", "Priority responses"].map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: COLORS.accent, fontSize: 11 }}>✓</span>
              <span style={{ fontSize: 11, color: i === 0 ? COLORS.textMuted : COLORS.text, fontFamily: "'DM Sans', sans-serif", fontWeight: i === 0 ? 400 : 500 }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Creator */}
      <div style={{ border: `2px solid ${COLORS.purple}`, borderRadius: 14, padding: "14px", background: `${COLORS.purple}04` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>Creator</span>
            <span style={{ background: COLORS.purple, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>✦</span>
          </div>
          <div>
            <span style={{ fontSize: 15, fontWeight: 800, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>$9.99</span>
            <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "'DM Sans', sans-serif" }}>/mo</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {["Everything in Pro", "Create unlimited coaches", "Share via link", "Analytics dashboard", "Early access features"].map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: COLORS.purple, fontSize: 11 }}>✓</span>
              <span style={{ fontSize: 11, color: i === 0 ? COLORS.textMuted : COLORS.text, fontFamily: "'DM Sans', sans-serif", fontWeight: i === 0 ? 400 : 500 }}>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div style={{ padding: "10px 18px 20px", flexShrink: 0 }}>
      <div style={{ fontSize: 10, color: COLORS.textMuted, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
        All plans include 7-day free trial · Cancel anytime
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════

const SCREENS = [
  { id: "welcome", label: "Welcome", component: OnboardingWelcome, section: "Onboarding" },
  { id: "intent", label: "Intent", component: OnboardingIntent, section: "Onboarding" },
  { id: "context", label: "About You", component: OnboardingContext, section: "Onboarding" },
  { id: "style", label: "Style", component: OnboardingStyle, section: "Onboarding" },
  { id: "seeker-home", label: "Seeker Home", component: SeekerHome, section: "Seeker Flow" },
  { id: "seeker-paywall", label: "Pro Paywall", component: SeekerPaywall, section: "Seeker Flow" },
  { id: "builder-home", label: "Builder Home", component: BuilderHome, section: "Builder Flow" },
  { id: "builder-paywall", label: "Creator Paywall", component: BuilderPaywall, section: "Builder Flow" },
  { id: "chat", label: "Chat", component: ChatScreen, section: "Shared" },
  { id: "create", label: "Create Coach", component: CreateCoach, section: "Shared" },
  { id: "shared-import", label: "Shared Link", component: SharedCoachImport, section: "Shared" },
  { id: "tiers", label: "All Plans", component: TierComparison, section: "Shared" },
];

export default function CoachKitWireframeV3() {
  const [idx, setIdx] = useState(0);
  const Screen = SCREENS[idx].component;
  const sections = [...new Set(SCREENS.map(s => s.section))];

  return (
    <div style={{
      minHeight: "100vh", background: "#09090B",
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "24px 16px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 0; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 14, fontWeight: 800, fontFamily: "'DM Sans', sans-serif",
          }}>
            C
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
            CoachKit
          </h1>
        </div>
        <p style={{ fontSize: 12, color: "#555", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
          Three-Tier Model · Personalized Flows · {SCREENS.length} Screens
        </p>
      </div>

      {/* Screen pills grouped by section */}
      <div style={{ marginBottom: 24, maxWidth: 700 }}>
        {sections.map(section => (
          <div key={section} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#444", letterSpacing: 1, marginBottom: 6, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
              {section}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {SCREENS.filter(s => s.section === section).map((s, i) => {
                const globalIdx = SCREENS.findIndex(sc => sc.id === s.id);
                return (
                  <button key={s.id} onClick={() => setIdx(globalIdx)} style={{
                    background: idx === globalIdx ? (s.section === "Builder Flow" ? COLORS.purple : COLORS.accent) : "#18181B",
                    color: idx === globalIdx ? "#fff" : "#666",
                    border: idx === globalIdx ? "none" : "1px solid #2A2A2D",
                    borderRadius: 16, padding: "6px 12px", fontSize: 11, fontWeight: 600,
                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  }}>
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Phone + arrows */}
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <button onClick={() => setIdx(Math.max(0, idx - 1))} style={{
          width: 38, height: 38, borderRadius: "50%",
          border: idx === 0 ? "1px solid #222" : `1px solid ${COLORS.accent}40`,
          background: idx === 0 ? "transparent" : `${COLORS.accent}15`,
          color: idx === 0 ? "#333" : COLORS.accent,
          fontSize: 15, cursor: idx === 0 ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          ←
        </button>

        <PhoneFrame screenLabel={`${SCREENS[idx].section} → ${SCREENS[idx].label}`}>
          <Screen />
        </PhoneFrame>

        <button onClick={() => setIdx(Math.min(SCREENS.length - 1, idx + 1))} style={{
          width: 38, height: 38, borderRadius: "50%",
          border: idx === SCREENS.length - 1 ? "1px solid #222" : `1px solid ${COLORS.accent}40`,
          background: idx === SCREENS.length - 1 ? "transparent" : `${COLORS.accent}15`,
          color: idx === SCREENS.length - 1 ? "#333" : COLORS.accent,
          fontSize: 15, cursor: idx === SCREENS.length - 1 ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          →
        </button>
      </div>

      {/* Dots */}
      <div style={{ display: "flex", gap: 4, marginTop: 18 }}>
        {SCREENS.map((s, i) => (
          <div key={i} onClick={() => setIdx(i)} style={{
            width: idx === i ? 18 : 6, height: 6, borderRadius: 3,
            background: idx === i ? (s.section === "Builder Flow" ? COLORS.purple : COLORS.accent) : "#2A2A2D",
            transition: "all 0.3s", cursor: "pointer",
          }} />
        ))}
      </div>
    </div>
  );
}
