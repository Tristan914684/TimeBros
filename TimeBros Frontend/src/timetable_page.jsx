import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const CalendarIconDark = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <rect x="7" y="14" width="3" height="3" fill="#2563EB" stroke="none" />
    <rect x="11" y="14" width="3" height="3" fill="#2563EB" stroke="none" />
  </svg>
);

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri"];
const HOURS = Array.from({ length: 13 }, (_, i) => 8 + i);

const DAY_COLORS = {
  mon: { bg: "#1e3a5f", label: "#60a5fa" },
  tue: { bg: "#1a3a2e", label: "#34d399" },
  wed: { bg: "#3a2a1a", label: "#fb923c" },
  thu: { bg: "#2e1a3a", label: "#c084fc" },
  fri: { bg: "#3a1a1a", label: "#f87171" },
};

function timeLabel(h) {
  return (h < 10 ? "0" : "") + h + ":00";
}

export default function TimetablePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = location.state?.email || "user@example.com";
  const [events] = useState({});

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }

        .logout-btn {
          background: transparent; color: #94a3b8; border: 1px solid #334155;
          border-radius: 7px; padding: 6px 12px; font-size: 11px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
        }
        .logout-btn:hover { background: #1e293b; color: white; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.4s ease both; }
      `}</style>

      <div style={styles.bg} />

      <div style={styles.pageWrapper}>

        <div style={styles.greeting}>
          Hello <span style={{ color: "black" }}>{userEmail}</span>
        </div>

        <div style={styles.header}>
          <div style={styles.logoWrap}>
            <div style={styles.logoIcon}><CalendarIconDark /></div>
            <div>
              <div>
                <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 17, color: "#1e293b" }}>Time</span>
                <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 17, color: "#2563EB" }}>Table</span>
              </div>
              <div style={{ fontSize: 10, letterSpacing: "0.18em", color: "#94a3b8", fontWeight: 600 }}>PLANNER</div>
            </div>
          </div>
          <button className="logout-btn" onClick={() => navigate("/")}>Log out</button>
        </div>

        <div style={styles.card} className="fade-up">
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Weekly Schedule</h2>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.thTime}>Time</th>
                  {DAYS.map((d, i) => (
                    <th key={d} style={styles.th}>
                      <span style={{ color: DAY_COLORS[DAY_KEYS[i]].label }}>{d}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((h) => (
                  <tr key={h}>
                    <td style={styles.tdTime}>{timeLabel(h)}</td>
                    {DAY_KEYS.map((dk, di) => {
                      const key = `${di}-${h}`;
                      const ev = events[key];
                      const colors = DAY_COLORS[dk];
                      return (
                        <td key={dk} style={styles.td}>
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              minHeight: 53,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: ev ? colors.bg : "transparent",
                              borderTop: ev?.isStart ? `2px solid ${colors.label}` : "none",
                              borderBottom: ev?.isEnd ? `2px solid ${colors.label}` : "none",
                            }}
                          >
                            {ev?.isStart && (
                              <span style={{ fontSize: 13, fontWeight: 700, color: colors.label, padding: "2px 6px", textAlign: "center", lineHeight: 1.3 }}>
                                {ev.name}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
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
    maxWidth: 1320,
    margin: "0 auto",
    padding: "32px 24px 48px",
  },
  greeting: {
    fontFamily: "'Sora', sans-serif",
    fontSize: 28,
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 20,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logoIcon: {
    width: 38,
    height: 38,
    background: "#eff6ff",
    border: "1px solid #dbeafe",
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    background: "black",
    borderRadius: 20,
    boxShadow: "0 4px 24px rgba(37,99,235,0.08), 0 1px 4px rgba(0,0,0,0.04)",
    border: "1px solid #1e293b",
    overflow: "hidden",
  },
  cardHeader: {
    padding: "24px 28px 18px",
    borderBottom: "1px solid #334155",
  },
  cardTitle: {
    fontFamily: "'Sora', sans-serif",
    fontSize: 24,
    fontWeight: 800,
    color: "white",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 816,
    tableLayout: "fixed",
  },
  thTime: {
    padding: "14px 24px",
    fontSize: 13,
    fontWeight: 600,
    color: "white",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    textAlign: "left",
    width: "10%",
    background: "#080d16",
    borderBottom: "1px solid #334155",
  },
  th: {
    padding: "14px 10px",
    fontSize: 14,
    fontWeight: 700,
    textAlign: "center",
    background: "#080d16",
    borderBottom: "1px solid #334155",
    borderLeft: "1px solid #334155",
    width: "18%",
  },
  tdTime: {
    padding: "0 24px",
    fontSize: 13,
    color: "white",
    fontWeight: 500,
    background: "#080d16",
    borderBottom: "1px solid #334155",
    whiteSpace: "nowrap",
    height: 53,
    verticalAlign: "middle",
    width: "10%",
  },
  td: {
    padding: 0,
    borderBottom: "1px solid #334155",
    borderLeft: "1px solid #334155",
    height: 53,
    verticalAlign: "middle",
    width: "18%",
  },
};