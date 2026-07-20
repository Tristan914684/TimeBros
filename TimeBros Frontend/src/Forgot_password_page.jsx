import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Forgot_password_page() {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email) return setError("Pleases enter your email.");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("https://timebros.onrender.com/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Something went wrong.");
      setStep(2);
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return setError("Enter the 6-digit code.");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("https://timebros.onrender.com/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Invalid or expired code.");
      setStep(3);
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8 || newPassword.length > 15)
      return setError("Password must be between 8 and 15 characters.");
    if (!/[A-Z]/.test(newPassword))
      return setError("Password must have at least one capital letter.");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword))
      return setError("Password must have at least one special character.");
    if (newPassword !== confirmPassword)
      return setError("Passwords do not match.");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("https://timebros.onrender.com/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Reset failed.");
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }

        .action-btn {
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
          transition: background 0.2s, transform 0.1s, opacity 0.2s;
        }
        .action-btn:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); }
        .action-btn:active:not(:disabled) { transform: translateY(0); }
        .action-btn:disabled { opacity: 0.6; cursor: not-allowed; }

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
        .input-field.no-icon { padding-left: 14px; }
        .input-field::placeholder { color: #94a3b8; }
        .input-field:focus { border-color: #2563EB; background: white; }

        .otp-input {
          width: 100%;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 13px;
          color: #1e293b;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 12px;
          text-align: center;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s;
        }
        .otp-input::placeholder { letter-spacing: 4px; font-size: 14px; font-weight: 400; }
        .otp-input:focus { border-color: #2563EB; background: white; }

        .back-link { color: #2563EB; font-weight: 600; cursor: pointer; }
        .back-link:hover { text-decoration: underline; }

        .error-box {
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 8px;
          padding: 10px 14px;
          color: #fca5a5;
          font-size: 13px;
          text-align: center;
          margin-bottom: 14px;
        }

        .success-box {
          background: rgba(34,197,94,0.12);
          border: 1px solid rgba(34,197,94,0.3);
          border-radius: 8px;
          padding: 10px 14px;
          color: #86efac;
          font-size: 13px;
          text-align: center;
          margin-bottom: 14px;
        }

        .step-dots { display: flex; gap: 6px; justify-content: center; margin-bottom: 20px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: #334155; transition: background 0.3s; }
        .dot.active { background: #2563EB; }
      `}</style>

      <div style={styles.bg} />

      <div style={styles.pageWrapper}>
        <div style={styles.card}>
          <div style={styles.iconBox}>
            {step === 1 && (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            )}
            {step === 2 && (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 7l10 7 10-7" />
              </svg>
            )}
            {step === 3 && (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            )}
          </div>

          <div className="step-dots">
            <div className={`dot ${step >= 1 ? "active" : ""}`} />
            <div className={`dot ${step >= 2 ? "active" : ""}`} />
            <div className={`dot ${step >= 3 ? "active" : ""}`} />
          </div>

          <h2 style={styles.title}>
            {step === 1 && "Forgot password?"}
            {step === 2 && "Check your email"}
            {step === 3 && "New password"}
          </h2>
          <p style={styles.sub}>
            {step === 1 && "Enter your email and we'll send you a 6-digit code"}
            {step === 2 && `We sent a code to ${email}. It expires in 10 minutes.`}
            {step === 3 && "Almost done — set your new password"}
          </p>

          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-box">Password reset! Redirecting…</div>}

          {step === 1 && (
            <>
              <div style={styles.fieldGroup}>
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
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  />
                </div>
              </div>
              <button className="action-btn" onClick={handleSendOtp} disabled={loading}>
                {loading ? "Sending…" : "Send code"}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>6-digit code</label>
                <input
                  className="otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="······"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                />
              </div>
              <button className="action-btn" onClick={handleVerifyOtp} disabled={loading}>
                {loading ? "Verifying…" : "Verify code"}
              </button>
              <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 14 }}>
                Didn't get it?{" "}
                <span className="back-link" onClick={() => { setStep(1); setError(""); setOtp(""); }}>
                  Resend
                </span>
              </p>
            </>
          )}

          {step === 3 && (
            <>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>New password</label>
                <input
                  className="input-field no-icon"
                  type="password"
                  placeholder="8 - 15 characters only"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div style={{ ...styles.fieldGroup, marginBottom: 20 }}>
                <label style={styles.label}>Confirm password</label>
                <input
                  className="input-field no-icon"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                />
              </div>
              <button className="action-btn" onClick={handleResetPassword} disabled={loading || success}>
                {loading ? "Resetting…" : "Reset password"}
              </button>
            </>
          )}

          <p style={{ textAlign: "center", fontSize: 13.5, color: "white", marginTop: 22 }}>
            Remember your password?{" "}
            <span className="back-link" onClick={() => navigate("/")}>Log in</span>
          </p>
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
    maxWidth: 440,
    padding: "40px 24px",
  },
  card: {
    background: "black",
    borderRadius: 20,
    padding: "40px 36px",
    boxShadow: "0 4px 24px rgba(37,99,235,0.08), 0 1px 4px rgba(0,0,0,0.04)",
    border: "1px solid #e8f0fe",
  },
  iconBox: {
    width: 52,
    height: 52,
    background: "#eff6ff",
    borderRadius: 14,
    border: "1px solid #dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 14px",
  },
  title: {
    fontFamily: "'Sora', sans-serif",
    fontSize: 24,
    fontWeight: 800,
    color: "white",
    textAlign: "center",
    marginBottom: 6,
  },
  sub: {
    fontSize: 13.5,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 1.5,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "white",
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
};