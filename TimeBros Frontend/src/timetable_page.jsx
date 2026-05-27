import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const API = "http://localhost:3001";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const HOURS = Array.from({ length: 13 }, (_, i) => 8 + i);

const MOD_COLORS = [
  { bg: "#1e3a5f", border: "#3b82f6", text: "#93c5fd" },
  { bg: "#1a3a2e", border: "#10b981", text: "#6ee7b7" },
  { bg: "#3a1f1a", border: "#f97316", text: "#fdba74" },
  { bg: "#2e1a3a", border: "#a855f7", text: "#d8b4fe" },
  { bg: "#3a1a1a", border: "#ef4444", text: "#fca5a5" },
  { bg: "#1a2e3a", border: "#06b6d4", text: "#67e8f9" },
  { bg: "#2e3a1a", border: "#84cc16", text: "#bef264" },
  { bg: "#3a2e1a", border: "#eab308", text: "#fde047" },
];

function timeToHour(t) {
  if (!t) return 0;
  return parseInt(String(t).slice(0, 2), 10);
}

function hourLabel(h) {
  return (h < 10 ? "0" : "") + h + ":00";
}

// Group lessons by lesson_type, then by class_no
function groupLessons(lessons) {
  const groups = {};
  for (const lesson of lessons) {
    if (!groups[lesson.lesson_type]) groups[lesson.lesson_type] = {};
    const key = lesson.class_no;
    if (!groups[lesson.lesson_type][key]) groups[lesson.lesson_type][key] = [];
    groups[lesson.lesson_type][key].push(lesson);
  }
  return groups;
}

export default function TimetablePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = location.state?.email || "user@example.com";

  const [allModules, setAllModules] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMods, setSelectedMods] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // selections[modCode][lessonType] = classNo
  const [selections, setSelections] = useState({});

  const [lunchDur, setLunchDur] = useState("1");
  const [lunchFrom, setLunchFrom] = useState("11");
  const [lunchTo, setLunchTo] = useState("14");
  const [noGaps, setNoGaps] = useState(true);

  const [schedule, setSchedule] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [loadingMod, setLoadingMod] = useState(null);

  useEffect(() => {
    fetch(`${API}/modules`)
      .then((r) => r.json())
      .then((data) => setAllModules(Array.isArray(data) ? data : []))
      .catch(() => setAllModules([]));
  }, []);

  useEffect(() => {
    function handler(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = allModules
    .filter(
      (m) =>
        !selectedMods.find((s) => s.code === m.code) &&
        (m.code.toLowerCase().includes(search.toLowerCase()) ||
          m.title.toLowerCase().includes(search.toLowerCase()))
    )
    .slice(0, 8);

  function selectModule(mod) {
    if (selectedMods.find((s) => s.code === mod.code)) return;
    setSearch("");
    setShowDropdown(false);
    setLoadingMod(mod.code);

    fetch(`${API}/modules/${mod.code}/lessons`)
      .then((r) => r.json())
      .then((lessons) => {
        const color = MOD_COLORS[selectedMods.length % MOD_COLORS.length];
        const grouped = groupLessons(lessons);

        // Default: pick the first class_no for each lesson type
        const defaultSelections = {};
        for (const [type, classNos] of Object.entries(grouped)) {
          defaultSelections[type] = Object.keys(classNos)[0];
        }

        setSelections((prev) => ({ ...prev, [mod.code]: defaultSelections }));
        setSelectedMods((prev) => [
          ...prev,
          { ...mod, lessons, grouped, color },
        ]);
        setLoadingMod(null);
      })
      .catch(() => {
        const color = MOD_COLORS[selectedMods.length % MOD_COLORS.length];
        setSelectedMods((prev) => [
          ...prev,
          { ...mod, lessons: [], grouped: {}, color },
        ]);
        setLoadingMod(null);
      });
  }

  function removeMod(code) {
    setSelectedMods((prev) => prev.filter((m) => m.code !== code));
    setSelections((prev) => {
      const next = { ...prev };
      delete next[code];
      return next;
    });
    setSchedule(null);
    setConflicts([]);
  }

  function handleSelectionChange(modCode, lessonType, classNo) {
    setSelections((prev) => ({
      ...prev,
      [modCode]: { ...prev[modCode], [lessonType]: classNo },
    }));
    setSchedule(null);
    setConflicts([]);
  }

  // Get the actual lessons to schedule based on current selections
  function getSelectedLessons(mod) {
    const sel = selections[mod.code] || {};
    const result = [];
    for (const [type, classNos] of Object.entries(mod.grouped || {})) {
      const chosenClass = sel[type] || Object.keys(classNos)[0];
      const slots = classNos[chosenClass] || [];
      result.push(...slots);
    }
    return result;
  }

  function generate() {
    setGenerating(true);
    setConflicts([]);
    setSchedule(null);

    setTimeout(() => {
      const errs = [];
      const lunchDurN = parseInt(lunchDur, 10);
      const lunchFromN = parseInt(lunchFrom, 10);
      const lunchToN = parseInt(lunchTo, 10);

      if (selectedMods.length === 0) {
        setConflicts(["Please select at least one module."]);
        setGenerating(false);
        return;
      }

      if (lunchToN - lunchFromN < lunchDurN) {
        errs.push("Lunch window is too small for a " + lunchDur + "h lunch. Adjust the lunch times.");
      }

      const grid = {};
      DAYS.forEach((d) => { grid[d] = {}; });

      selectedMods.forEach((mod) => {
        const lessons = getSelectedLessons(mod);
        lessons.forEach((lesson) => {
          const day = lesson.day;
          if (!DAYS.includes(day)) return;
          const startH = timeToHour(lesson.start_time);
          const endH = timeToHour(lesson.end_time);
          for (let h = startH; h < endH; h++) {
            if (grid[day][h]) {
              errs.push(
                "Conflict on " + day + " " + hourLabel(h) + ": " +
                mod.code + " clashes with " + grid[day][h].modCode
              );
            } else {
              grid[day][h] = {
                modCode: mod.code,
                lessonType: lesson.lesson_type,
                classNo: lesson.class_no,
                startTime: lesson.start_time,
                endTime: lesson.end_time,
                isStart: h === startH,
                isEnd: h === endH - 1,
                color: mod.color,
              };
            }
          }
        });
      });

      const lunchGrid = {};
      DAYS.forEach((d) => {
        const hasClasses = Object.keys(grid[d]).length > 0;
        if (!hasClasses) return;
        let placed = false;
        for (let h = lunchFromN; h <= lunchToN - lunchDurN; h++) {
          let ok = true;
          for (let i = 0; i < lunchDurN; i++) {
            if (grid[d][h + i]) { ok = false; break; }
          }
          if (ok) {
            for (let j = 0; j < lunchDurN; j++) {
              lunchGrid[d + "-" + (h + j)] = true;
            }
            placed = true;
            break;
          }
        }
        if (!placed) {
          errs.push("No " + lunchDurN + "h lunch slot on " + d + " within " + lunchFrom + ":00–" + lunchTo + ":00");
        }
      });

      if (noGaps) {
        DAYS.forEach((d) => {
          const classHours = HOURS.filter((h) => grid[d][h]).sort((a, b) => a - b);
          for (let i = 0; i < classHours.length - 1; i++) {
            const gap = classHours[i + 1] - classHours[i];
            if (gap > 1) {
              let allLunch = true;
              for (let k = 1; k < gap; k++) {
                if (!lunchGrid[d + "-" + (classHours[i] + k)]) { allLunch = false; break; }
              }
              if (!allLunch) {
                errs.push("Gap on " + d + " between " + hourLabel(classHours[i]) + " and " + hourLabel(classHours[i + 1]));
              }
            }
          }
        });
      }

      setConflicts(errs);
      setSchedule({ grid, lunchGrid });
      setGenerating(false);
    }, 300);
  }

  function renderCell(day, hour) {
    const lunchKey = day + "-" + hour;
    if (schedule.lunchGrid[lunchKey]) {
      return <div style={styles.lunchCell}>🍱 Lunch</div>;
    }
    const slot = schedule.grid[day][hour];
    if (!slot) return <div style={styles.emptyCell} />;

    if (!slot.isStart) {
      return (
        <div style={{
          width: "100%", height: 46,
          background: slot.color.bg,
          borderLeft: "2px solid " + slot.color.border,
          borderRight: "2px solid " + slot.color.border,
          borderBottom: slot.isEnd ? "2px solid " + slot.color.border : "none",
          borderTop: "none",
        }} />
      );
    }
    return (
      <div style={{
        width: "100%", height: 46, borderRadius: 6,
        background: slot.color.bg,
        border: "2px solid " + slot.color.border,
        borderBottom: slot.isEnd ? "2px solid " + slot.color.border : "none",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "2px 4px",
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: slot.color.text, lineHeight: 1.2, textAlign: "center" }}>
          {slot.modCode}
        </span>
        <span style={{ fontSize: 10, color: slot.color.border, lineHeight: 1.2, textAlign: "center", marginTop: 1 }}>
          {slot.lessonType} [{slot.classNo}]
        </span>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .tb-search { width: 100%; background: #0f1929; border: 1px solid #1e3a5f; border-radius: 10px; padding: 10px 14px; font-size: 13px; color: white; font-family: 'DM Sans', sans-serif; outline: none; }
        .tb-search:focus { border-color: #2563EB; }
        .tb-search::placeholder { color: #475569; }
        .tb-dropdown { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: #0f1929; border: 1px solid #1e3a5f; border-radius: 10px; z-index: 200; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.5); }
        .tb-ditem { padding: 10px 14px; cursor: pointer; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #1e293b; }
        .tb-ditem:last-child { border-bottom: none; }
        .tb-ditem:hover { background: #1e3a5f; }
        .tb-select { width: 100%; background: #0f1929; border: 1px solid #1e3a5f; border-radius: 8px; padding: 8px 10px; font-size: 12px; color: white; font-family: 'DM Sans', sans-serif; outline: none; cursor: pointer; }
        .tb-genbtn { width: 100%; padding: 12px; border-radius: 10px; background: #2563EB; border: none; color: white; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; letter-spacing: 0.03em; }
        .tb-genbtn:hover { background: #1d4ed8; }
        .tb-genbtn:disabled { opacity: 0.45; cursor: not-allowed; }
        .tb-logout { background: transparent; color: #64748b; border: 1px solid #1e293b; border-radius: 7px; padding: 6px 14px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .tb-logout:hover { background: #1e293b; color: white; }
        .tb-toggle { width: 36px; height: 20px; border-radius: 10px; background: #1e293b; border: 1px solid #334155; cursor: pointer; position: relative; flex-shrink: 0; }
        .tb-toggle.on { background: #2563EB; border-color: #2563EB; }
        .tb-toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: white; transition: left 0.2s; }
        .tb-toggle.on::after { left: 18px; }
        .slot-select { background: #0f1929; border: 1px solid #1e3a5f; border-radius: 6px; padding: 4px 6px; font-size: 11px; color: white; font-family: 'DM Sans', sans-serif; outline: none; cursor: pointer; width: 100%; margin-top: 4px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.35s ease both; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0f1a; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 4px; }
      `}</style>

      <div style={styles.bg} />

      <div style={styles.page}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={styles.logoIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <div>
                <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: "#e2e8f0" }}>Time</span>
                <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: "#2563EB" }}>Bros</span>
              </div>
              <div style={{ fontSize: 10, letterSpacing: "0.18em", color: "#475569", fontWeight: 600 }}>PLANNER</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 12, color: "white" }}>{userEmail}</span>
            <button className="tb-logout" onClick={() => navigate("/")}>Log out</button>
          </div>
        </div>

        {/* Panels */}
        <div style={styles.panels}>
          {/* LEFT */}
          <div style={styles.leftPanel} className="fade-up">
            <div style={styles.panelTitle}>Modules</div>

            <div ref={searchRef} style={{ position: "relative", marginBottom: 16 }}>
              <input
                className="tb-search"
                placeholder="Search by code or name..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
              />
              {showDropdown && search.length > 0 && (
                <div className="tb-dropdown">
                  {filtered.length === 0 ? (
                    <div style={{ padding: "12px 14px", fontSize: 12, color: "#475569" }}>No modules found</div>
                  ) : (
                    filtered.map((m) => (
                      <div key={m.code} className="tb-ditem" onClick={() => selectModule(m)}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#60a5fa", minWidth: 64 }}>{m.code}</span>
                        <span style={{ fontSize: 12, color: "#94a3b8", flex: 1 }}>{m.title}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div style={styles.sectionLabel}>Selected ({selectedMods.length})</div>

            {selectedMods.length === 0 ? (
              <div style={{ fontSize: 12, color: "#334155", padding: "8px 0" }}>Search and add modules above</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {selectedMods.map((m) => (
                  <div key={m.code} style={{
                    padding: "10px 12px", borderRadius: 9,
                    background: m.color.bg, border: "1px solid " + m.color.border,
                  }}>
                    {/* Module header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: m.color.text }}>{m.code}</div>
                        <div style={{ fontSize: 11, color: m.color.border, marginTop: 1 }}>{m.title}</div>
                      </div>
                      <button onClick={() => removeMod(m.code)} style={{
                        background: "none", border: "none", color: "#475569",
                        cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "2px 4px",
                      }}>×</button>
                    </div>

                    {/* Slot selectors per lesson type */}
                    {Object.entries(m.grouped || {}).map(([type, classNos]) => (
                      <div key={type} style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: 11, color: m.color.text, fontWeight: 600, marginBottom: 2 }}>{type}</div>
                        <select
                          className="slot-select"
                          value={selections[m.code]?.[type] || Object.keys(classNos)[0]}
                          onChange={(e) => handleSelectionChange(m.code, type, e.target.value)}
                        >
                          {Object.entries(classNos).map(([classNo, slots]) => {
                            const label = slots.map(s =>
                              `[${classNo}] ${s.day} ${s.start_time}–${s.end_time}`
                            ).join(", ");
                            return <option key={classNo} value={classNo}>{label}</option>;
                          })}
                        </select>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {loadingMod && (
              <div style={{ fontSize: 12, color: "#2563EB", marginTop: 8 }}>Loading {loadingMod}...</div>
            )}

            <div style={{ marginTop: "auto", paddingTop: 20 }}>
              <button
                className="tb-genbtn"
                onClick={generate}
                disabled={generating || selectedMods.length === 0}
              >
                {generating ? "Generating..." : "⚡ Generate Timetable"}
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div style={styles.rightPanel} className="fade-up">
            <div style={styles.panelTitle}>Filters</div>

            <div style={styles.fg}>
              <div style={styles.fl}>Lunch duration</div>
              <select className="tb-select" value={lunchDur} onChange={(e) => setLunchDur(e.target.value)}>
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
              </select>
            </div>

            <div style={styles.fg}>
              <div style={styles.fl}>Lunch not before</div>
              <select className="tb-select" value={lunchFrom} onChange={(e) => setLunchFrom(e.target.value)}>
                <option value="11">11:00</option>
                <option value="12">12:00</option>
                <option value="13">13:00</option>
              </select>
            </div>

            <div style={styles.fg}>
              <div style={styles.fl}>Lunch by</div>
              <select className="tb-select" value={lunchTo} onChange={(e) => setLunchTo(e.target.value)}>
                <option value="13">13:00</option>
                <option value="14">14:00</option>
                <option value="15">15:00</option>
              </select>
            </div>

            <div style={styles.fg}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={styles.fl}>No gaps between classes</div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>Avoid idle hours in schedule</div>
                </div>
                <div className={"tb-toggle" + (noGaps ? " on" : "")} onClick={() => setNoGaps((v) => !v)} />
              </div>
            </div>

            {conflicts.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#ef4444", marginBottom: 8 }}>⚠ Issues found</div>
                {conflicts.map((c, i) => (
                  <div key={i} style={{
                    fontSize: 12, color: "#fca5a5", padding: "8px 10px",
                    marginBottom: 6, background: "#3a1a1a",
                    borderLeft: "3px solid #ef4444", borderRadius: 6,
                  }}>{c}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Timetable */}
        {schedule ? (
          <div style={styles.ttCard} className="fade-up">
            <div style={styles.ttHeader}>
              <span style={styles.ttTitle}>Generated Schedule</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {selectedMods.map((m) => (
                  <span key={m.code} style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 10px",
                    borderRadius: 20, background: m.color.bg,
                    color: m.color.text, border: "1px solid " + m.color.border,
                  }}>{m.code}</span>
                ))}
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.thTime}>Time</th>
                    {DAY_SHORT.map((d) => (
                      <th key={d} style={styles.th}>{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HOURS.map((h) => (
                    <tr key={h}>
                      <td style={styles.tdTime}>{hourLabel(h)}</td>
                      {DAYS.map((d) => (
                        <td key={d} style={styles.td}>{renderCell(d, h)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={styles.placeholder}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
            <div style={{ fontSize: 14, color: "#475569", fontWeight: 600 }}>Your timetable will appear here</div>
            <div style={{ fontSize: 12, color: "#334155", marginTop: 4 }}>Select modules and click Generate</div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", position: "relative" },
  bg: { position: "fixed", inset: 0, background: "linear-gradient(135deg,#060d1a 0%,#0a1628 50%,#060d1a 100%)", zIndex: 0 },
  page: { position: "relative", zIndex: 1, maxWidth: 1400, margin: "0 auto", padding: "24px 24px 48px" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 },
  logoIcon: { width: 36, height: 36, background: "#0f1929", border: "1px solid #1e3a5f", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" },
  panels: { display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, marginBottom: 20 },
  leftPanel: { background: "#080d16", border: "1px solid #1e293b", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", minHeight: 380 },
  rightPanel: { background: "#080d16", border: "1px solid #1e293b", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column" },
  panelTitle: { fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 800, color: "#2563EB", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 },
  fg: { marginBottom: 14 },
  fl: { fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 },
  ttCard: { background: "#080d16", border: "1px solid #1e293b", borderRadius: 16, overflow: "hidden" },
  ttHeader: { padding: "18px 24px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 },
  ttTitle: { fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 800, color: "white" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 720, tableLayout: "fixed" },
  thTime: { padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "left", width: "9%", background: "#050a12", borderBottom: "1px solid #1e293b" },
  th: { padding: "12px 8px", fontSize: 12, fontWeight: 700, textAlign: "center", background: "#050a12", borderBottom: "1px solid #1e293b", borderLeft: "1px solid #1e293b", color: "#64748b", width: "18.2%" },
  tdTime: { padding: "0 16px", fontSize: 11, color: "#334155", fontWeight: 600, background: "#050a12", borderBottom: "1px solid #0f1929", whiteSpace: "nowrap", height: 52, verticalAlign: "middle" },
  td: { padding: 2, borderBottom: "1px solid #0f1929", borderLeft: "1px solid #0f1929", height: 52, verticalAlign: "middle" },
  lunchCell: { height: 46, display: "flex", alignItems: "center", justifyContent: "center", background: "#1a2e1a", borderRadius: 6, fontSize: 11, fontWeight: 600, color: "#6ee7b7" },
  emptyCell: { height: 46 },
  placeholder: { border: "1px dashed #1e293b", borderRadius: 16, padding: "48px 24px", textAlign: "center" },
};