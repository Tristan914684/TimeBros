import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

export default function Sign_up_page() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const navigate = useNavigate();

    return (
        <div style={styles.root}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }

        .signup-btn {
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
        .signup-btn:hover { background: #1d4ed8; transform: translateY(-1px); }
        .signup-btn:active { transform: translateY(0); }

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

        .login-link {
          color: #2563EB;
          font-weight: 600;
          text-decoration: none;
        }
        .login-link:hover { text-decoration: underline; }
      `}</style>

            <div style={styles.bg} />

            <div style={styles.pageWrapper}>
                <div style={styles.card}>
                    <h2 style={styles.title}>Create an account</h2>
                    <p style={styles.sub}>Sign up to get started with TimeTable</p>

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

                    <div style={styles.fieldGroup}>
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
                            <button onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                {showPassword ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Confirm Password</label>
                        <div style={styles.inputWrap}>
                            <span style={styles.inputIcon}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </span>
                            <input
                                className="input-field"
                                type={showConfirm ? "text" : "password"}
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{ paddingRight: 42 }}
                            />
                            <button onClick={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                                {showConfirm ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button className="signup-btn">Sign up</button>

                    <p style={{ textAlign: "center", fontSize: 13.5, color: "white", marginTop: 22 }}>
                        Already have an account? <span className="login-link" style={{ cursor: "pointer" }} onClick={() => navigate('/')}>Log in</span>
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
    eyeBtn: {
        position: "absolute",
        right: 13,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        display: "flex",
        alignItems: "center",
    },
};