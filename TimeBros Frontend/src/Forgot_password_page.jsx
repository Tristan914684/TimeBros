import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

export default function Forgot_password_page() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }

        .reset-btn {
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
        }
        .reset-btn:hover { background: #1d4ed8; transform: translateY(-1px); }
        .reset-btn:active { transform: translateY(0); }

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

        .back-link {
          color: #2563EB;
          font-weight: 600;
          cursor: pointer;
        }
        .back-link:hover { text-decoration: underline; }
      `}</style>

      <div style={styles.bg} />

      <div style={styles.pageWrapper}>
        <div style={styles.card}>
          <div style={styles.iconBox}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>

          <h2 style={styles.title}>Forgot password?</h2>
          <p style={styles.sub}>Enter your email and we'll send you a reset link</p>

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
              />
            </div>
          </div>

          <button className="reset-btn">Send reset link</button>

          <p style={{ textAlign: "center", fontSize: 13.5, color: "white", marginTop: 22 }}>
            Remember your password? <span className="back-link" onClick={() => navigate('/')}>Log in</span>
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
    margin: "0 auto 18px",
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
    color: "white",
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