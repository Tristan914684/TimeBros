import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch("https://timebros.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate('/timetable', { state: { email: email } });
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

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
                { title: "Organize Classes", sub: "Plan your timetable with ease" },
                { title: "Track Deadlines", sub: "Never miss an assignment or exam" },
                { title: "Stay Productive", sub: "Focus on what matters most" },
              ].map((f) => (
                <div key={f.title} style={styles.featureItem}>
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
                  <span className="forgot-link" style={{ cursor: "pointer" }} onClick={() => navigate('/forgot-password')}>Forgot password?</span>
                </div>
              </div>

              {error && (
                <p style={{ color: "#f87171", fontSize: 13, marginBottom: 12, textAlign: "center" }}>
                  {error}
                </p>
              )}

              <div className="fade-up delay-4">
                <button className="login-btn" onClick={handleLogin}>Log in</button>
              </div>

              <p className="fade-up delay-5" style={{ textAlign: "center", fontSize: 13.5, color: "#c5cad1", marginTop: 22 }}>
                Don't have an account? <span className="signup-link" style={{ cursor: "pointer" }} onClick={() => navigate('/signup')}>Sign up</span>
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