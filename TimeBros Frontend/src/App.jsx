import React, { useState } from "react";

const CalendarIconDark = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <rect x="7" y="14" width="3" height="3" fill="#2563EB" stroke="none" />
    <rect x="11" y="14" width="3" height="3" fill="#2563EB" stroke="none" />
  </svg>
);

const CalendarIconWhite = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <rect x="7" y="14" width="3" height="3" fill="white" stroke="none" />
    <rect x="11" y="14" width="3" height="3" fill="white" stroke="none" />
  </svg>
);

const DeskIllustration = () => (
  <svg viewBox="0 0 300 230" width="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shadeG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
    </defs>

    <rect x="0" y="0" width="300" height="230" fill="#d4e6f7" opacity="0.4" rx="6" />

    <rect x="155" y="8" width="130" height="155" rx="6" fill="#9ec4de" opacity="0.6" />
    <rect x="161" y="14" width="118" height="143" rx="4" fill="#c2daf0" />
    <rect x="167" y="20" width="106" height="131" rx="3" fill="#daeeff" opacity="0.85" />
    <rect x="167" y="20" width="106" height="131" rx="3" fill="#e8f4ff" opacity="0.5" />
    <rect x="161" y="14" width="118" height="143" rx="4" fill="none" stroke="#8ab6d4" strokeWidth="5" />
    <line x1="220" y1="14" x2="220" y2="157" stroke="#8ab6d4" strokeWidth="4" />
    <line x1="161" y1="86" x2="279" y2="86" stroke="#8ab6d4" strokeWidth="4" />
    <rect x="171" y="24" width="6" height="56" rx="3" fill="white" opacity="0.4" />
    <rect x="224" y="90" width="5" height="36" rx="2" fill="white" opacity="0.3" />
    <ellipse cx="195" cy="44" rx="20" ry="30" fill="#7ab0cc" opacity="0.3" />
    <ellipse cx="210" cy="36" rx="15" ry="24" fill="#6aa0c0" opacity="0.25" />
    <ellipse cx="255" cy="40" rx="18" ry="28" fill="#7ab0cc" opacity="0.28" />
    <ellipse cx="268" cy="50" rx="14" ry="22" fill="#6aa0c0" opacity="0.22" />

    <rect x="0" y="188" width="300" height="14" rx="3" fill="#a8c8e4" opacity="0.9" />
    <rect x="0" y="188" width="300" height="4" rx="2" fill="#c8e0f4" />
    <rect x="0" y="200" width="300" height="8" rx="0" fill="#88a8c4" opacity="0.25" />

    <ellipse cx="68" cy="192" rx="30" ry="6" fill="#5a6a7e" opacity="0.7" />
    <rect x="56" y="185" width="24" height="9" rx="4" fill="#4a5a6e" />
    <rect x="58" y="185" width="20" height="3" rx="2" fill="#7a8a9e" opacity="0.4" />
    <rect x="62" y="148" width="11" height="39" rx="4" fill="#4a5a6e" />
    <rect x="63" y="149" width="4" height="37" rx="2" fill="#6a7a8e" opacity="0.4" />
    <circle cx="67" cy="148" r="8" fill="#3a4a5e" />
    <circle cx="67" cy="148" r="4" fill="#5a6a7e" />
    <line x1="67" y1="142" x2="44" y2="105" stroke="#3a4a5e" strokeWidth="8" strokeLinecap="round" />
    <line x1="67" y1="142" x2="44" y2="105" stroke="#6a7a8e" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
    <circle cx="44" cy="105" r="7" fill="#3a4a5e" />
    <circle cx="44" cy="105" r="3" fill="#5a6a7e" />
    <line x1="44" y1="99" x2="68" y2="58" stroke="#3a4a5e" strokeWidth="7" strokeLinecap="round" />
    <line x1="44" y1="99" x2="68" y2="58" stroke="#6a7a8e" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
    <g transform="translate(68,52) rotate(-28)">
      <path d="M-28,-7 L28,-7 L22,24 L-22,24 Z" fill="url(#shadeG)" />
      <path d="M-22,-4 L22,-4 L17,21 L-17,21 Z" fill="#263040" opacity="0.5" />
      <rect x="-30" y="-11" width="60" height="6" rx="3" fill="#1a2535" />
      <rect x="-22" y="22" width="44" height="4" rx="2" fill="#1a2535" />
      <ellipse cx="0" cy="12" rx="11" ry="7" fill="#fffce0" opacity="0.3" />
    </g>
    <path d="M52 68 L28 190 L118 190 L92 68 Z" fill="#fffce0" opacity="0.07" />

    <rect x="88" y="172" width="108" height="20" rx="3" fill="#1a1a22" />
    <rect x="88" y="172" width="8" height="20" rx="2" fill="#0e0e14" />
    <rect x="189" y="174" width="5" height="16" rx="1" fill="#3a3a44" opacity="0.7" />
    <rect x="98" y="174" width="85" height="3" rx="1" fill="#404048" opacity="0.5" />
    <text x="144" y="186" textAnchor="middle" fontFamily="sans-serif" fontSize="7.5" fontWeight="700" fill="#787880" letterSpacing="1.2">CONSISTENCY</text>

    <rect x="93" y="153" width="100" height="21" rx="3" fill="#1e3f90" />
    <rect x="93" y="153" width="8" height="21" rx="2" fill="#142d6e" />
    <rect x="186" y="155" width="5" height="17" rx="1" fill="#142d6e" opacity="0.6" />
    <rect x="103" y="155" width="78" height="3" rx="1" fill="#4a78d8" opacity="0.4" />
    <text x="143" y="168" textAnchor="middle" fontFamily="sans-serif" fontSize="7.5" fontWeight="700" fill="#90b0f0" letterSpacing="1.2">DISCIPLINE</text>

    <rect x="98" y="135" width="92" height="20" rx="3" fill="#2e68cc" />
    <rect x="98" y="135" width="8" height="20" rx="2" fill="#1e50aa" />
    <rect x="183" y="137" width="5" height="16" rx="1" fill="#1e50aa" opacity="0.6" />
    <rect x="108" y="137" width="68" height="3" rx="1" fill="#70a8ff" opacity="0.4" />
    <text x="144" y="150" textAnchor="middle" fontFamily="sans-serif" fontSize="8.5" fontWeight="700" fill="white" letterSpacing="1.5">FOCUS</text>

    <ellipse cx="210" cy="198" rx="95" ry="8" fill="#90b0cc" opacity="0.3" />
    <rect x="118" y="186" width="185" height="10" rx="2" fill="#c0d8f0" opacity="0.8" />
    <rect x="120" y="173" width="90" height="16" rx="2" fill="#ddeeff" />
    <rect x="212" y="173" width="89" height="16" rx="2" fill="#d8eafc" />
    <rect x="208" y="172" width="6" height="18" rx="1" fill="#a8c0d8" />
    <line x1="126" y1="178" x2="204" y2="178" stroke="#aac4de" strokeWidth="0.7" />
    <line x1="126" y1="182" x2="204" y2="182" stroke="#aac4de" strokeWidth="0.7" />
    <line x1="126" y1="186" x2="204" y2="186" stroke="#aac4de" strokeWidth="0.7" />
    <line x1="216" y1="178" x2="296" y2="178" stroke="#aac4de" strokeWidth="0.7" />
    <line x1="216" y1="182" x2="296" y2="182" stroke="#aac4de" strokeWidth="0.7" />
    <line x1="216" y1="186" x2="296" y2="186" stroke="#aac4de" strokeWidth="0.7" />
    <line x1="288" y1="172" x2="298" y2="196" stroke="#3a4a5e" strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="289" cy="171" rx="3" ry="2" fill="#5a6a7e" />
    <path d="M296 194 L300 200 L292 198 Z" fill="#2a3a4e" />

    <path d="M230 190 L238 168 L262 168 L270 190 Z" fill="#8ab0cc" opacity="0.75" />
    <rect x="234" y="164" width="32" height="7" rx="3" fill="#70a0be" />
    <rect x="237" y="165" width="14" height="3" rx="1" fill="#b0d0e8" opacity="0.5" />
    <path d="M258 168 L270 190 L264 190 L252 168 Z" fill="#5888a8" opacity="0.35" />
    <ellipse cx="248" cy="166" rx="15" ry="4" fill="#5a7a5a" opacity="0.6" />
    <path d="M248 164 Q246 148 248 130" stroke="#5a7a5a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M248 152 Q228 140 222 118 Q240 124 248 148" fill="#4a80c0" opacity="0.6" />
    <path d="M248 145 Q270 132 276 108 Q256 116 248 141" fill="#3070b0" opacity="0.55" />
    <path d="M248 138 Q226 125 222 100 Q242 108 248 134" fill="#5890d0" opacity="0.5" />
    <path d="M248 130 Q272 116 276 90 Q254 100 248 126" fill="#4080c0" opacity="0.5" />
    <path d="M248 122 Q240 98 243 76 Q256 90 252 118" fill="#5088c8" opacity="0.55" />
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }

        .login-btn {
          background: #2563EB;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 15px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.2s, transform 0.1s;
          letter-spacing: 0.01em;
        }
        .login-btn:hover { background: #1d4ed8; transform: translateY(-1px); }
        .login-btn:active { transform: translateY(0); }

        .input-field {
          width: 100%;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 13px 14px 13px 42px;
          color: #1e293b;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field::placeholder { color: #94a3b8; }
        .input-field:focus { border-color: #2563EB; background: white; }

        .forgot-link {
          color: #2563EB;
          font-size: 13px;
          text-decoration: none;
          font-weight: 500;
        }
        .forgot-link:hover { text-decoration: underline; }

        .signup-link {
          color: #2563EB;
          font-weight: 600;
          text-decoration: none;
        }
        .signup-link:hover { text-decoration: underline; }

        .eye-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 0;
          display: flex;
          align-items: center;
        }
        .eye-btn:hover { color: #64748b; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.55s ease both; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.5s; }

        @media (max-width: 860px) {
          .split-left { display: none !important; }
          .page-wrapper { padding: 20px; }
        }
      `}</style>

      <div style={styles.bg} />

      <div className="page-wrapper" style={styles.pageWrapper}>
        <div style={styles.outerCard}>

          <div className="split-left" style={styles.leftPanel}>
            <div style={styles.logo}>
              <div style={styles.logoIcon}>
                <CalendarIconWhite />
              </div>
              <div>
                <div>
                  <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 17, color: "#1e293b" }}>Time</span>
                  <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 17, color: "#2563EB" }}>Table</span>
                </div>
                <div style={{ fontSize: 10, letterSpacing: "0.18em", color: "#94a3b8", fontWeight: 600 }}>PLANNER</div>
              </div>
            </div>

            <div style={{ marginTop: 28 }}>
              <h1 style={styles.heroText}>
                Plan Better.<br />
                Study Smarter.<br />
                <span style={{ color: "#2563EB" }}>Achieve More.</span>
              </h1>
              <p style={styles.heroSub}>
                Organize your classes, track<br />deadlines, and stay on top of<br />your schedule.
              </p>
            </div>

            <div style={styles.illustrationBox}>
              <img
                src="/desk.png"
                alt="Study desk illustration"
                style={{ width: "100%", borderRadius: 8 }}
              />
            </div>

            <div style={styles.quote}>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.65, fontStyle: "italic" }}>
                A well-planned day leads<br />to a well-achieved future.
              </p>
            </div>

            <div style={styles.features}>
              {[
                { icon: "📅", title: "Organize Classes", sub: "Plan your timetable with ease" },
                { icon: "📋", title: "Track Deadlines", sub: "Never miss an assignment or exam" },
                { icon: "📈", title: "Stay Productive", sub: "Focus on what matters most" },
              ].map((f) => (
                <div key={f.title} style={styles.featureItem}>
                  <div style={styles.featureIcon}>{f.icon}</div>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: "#1e293b" }}>{f.title}</div>
                    <div style={{ fontSize: 10.5, color: "#64748b", marginTop: 1 }}>{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.rightPanel}>
            <div style={styles.loginCard}>
              <div className="fade-up" style={styles.cardIcon}>
                <CalendarIconDark />
              </div>

              <h2 className="fade-up delay-1" style={styles.welcomeTitle}>Welcome back</h2>
              <p className="fade-up delay-1" style={styles.welcomeSub}>Log in to continue to your timetable</p>

              <div className="fade-up delay-2" style={styles.fieldGroup}>
                <label style={styles.label}>Email</label>
                <div style={styles.inputWrap}>
                  <span style={styles.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M2 7l10 7 10-7" />
                    </svg>
                  </span>
                  <input
                    className="input-field"
                    type="email"
                    placeholder="youremail@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="fade-up delay-3" style={styles.fieldGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.inputWrap}>
                  <span style={styles.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    className="input-field"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingRight: 42 }}
                  />
                  <button className="eye-btn" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <div style={{ textAlign: "right", marginTop: 8 }}>
                  <a href="#" className="forgot-link">Forgot password?</a>
                </div>
              </div>

              <div className="fade-up delay-4">
                <button className="login-btn">Log in</button>
              </div>

              <p className="fade-up delay-5" style={{ textAlign: "center", fontSize: 13.5, color: "#c5cad1", marginTop: 22 }}>
                Don't have an account? <a href="#" className="signup-link">Sign up</a>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    fontFamily: "'DM Sans', sans-serif",
  },
  bg: {
    position: "fixed",
    inset: 0,
    background: "linear-gradient(135deg, #e8f0fe 0%, #f0f4ff 50%, #e2eaf8 100%)",
    zIndex: 0,
  },
  pageWrapper: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: 1020,
    padding: "40px 24px",
  },
  outerCard: {
    background: "white",
    borderRadius: 28,
    boxShadow: "0 24px 80px rgba(37, 99, 235, 0.10), 0 4px 20px rgba(0,0,0,0.06)",
    display: "flex",
    overflow: "hidden",
    minHeight: 660,
  },
  leftPanel: {
    width: 350,
    flexShrink: 0,
    background: "linear-gradient(160deg, #dbeafe 0%, #eff6ff 55%, #e0eaff 100%)",
    padding: "32px 28px 24px",
    display: "flex",
    flexDirection: "column",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logoIcon: {
    width: 38,
    height: 38,
    background: "#2563EB",
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: {
    fontFamily: "'Sora', sans-serif",
    fontSize: 28,
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1.25,
    marginBottom: 12,
  },
  heroSub: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 1.7,
  },
  illustrationBox: {
    margin: "16px -4px 8px",
  },
  quote: {
    marginBottom: 16,
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
    marginTop: "auto",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    background: "rgba(255,255,255,0.6)",
    borderRadius: 9,
    padding: "8px 10px",
    backdropFilter: "blur(4px)",
  },
  featureIcon: {
    width: 30,
    height: 30,
    background: "#dbeafe",
    borderRadius: 7,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    flexShrink: 0,
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 32px",
    background: "#f8faff",
  },
  loginCard: {
    background: "black",
    borderRadius: 20,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 400,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 24px rgba(37,99,235,0.08), 0 1px 4px rgba(0,0,0,0.04)",
    border: "1px solid #e8f0fe",
  },
  cardIcon: {
    width: 52,
    height: 52,
    background: "#eff6ff",
    borderRadius: 14,
    border: "1px solid #dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 18px",
  },
  welcomeTitle: {
    fontFamily: "'Sora', sans-serif",
    fontSize: 24,
    fontWeight: 800,
    color: "white",
    textAlign: "center",
    marginBottom: 6,
  },
  welcomeSub: {
    fontSize: 13.5,
    color: "#c5cad1",
    textAlign: "center",
    marginBottom: 28,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#c5cad1",
    marginBottom: 7,
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 13,
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
    zIndex: 1,
  },
  eyeBtn: {
    position: "absolute",
    right: 13,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#94a3b8",
    padding: 0,
    display: "flex",
    alignItems: "center",
  },
};