import { useState } from "react";

export default function TimetablePlanner() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const handleForgot = () => {
    if (forgotEmail) setForgotSent(true);
  };

  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: "'Segoe UI', sans-serif",
      background: "linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5576c 100%)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: "absolute", width: 400, height: 400,
        borderRadius: "50%", background: "rgba(255,255,255,0.08)",
        top: -100, left: -100,
      }} />
      <div style={{
        position: "absolute", width: 300, height: 300,
        borderRadius: "50%", background: "rgba(255,255,255,0.06)",
        bottom: -80, right: -80,
      }} />
      <div style={{
        position: "absolute", width: 200, height: 200,
        borderRadius: "50%", background: "rgba(255,255,255,0.05)",
        top: "40%", right: "10%",
      }} />

      {/* Title */}
      <h1 style={{
        textAlign: "center",
        color: "#fff",
        fontSize: 42,
        fontWeight: 800,
        letterSpacing: "-1px",
        margin: 0,
        padding: "36px 0 0",
        textShadow: "0 2px 20px rgba(0,0,0,0.2)",
      }}>
        🗓 Timetable Planner
      </h1>
      <p style={{
        textAlign: "center", color: "rgba(255,255,255,0.8)",
        fontSize: 15, margin: "8px 0 0",
      }}>
        Organize your week, beautifully.
      </p>

      {/* Card */}
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        height: "calc(100vh - 130px)",
      }}>
        <div style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: 24,
          padding: "44px 40px",
          width: 380,
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
        }}>

          {!showForgot ? (
            <>
              <h2 style={{
                color: "#fff", fontSize: 26, fontWeight: 700,
                margin: "0 0 6px", textAlign: "center",
              }}>
                Welcome back 👋
              </h2>
              <p style={{
                color: "rgba(255,255,255,0.75)", fontSize: 14,
                textAlign: "center", margin: "0 0 32px",
              }}>
                Sign in to your account
              </p>

              {/* Email */}
              <label style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "12px 16px", borderRadius: 12,
                  border: "1.5px solid rgba(255,255,255,0.3)",
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff", fontSize: 14,
                  marginBottom: 18, outline: "none",
                  fontFamily: "inherit",
                }}
              />

              {/* Password */}
              <label style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "12px 16px", borderRadius: 12,
                  border: "1.5px solid rgba(255,255,255,0.3)",
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff", fontSize: 14,
                  marginBottom: 10, outline: "none",
                  fontFamily: "inherit",
                }}
              />

              {/* Forgot password */}
              <div style={{ textAlign: "right", marginBottom: 24 }}>
                <span
                  onClick={() => setShowForgot(true)}
                  style={{
                    color: "rgba(255,255,255,0.85)", fontSize: 13,
                    cursor: "pointer", textDecoration: "underline",
                    textUnderlineOffset: 3,
                  }}
                >
                  Forgot password?
                </span>
              </div>

              {/* Sign In button */}
              <button style={{
                width: "100%", padding: "14px",
                background: "linear-gradient(90deg, #fff 0%, #f0e6ff 100%)",
                color: "#7c3aed", fontWeight: 700, fontSize: 15,
                border: "none", borderRadius: 12, cursor: "pointer",
                fontFamily: "inherit", letterSpacing: "0.02em",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                marginBottom: 16,
              }}>
                Sign In →
              </button>

              <p style={{ textAlign: "center", color: "rgba(255,255,255,0.7)", fontSize: 13, margin: "20px 0 0" }}>
                Don't have an account?{" "}
                <span style={{ color: "#fff", fontWeight: 700, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  Sign up
                </span>
              </p>
            </>
          ) : (
            <>
              {!forgotSent ? (
                <>
                  <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 700, margin: "0 0 8px", textAlign: "center" }}>
                    Reset Password 🔑
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, textAlign: "center", margin: "0 0 28px" }}>
                    Enter your email and we'll send you a reset link.
                  </p>
                  <label style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{
                      width: "100%", boxSizing: "border-box",
                      padding: "12px 16px", borderRadius: 12,
                      border: "1.5px solid rgba(255,255,255,0.3)",
                      background: "rgba(255,255,255,0.2)",
                      color: "#fff", fontSize: 14,
                      marginBottom: 24, outline: "none",
                      fontFamily: "inherit",
                    }}
                  />
                  <button
                    onClick={handleForgot}
                    style={{
                      width: "100%", padding: "14px",
                      background: "linear-gradient(90deg, #fff 0%, #f0e6ff 100%)",
                      color: "#7c3aed", fontWeight: 700, fontSize: 15,
                      border: "none", borderRadius: 12, cursor: "pointer",
                      fontFamily: "inherit", marginBottom: 14,
                    }}
                  >
                    Send Reset Link
                  </button>
                  <p
                    onClick={() => setShowForgot(false)}
                    style={{ textAlign: "center", color: "rgba(255,255,255,0.8)", fontSize: 13, cursor: "pointer", margin: 0 }}
                  >
                    ← Back to Sign In
                  </p>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>📬</div>
                  <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: "0 0 10px" }}>Check your inbox!</h2>
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, margin: "0 0 28px" }}>
                    We've sent a reset link to <strong>{forgotEmail}</strong>
                  </p>
                  <button
                    onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(""); }}
                    style={{
                      padding: "12px 28px",
                      background: "rgba(255,255,255,0.2)",
                      color: "#fff", fontWeight: 600, fontSize: 14,
                      border: "1.5px solid rgba(255,255,255,0.35)",
                      borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    ← Back to Sign In
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}