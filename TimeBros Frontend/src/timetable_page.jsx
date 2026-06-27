import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const API = "https://timebros.onrender.com";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const HOURS = Array.from({ length: 13 }, (_, i) => 8 + i);

const TIME_OPTIONS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
];

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

const BLOCK_COLOR = { bg: "#1a1a2e", border: "#6366f1", text: "#a5b4fc" };

function makeEmptyDayBlocks() {
  const obj = {};
  DAYS.forEach((d) => { obj[d] = []; });
  return obj;
}

function makeAllDaysEnabled() {
  const obj = {};
  DAYS.forEach((d) => { obj[d] = true; });
  return obj;
}

function timeToHour(t) {
  if (!t) return 0;
  return parseInt(String(t).slice(0, 2), 10);
}

function hourLabel(h) {
  return (h < 10 ? "0" : "") + h + ":00";
}

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

function buildGrid(selectedMods, selectionMap, dayBlocks, enabledDays) {
  const grid = {};
  DAYS.forEach((d) => { grid[d] = {}; });
  const conflicts = [];

  for (const day of DAYS) {
    if (!enabledDays[day]) continue;
    for (const block of (dayBlocks[day] || [])) {
      const fromH = parseInt(block.from, 10);
      const toH = parseInt(block.to, 10);
      if (fromH >= toH) continue;
      for (let h = fromH; h < toH; h++) {
        grid[day][h] = {
          isBlock: true,
          blockName: block.name,
          isNameMissing: !block.name,
          color: BLOCK_COLOR,
          isStart: h === fromH,
          isEnd: h === toH - 1,
          startTime: block.from + ":00",
          endTime: block.to + ":00",
        };
      }
    }
  }

  for (const mod of selectedMods) {
    const sel = selectionMap[mod.code] || {};
    for (const [type, classNos] of Object.entries(mod.grouped || {})) {
      const chosenClass = sel[type] || Object.keys(classNos)[0];
      const slots = classNos[chosenClass] || [];
      for (const lesson of slots) {
        const day = lesson.day;
        if (!DAYS.includes(day)) continue;
        if (!enabledDays[day]) {
          conflicts.push(`${mod.code} has a class on ${day}, which is toggled off`);
          continue;
        }
        const startH = timeToHour(lesson.start_time);
        const endH = timeToHour(lesson.end_time);
        for (let h = startH; h < endH; h++) {
          if (grid[day][h]) {
            const existing = grid[day][h];
            const existingName = existing.isBlock ? `"${existing.blockName}" block` : existing.modCode;
            conflicts.push(`Conflict on ${day} ${hourLabel(h)}: ${mod.code} clashes with ${existingName}`);
          } else {
            grid[day][h] = {
              modCode: mod.code,
              lessonType: lesson.lesson_type,
              classNo: lesson.class_no,
              startTime: lesson.start_time,
              endTime: lesson.end_time,
              venue: lesson.venue,
              isStart: h === startH,
              isEnd: h === endH - 1,
              color: mod.color,
            };
          }
        }
      }
    }
  }
  return { grid, conflicts };
}

function checkCriteria(grid, criteria, dayBlocks, enabledDays) {
  const errs = [];

  if (criteria.freeBlock.enabled) {
    const fromH = parseInt(criteria.freeBlock.from, 10);
    const toH = parseInt(criteria.freeBlock.to, 10);
    for (const day of DAYS) {
      if (!enabledDays[day]) continue;
      for (let h = fromH; h < toH; h++) {
        if (grid[day][h] && !grid[day][h].isBlock) {
          errs.push(`Class on ${day} at ${hourLabel(h)} falls in blocked window ${hourLabel(fromH)}–${hourLabel(toH)}`);
          break;
        }
      }
    }
  }

  for (const day of DAYS) {
    if (!enabledDays[day]) continue;
    for (const block of (dayBlocks[day] || [])) {
      const fromH = parseInt(block.from, 10);
      const toH = parseInt(block.to, 10);
      if (!block.name || fromH >= toH) continue;
      for (let h = fromH; h < toH; h++) {
        if (grid[day][h] && !grid[day][h].isBlock) {
          errs.push(`Class on ${day} at ${hourLabel(h)} conflicts with "${block.name}" block`);
          break;
        }
      }
    }
  }

  return errs;
}

function getRuns(grid, day) {
  const classHours = HOURS.filter((h) => grid[day][h] && !grid[day][h].isBlock).sort((a, b) => a - b);
  if (classHours.length === 0) return [];
  const runs = [];
  let run = [classHours[0]];
  for (let i = 1; i < classHours.length; i++) {
    if (classHours[i] === classHours[i - 1] + 1) run.push(classHours[i]);
    else { runs.push(run); run = [classHours[i]]; }
  }
  runs.push(run);
  return runs;
}

function scoreSchedule(grid, criteria, enabledDays) {
  const breakdown = [];
  let totalPenalty = 0;
  const activeDays = DAYS.filter((d) => enabledDays[d]);

  if (criteria.noGaps) {
    let gapHours = 0;
    for (const day of activeDays) {
      const classHours = HOURS.filter((h) => grid[day][h] && !grid[day][h].isBlock).sort((a, b) => a - b);
      for (let i = 0; i < classHours.length - 1; i++) {
        const gap = classHours[i + 1] - classHours[i] - 1;
        if (gap > 0) gapHours += gap;
      }
    }
    const penalty = Math.min(gapHours * 5, 40);
    totalPenalty += penalty;
    breakdown.push({ label: "No gaps", detail: gapHours === 0 ? "No idle hours" : `${gapHours}h idle`, penalty, perfect: gapHours === 0 });
  }

  if (criteria.maxConsec.enabled) {
    let overHours = 0;
    for (const day of activeDays) {
      for (const run of getRuns(grid, day)) {
        if (run.length > criteria.maxConsec.hours) overHours += run.length - criteria.maxConsec.hours;
      }
    }
    const penalty = Math.min(overHours * 10, 40);
    totalPenalty += penalty;
    breakdown.push({ label: `Max ${criteria.maxConsec.hours}h consec`, detail: overHours === 0 ? "Within limit" : `${overHours}h over`, penalty, perfect: overHours === 0 });
  }

  if (criteria.bufferHours.enabled && criteria.maxConsec.enabled) {
    let missingBuffer = 0;
    for (const day of activeDays) {
      const runs = getRuns(grid, day);
      for (let r = 0; r < runs.length - 1; r++) {
        if (runs[r].length >= criteria.maxConsec.hours) {
          const gap = runs[r + 1][0] - runs[r][runs[r].length - 1] - 1;
          if (gap < criteria.bufferHours.hours) missingBuffer += criteria.bufferHours.hours - gap;
        }
      }
    }
    const penalty = Math.min(missingBuffer * 8, 40);
    totalPenalty += penalty;
    breakdown.push({ label: `${criteria.bufferHours.hours}h buffer`, detail: missingBuffer === 0 ? "Buffer respected" : `${missingBuffer}h short`, penalty, perfect: missingBuffer === 0 });
  }

  const score = Math.max(0, 100 - totalPenalty);
  return { score, breakdown };
}

function getAllCombinations(selectedMods) {
  const axes = [];
  for (const mod of selectedMods) {
    for (const [type, classNos] of Object.entries(mod.grouped || {})) {
      axes.push({ modCode: mod.code, lessonType: type, options: Object.keys(classNos) });
    }
  }

  let combos = [{}];
  for (const axis of axes) {
    const next = [];
    for (const combo of combos) {
      for (const opt of axis.options) {
        next.push({
          ...combo,
          [axis.modCode]: { ...(combo[axis.modCode] || {}), [axis.lessonType]: opt },
        });
      }
    }
    combos = next;
    if (combos.length > 50000) break;
  }
  return combos;
}

function UnitsTracker({ selectedMods }) {
  const totalUnits = selectedMods.reduce((sum, m) => sum + (m.credits || 0), 0);
  return (
    <>
      <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 800, color: "#2563EB", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>
        Units
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
        <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 40, fontWeight: 800, lineHeight: 1, color: "#a8ccf5" }}>{totalUnits}</span>
        <span style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>MCs</span>
      </div>
      <div style={{ marginBottom: 16 }} />
      <div style={{ borderTop: "1px solid #1e293b", marginBottom: 14 }} />
      <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Breakdown</div>
      {selectedMods.length === 0 ? (
        <div style={{ fontSize: 12, color: "#334155" }}>Add modules to see breakdown</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {selectedMods.map((m) => (
            <div key={m.code} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 3, alignSelf: "stretch", borderRadius: 2, background: m.color.border, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: m.color.text }}>{m.code}</div>
                <div style={{ fontSize: 10, color: "#334155", marginTop: 1 }}>{m.credits ?? "—"} MC</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function ScorePanel({ scoreData, autoResults, selectedResult, mode }) {
  const data = mode === "auto" && autoResults.length > 0
    ? { score: autoResults[selectedResult]?.score ?? null, breakdown: autoResults[selectedResult]?.breakdown ?? [] }
    : scoreData;

  const score = data?.score ?? null;
  const breakdown = data?.breakdown ?? [];

  function scoreColor(s) {
    if (s >= 90) return "#10b981";
    if (s >= 70) return "#3b82f6";
    if (s >= 50) return "#f97316";
    return "#ef4444";
  }

  function scoreLabel(s) {
    if (s >= 90) return "Excellent";
    if (s >= 70) return "Good";
    if (s >= 50) return "Fair";
    return "Poor";
  }

  const noSoftFilters = breakdown.length === 0;

  return (
    <>
      <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 800, color: "#2563EB", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>
        Score
      </div>
      {score === null ? (
        <div style={{ fontSize: 12, color: "#334155" }}>
          {noSoftFilters ? "Enable soft filters to see a score" : "Generate a timetable to see score"}
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
            <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 40, fontWeight: 800, lineHeight: 1, color: scoreColor(score) }}>{score}</span>
            <span style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>/100</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: scoreColor(score), marginBottom: 12 }}>{scoreLabel(score)}</div>
          <div style={{ height: 6, background: "#1e293b", borderRadius: 3, marginBottom: 16, overflow: "hidden" }}>
            <div style={{ height: "100%", width: score + "%", background: scoreColor(score), borderRadius: 3, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ borderTop: "1px solid #1e293b", marginBottom: 12 }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Breakdown</div>
          {noSoftFilters ? (
            <div style={{ fontSize: 11, color: "#334155" }}>No soft filters active</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {breakdown.map((b, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: b.perfect ? "#10b981" : "#f97316" }}>{b.label}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: b.perfect ? "#10b981" : "#fca5a5" }}>
                      {b.perfect ? "✓" : `-${b.penalty}pts`}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: "#475569" }}>{b.detail}</div>
                </div>
              ))}
            </div>
          )}
          {mode === "auto" && autoResults.length > 1 && (
            <>
              <div style={{ borderTop: "1px solid #1e293b", margin: "14px 0 10px" }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Options</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {autoResults.map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: i === selectedResult ? "#e2e8f0" : "#475569", fontWeight: i === selectedResult ? 700 : 400 }}>
                      Option {i + 1}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor(r.score ?? 100) }}>{r.score ?? 100}/100</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

function DayBlocksEditor({ dayBlocks, setDayBlocks }) {
  const [expanded, setExpanded] = useState(null);

  function addBlock(day) {
    setDayBlocks((prev) => {
      const current = prev[day] || [];
      if (current.length >= 3) return prev;
      return { ...prev, [day]: [...current, { name: "", from: "12", to: "13" }] };
    });
  }

  function removeBlock(day, idx) {
    setDayBlocks((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== idx),
    }));
  }

  function updateBlock(day, idx, field, value) {
    setDayBlocks((prev) => ({
      ...prev,
      [day]: prev[day].map((b, i) => i === idx ? { ...b, [field]: value } : b),
    }));
  }

  const totalBlocks = DAYS.reduce((sum, d) => sum + (dayBlocks[d]?.length || 0), 0);

  return (
    <div style={{ background: "#0a1220", borderRadius: 10, border: "1px solid #1e293b", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderBottom: totalBlocks > 0 || expanded ? "1px solid #1e293b" : "none" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Personal activity blocks</div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>Block time per day (up to 3)</div>
        </div>
        {totalBlocks > 0 && (
          <span style={{ fontSize: 10, fontWeight: 700, color: BLOCK_COLOR.text, background: BLOCK_COLOR.bg, border: "1px solid " + BLOCK_COLOR.border, borderRadius: 10, padding: "2px 8px" }}>
            {totalBlocks} block{totalBlocks > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {DAYS.map((day, di) => {
        const blocks = dayBlocks[day] || [];
        const isOpen = expanded === day;
        return (
          <div key={day} style={{ borderBottom: di < DAYS.length - 1 ? "1px solid #0f1929" : "none" }}>
            <div
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", cursor: "pointer" }}
              onClick={() => setExpanded(isOpen ? null : day)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: isOpen ? "#6366f1" : "#64748b", width: 32 }}>{DAY_SHORT[di]}</span>
                {blocks.map((b, i) => (
                  <span key={i} style={{ fontSize: 10, fontWeight: 600, color: BLOCK_COLOR.text, background: BLOCK_COLOR.bg, border: "1px solid " + BLOCK_COLOR.border, borderRadius: 8, padding: "1px 6px", maxWidth: 70, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {b.name || "unnamed"}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {blocks.length < 3 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); addBlock(day); setExpanded(day); }}
                    style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 5, color: "#64748b", fontSize: 14, width: 22, height: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
                  >+</button>
                )}
                <span style={{ fontSize: 10, color: "#334155" }}>{isOpen ? "▲" : "▼"}</span>
              </div>
            </div>

            {isOpen && blocks.length > 0 && (
              <div style={{ padding: "0 12px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
                {blocks.map((block, idx) => (
                  <div key={idx} style={{ background: "#080d16", border: "1px solid " + BLOCK_COLOR.border, borderRadius: 8, padding: "8px 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <input
                        placeholder="Activity name (e.g. Lunch)"
                        value={block.name}
                        onChange={(e) => updateBlock(day, idx, "name", e.target.value)}
                        maxLength={20}
                        style={{ flex: 1, background: "#0f1929", border: "1px solid #1e3a5f", borderRadius: 6, padding: "5px 8px", fontSize: 11, color: "white", fontFamily: "'DM Sans', sans-serif", outline: "none" }}
                      />
                      <button
                        onClick={() => removeBlock(day, idx)}
                        style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 2px" }}
                      >×</button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <select
                        className="time-sel"
                        value={block.from}
                        onChange={(e) => updateBlock(day, idx, "from", e.target.value)}
                      >
                        {TIME_OPTIONS.slice(0, -1).map((t) => <option key={t} value={t.slice(0, 2)}>{t}</option>)}
                      </select>
                      <span style={{ color: "#475569", fontSize: 11 }}>to</span>
                      <select
                        className="time-sel"
                        value={block.to}
                        onChange={(e) => updateBlock(day, idx, "to", e.target.value)}
                      >
                        {TIME_OPTIONS.slice(1).map((t) => <option key={t} value={t.slice(0, 2)}>{t}</option>)}
                      </select>
                    </div>
                    {parseInt(block.from, 10) >= parseInt(block.to, 10) && (
                      <div style={{ marginTop: 5, fontSize: 10, color: "#fca5a5" }}>End time must be later than start</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isOpen && blocks.length === 0 && (
              <div style={{ padding: "4px 12px 10px" }}>
                <button
                  onClick={() => addBlock(day)}
                  style={{ width: "100%", padding: "7px", borderRadius: 7, border: "1px dashed #334155", background: "transparent", color: "#475569", fontSize: 11, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
                >
                  + Add block for {day}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DayToggles({ enabledDays, setEnabledDays }) {
  const allOn = DAYS.every((d) => enabledDays[d]);

  function toggleDay(day) {
    setEnabledDays((prev) => ({ ...prev, [day]: !prev[day] }));
  }

  function toggleAll() {
    const next = !allOn;
    const obj = {};
    DAYS.forEach((d) => { obj[d] = next; });
    setEnabledDays(obj);
  }

  return (
    <div style={{ background: "#0a1220", borderRadius: 10, border: "1px solid #1e293b", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderBottom: "1px solid #1e293b" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Available days</div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>Toggle days you can attend class</div>
        </div>
        <button
          onClick={toggleAll}
          style={{ fontSize: 10, fontWeight: 700, color: allOn ? "#fca5a5" : "#6ee7b7", background: allOn ? "#3a1a1a" : "#1a3a2e", border: "1px solid " + (allOn ? "#ef4444" : "#10b981"), borderRadius: 8, padding: "3px 9px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
        >
          {allOn ? "Clear all" : "Select all"}
        </button>
      </div>
      <div style={{ display: "flex", gap: 6, padding: "10px 12px", flexWrap: "wrap" }}>
        {DAYS.map((day, di) => {
          const on = enabledDays[day];
          return (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: "1px solid " + (on ? "#3b82f6" : "#1e293b"),
                background: on ? "#1e3a5f" : "#0f1929",
                color: on ? "#93c5fd" : "#475569",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.15s",
              }}
            >
              {DAY_SHORT[di]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FriendMatchPanel({ selectedMods, mySelectionMap, userEmail, dayBlocks, enabledDays, onSwap }) {
  const [friendEmail, setFriendEmail] = useState("");
  const [friendData, setFriendData] = useState(null);
  const [fetchStatus, setFetchStatus] = useState("idle");
  const [fetchError, setFetchError] = useState("");

  const [sharedMods, setSharedMods] = useState([]);
  const [matchResults, setMatchResults] = useState(null);
  const [hasChecked, setHasChecked] = useState(false);

  const [swapErrors, setSwapErrors] = useState({});
  const [swapDone, setSwapDone] = useState({});


  function getSwapClash(modCode, lessonType, targetClassNo) {
    const mod = selectedMods.find(m => m.code === modCode);
    if (!mod) return null;
    const slots = mod.grouped?.[lessonType]?.[targetClassNo] || [];

    const occupied = {};
    DAYS.forEach(day => {
      if (!enabledDays[day]) return;

      for (const block of (dayBlocks[day] || [])) {
        const fromH = parseInt(block.from, 10);
        const toH = parseInt(block.to, 10);
        for (let h = fromH; h < toH; h++) occupied[`${day}|${h}`] = block.name ? `"${block.name}" block` : "a personal block";
      }
    });

    for (const m of selectedMods) {
      for (const [lt, classNos] of Object.entries(m.grouped || {})) {
        if (m.code === modCode && lt === lessonType) continue;
        const chosenClass = mySelectionMap[m.code]?.[lt] || Object.keys(classNos)[0];
        for (const lesson of (classNos[chosenClass] || [])) {
          if (!enabledDays[lesson.day]) continue;
          const startH = timeToHour(lesson.start_time);
          const endH = timeToHour(lesson.end_time);
          for (let h = startH; h < endH; h++) {
            occupied[`${lesson.day}|${h}`] = `${m.code} ${lt}`;
          }
        }
      }
    }

    for (const lesson of slots) {
      if (!enabledDays[lesson.day]) continue;
      const startH = timeToHour(lesson.start_time);
      const endH = timeToHour(lesson.end_time);
      for (let h = startH; h < endH; h++) {
        const key = `${lesson.day}|${h}`;
        if (occupied[key]) return `Clashes with ${occupied[key]} on ${lesson.day} at ${hourLabel(h)}`;
      }
    }
    return null;
  }

  useEffect(() => {
    if (!friendData) { setSharedMods([]); setMatchResults(null); setHasChecked(false); return; }

    const friendModCodes = new Set((friendData.selectedMods || []).map(m => m.code));
    const overlap = selectedMods.filter(m => friendModCodes.has(m.code));

    setSharedMods(prev => {
      return overlap.map(m => {
        const lessonTypes = Object.keys(m.grouped || {});
        const existing = prev.find(p => p.code === m.code);
        return {
          code: m.code,
          title: m.title,
          lessonTypes: lessonTypes.map(lt => {
            const existingLt = existing?.lessonTypes.find(e => e.type === lt);
            return { type: lt, mustMatch: existingLt ? existingLt.mustMatch : true };
          }),
        };
      });
    });
    setMatchResults(null);
    setHasChecked(false);
  }, [friendData, selectedMods]);

  async function fetchFriend() {
    const email = friendEmail.trim().toLowerCase();
    if (!email) return;
    if (email === userEmail.toLowerCase()) {
      setFetchError("That's your own email.");
      setFetchStatus("error");
      return;
    }
    setFetchStatus("loading");
    setFetchError("");
    setFriendData(null);
    setMatchResults(null);
    setHasChecked(false);
    try {
      const res = await fetch(`${API}/schedules/${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.error || !data.selected_mods) {
        setFetchError("No saved timetable found for this email.");
        setFetchStatus("error");
        return;
      }
      setFriendData({
        selectionMap: data.selection_map || {},
        selectedMods: data.selected_mods || [],
      });
      setFetchStatus("found");
    } catch {
      setFetchError("Could not reach the server.");
      setFetchStatus("error");
    }
  }

  function toggleMustMatch(modCode, lessonType) {
    setSharedMods(prev => prev.map(m =>
      m.code !== modCode ? m : {
        ...m,
        lessonTypes: m.lessonTypes.map(lt =>
          lt.type !== lessonType ? lt : { ...lt, mustMatch: !lt.mustMatch }
        ),
      }
    ));
    setMatchResults(null);
    setHasChecked(false);
  }

  function checkMatch() {
    if (!friendData) return;
    const matches = [];
    const mismatches = [];

    for (const mod of sharedMods) {
      for (const lt of mod.lessonTypes) {
        if (!lt.mustMatch) continue;

        const myClass = mySelectionMap[mod.code]?.[lt.type]
          || Object.keys(selectedMods.find(m => m.code === mod.code)?.grouped?.[lt.type] || {})[0];
        const friendRawClass = friendData.selectionMap[mod.code]?.[lt.type];
        const friendMod = selectedMods.find(m => m.code === mod.code);
        const friendClass = friendRawClass
          || Object.keys(friendMod?.grouped?.[lt.type] || {})[0];

        if (!myClass || !friendClass) {
          mismatches.push({ modCode: mod.code, lessonType: lt.type, myClass: myClass || null, friendClass: friendClass || null, reason: "One side has no selection" });
          continue;
        }

        if (myClass === friendClass) {
          matches.push({ modCode: mod.code, lessonType: lt.type, classNo: myClass });
        } else {
          mismatches.push({ modCode: mod.code, lessonType: lt.type, myClass, friendClass });
        }
      }
    }

    setMatchResults({ matches, mismatches });
    setHasChecked(true);
    setSwapErrors({});
    setSwapDone({});
  }

  const modColor = (code) => {
    const mod = selectedMods.find(m => m.code === code);
    return mod?.color || MOD_COLORS[0];
  };

  const checkedModCount = sharedMods.filter(m => m.lessonTypes.some(lt => lt.mustMatch)).length;

  return (
    <>
      <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 800, color: "#a855f7", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
        Friend Match
      </div>
      <div style={{ fontSize: 11, color: "#475569", marginBottom: 14, lineHeight: 1.5 }}>
        Check if you and a friend share the same class slots.
      </div>

      {/* Step 1: Enter friend email */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
          1 · Friend's email
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            placeholder="friend@example.com"
            value={friendEmail}
            onChange={e => { setFriendEmail(e.target.value); setFetchStatus("idle"); setFetchError(""); }}
            onKeyDown={e => e.key === "Enter" && fetchFriend()}
            style={{
              flex: 1, background: "#0f1929", border: "1px solid #2e1a3a",
              borderRadius: 8, padding: "8px 10px", fontSize: 12, color: "white",
              fontFamily: "'DM Sans', sans-serif", outline: "none",
            }}
          />
          <button
            onClick={fetchFriend}
            disabled={fetchStatus === "loading" || !friendEmail.trim()}
            style={{
              background: "#2e1a3a", border: "1px solid #a855f7", borderRadius: 8,
              color: "#d8b4fe", fontSize: 12, fontWeight: 700, padding: "8px 12px",
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap",
              opacity: (!friendEmail.trim() || fetchStatus === "loading") ? 0.5 : 1,
            }}
          >
            {fetchStatus === "loading" ? "…" : "Load"}
          </button>
        </div>

        {fetchStatus === "error" && (
          <div style={{ marginTop: 6, fontSize: 11, color: "#fca5a5", background: "#3a1a1a", border: "1px solid #ef4444", borderRadius: 7, padding: "6px 10px" }}>
            ✗ {fetchError}
          </div>
        )}
        {fetchStatus === "found" && (
          <div style={{ marginTop: 6, fontSize: 11, color: "#d8b4fe", background: "#2e1a3a", border: "1px solid #a855f7", borderRadius: 7, padding: "6px 10px" }}>
            ✓ Timetable loaded · {friendData.selectedMods.length} module{friendData.selectedMods.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Step 2: Shared modules + lesson type picker */}
      {fetchStatus === "found" && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            2 · Modules to match
          </div>

          {sharedMods.length === 0 ? (
            <div style={{ fontSize: 12, color: "#475569", padding: "10px 12px", background: "#0a1220", borderRadius: 8, border: "1px solid #1e293b" }}>
              No modules in common. You and your friend haven't selected any of the same modules.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sharedMods.map(mod => {
                const color = modColor(mod.code);
                return (
                  <div key={mod.code} style={{ background: color.bg, border: "1px solid " + color.border, borderRadius: 9, padding: "10px 12px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: color.text, marginBottom: 8 }}>
                      {mod.code}
                      <span style={{ fontSize: 10, fontWeight: 400, color: color.border, marginLeft: 6 }}>{mod.title}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {mod.lessonTypes.map(lt => (
                        <div
                          key={lt.type}
                          onClick={() => toggleMustMatch(mod.code, lt.type)}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            background: lt.mustMatch ? "#0a0f1a" : "transparent",
                            border: "1px solid " + (lt.mustMatch ? color.border : "#1e293b"),
                            borderRadius: 7, padding: "5px 10px", cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          <span style={{ fontSize: 11, fontWeight: 600, color: lt.mustMatch ? color.text : "#475569" }}>
                            {lt.type}
                          </span>
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            color: lt.mustMatch ? color.border : "#e2e8f0",
                            background: lt.mustMatch ? color.bg : "#0f1929",
                            border: "1px solid " + (lt.mustMatch ? color.border : "#1e293b"),
                            borderRadius: 6, padding: "2px 7px",
                          }}>
                            {lt.mustMatch ? "must match" : "skip"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Check button */}
      {fetchStatus === "found" && sharedMods.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            3 · Check matches
          </div>
          <button
            onClick={checkMatch}
            disabled={checkedModCount === 0}
            style={{
              width: "100%", padding: "11px", borderRadius: 9,
              background: checkedModCount > 0 ? "#2e1a3a" : "#0f1929",
              border: "1px solid " + (checkedModCount > 0 ? "#a855f7" : "#1e293b"),
              color: checkedModCount > 0 ? "#d8b4fe" : "#334155",
              fontSize: 13, fontWeight: 700, cursor: checkedModCount > 0 ? "pointer" : "not-allowed",
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
            }}
          >
            {checkedModCount === 0 ? "Select at least one lesson type" : `Check ${checkedModCount} module${checkedModCount !== 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {/* Results */}
      {hasChecked && matchResults && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
            Results
          </div>

          {matchResults.matches.length === 0 && matchResults.mismatches.length === 0 && (
            <div style={{ fontSize: 12, color: "#475569", padding: "10px 12px", background: "#0a1220", borderRadius: 8, border: "1px solid #1e293b" }}>
              No lesson types were checked.
            </div>
          )}

          {matchResults.matches.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "#10b981", fontWeight: 700, marginBottom: 6 }}>
                ✓ {matchResults.matches.length} match{matchResults.matches.length !== 1 ? "es" : ""}
              </div>
              {matchResults.matches.map((m, i) => {
                const color = modColor(m.modCode);
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "7px 10px", marginBottom: 5, borderRadius: 7,
                    background: "#0d2218", border: "1px solid #10b981",
                  }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: color.text }}>{m.modCode}</span>
                      <span style={{ fontSize: 11, color: "#64748b", marginLeft: 6 }}>{m.lessonType}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981", background: "#0a2018", border: "1px solid #10b981", borderRadius: 6, padding: "2px 8px" }}>
                      [{m.classNo}]
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {matchResults.mismatches.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: "#f97316", fontWeight: 700, marginBottom: 6 }}>
                ✗ {matchResults.mismatches.length} mismatch{matchResults.mismatches.length !== 1 ? "es" : ""}
              </div>
              {matchResults.mismatches.map((m, i) => {
                const color = modColor(m.modCode);
                const swapKey = `${m.modCode}:${m.lessonType}`;
                const swapErr = swapErrors[swapKey];
                const swapped = swapDone[swapKey];
                return (
                  <div key={i} style={{
                    padding: "8px 10px", marginBottom: 5, borderRadius: 7,
                    background: swapped ? "#0d2218" : "#1a0d00",
                    border: "1px solid " + (swapped ? "#10b981" : "#f97316"),
                    transition: "all 0.2s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: (m.myClass || m.friendClass) ? 6 : 0 }}>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: color.text }}>{m.modCode}</span>
                        <span style={{ fontSize: 11, color: "#64748b", marginLeft: 6 }}>{m.lessonType}</span>
                      </div>
                      <span style={{ fontSize: 10, color: swapped ? "#10b981" : "#f97316", fontWeight: 700 }}>
                        {swapped ? "swapped ✓" : "different slot"}
                      </span>
                    </div>
                    {(m.myClass || m.friendClass) && (
                      <>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: swapped ? 0 : 8 }}>
                          {m.myClass && (
                            <span style={{ fontSize: 10, color: "#93c5fd", background: "#0f1929", border: "1px solid #1e3a5f", borderRadius: 5, padding: "2px 7px" }}>
                              You: [{m.myClass}]
                            </span>
                          )}
                          {m.friendClass && (
                            <span style={{ fontSize: 10, color: "#d8b4fe", background: "#1a0d20", border: "1px solid #a855f7", borderRadius: 5, padding: "2px 7px" }}>
                              Friend: [{m.friendClass}]
                            </span>
                          )}
                        </div>
                        {!swapped && m.friendClass && (
                          <button
                            onClick={() => {
                              const clash = getSwapClash(m.modCode, m.lessonType, m.friendClass);
                              if (clash) {
                                setSwapErrors(prev => ({ ...prev, [swapKey]: clash }));
                              } else {
                                setSwapErrors(prev => ({ ...prev, [swapKey]: null }));
                                setSwapDone(prev => ({ ...prev, [swapKey]: true }));
                                onSwap(m.modCode, m.lessonType, m.friendClass);
                              }
                            }}
                            style={{
                              width: "100%", padding: "6px 10px", borderRadius: 7,
                              background: "#2e1a3a", border: "1px solid #a855f7",
                              color: "#d8b4fe", fontSize: 11, fontWeight: 700,
                              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                              textAlign: "left",
                            }}
                          >
                            → Switch to [{m.friendClass}] to match friend
                          </button>
                        )}
                        {swapErr && (
                          <div style={{ marginTop: 5, fontSize: 10, color: "#fca5a5", background: "#3a1a1a", border: "1px solid #ef4444", borderRadius: 6, padding: "5px 8px" }}>
                            ✗ Can't swap — {swapErr}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {matchResults.matches.length > 0 && matchResults.mismatches.length === 0 && (
            <div style={{ marginTop: 10, padding: "10px 12px", background: "#0d2218", border: "1px solid #10b981", borderRadius: 8, fontSize: 12, color: "#6ee7b7", fontWeight: 600, textAlign: "center" }}>
              🎉 All selected slots match!
            </div>
          )}
        </div>
      )}

      {/* Hint when no timetable loaded yet */}
      {fetchStatus === "idle" && (
        <div style={{ marginTop: 8, padding: "12px", background: "#0a1220", border: "1px dashed #2e1a3a", borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.6 }}>
            Both you and your friend must save your timetables first. Then enter their email above to check for matching class slots.
          </div>
        </div>
      )}
    </>
  );
}

export default function TimetablePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = location.state?.email;

  const [allModules, setAllModules] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMods, setSelectedMods] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  const [selections, setSelections] = useState({});
  const [noGaps, setNoGaps] = useState(false);
  const [freeBlock, setFreeBlock] = useState({ enabled: false, from: "12", to: "14" });
  const [dayBlocks, setDayBlocks] = useState(makeEmptyDayBlocks());
  const [enabledDays, setEnabledDays] = useState(makeAllDaysEnabled());
  const [maxConsec, setMaxConsec] = useState({ enabled: false, hours: 3 });
  const [bufferHours, setBufferHours] = useState({ enabled: false, hours: 1 });

  const [schedule, setSchedule] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [generating, setGenerating] = useState(false);

  const [autoResults, setAutoResults] = useState([]);
  const [autoError, setAutoError] = useState("");
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [selectedResult, setSelectedResult] = useState(0);

  const [loadingMod, setLoadingMod] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [mode, setMode] = useState("manual");

  useEffect(() => {
    fetch(`${API}/modules`)
      .then((r) => r.json())
      .then((data) => setAllModules(Array.isArray(data) ? data : []))
      .catch(() => setAllModules([]));
  }, []);

  useEffect(() => {
    function handler(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowDropdown(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!userEmail) {
      navigate("/");
      return;
    }
    fetch(`${API}/schedules/${encodeURIComponent(userEmail)}`, {
      headers: { "Cache-Control": "no-cache" }
    })
      .then(r => r.json())
      .then(async (data) => {
        if (data.error || !data.selected_mods) return;

        const savedSelections = data.selection_map || {};
        const savedMods = data.selected_mods || [];
        const savedDayBlocks = data.day_blocks || makeEmptyDayBlocks();
        const savedEnabledDays = data.enabled_days || makeAllDaysEnabled();
        const savedMode = data.mode || "manual";
        const savedCriteria = {
          noGaps: data.no_gaps || false,
          freeBlock: data.free_block || { enabled: false, from: "12", to: "14" },
          maxConsec: data.max_consec || { enabled: false, hours: 3 },
          bufferHours: data.buffer_hours || { enabled: false, hours: 1 },
        };

        setDayBlocks(savedDayBlocks);
        setEnabledDays(savedEnabledDays);
        setMode(savedMode);
        setNoGaps(savedCriteria.noGaps);
        setFreeBlock(savedCriteria.freeBlock);
        setMaxConsec(savedCriteria.maxConsec);
        setBufferHours(savedCriteria.bufferHours);

        const restoredMods = await Promise.all(
          savedMods.map(async (m, i) => {
            const r = await fetch(`${API}/modules/${m.code}/lessons`);
            const lessons = await r.json();
            const grouped = groupLessons(lessons);
            return { ...m, lessons, grouped, color: MOD_COLORS[i % MOD_COLORS.length] };
          })
        );

        setSelectedMods(restoredMods);
        setSelections(savedSelections);

        const { grid } = buildGrid(restoredMods, savedSelections, savedDayBlocks, savedEnabledDays);
        setSchedule({ grid });
        setConflicts([]);
        setScoreData(scoreSchedule(grid, savedCriteria, savedEnabledDays));
      })
      .catch(err => console.error("Failed to load schedule:", err));
  }, [userEmail]);

  const filtered = allModules
    .filter((m) =>
      !selectedMods.find((s) => s.code === m.code) &&
      (m.code.toLowerCase().includes(search.toLowerCase()) ||
        m.title.toLowerCase().includes(search.toLowerCase()))
    )
    .slice(0, 8);

  function selectModule(mod) {
    if (selectedMods.find((s) => s.code === mod.code)) return;
    setSearch(""); setShowDropdown(false); setLoadingMod(mod.code);
    fetch(`${API}/modules/${mod.code}/lessons`)
      .then((r) => r.json())
      .then((lessons) => {
        const color = MOD_COLORS[selectedMods.length % MOD_COLORS.length];
        const grouped = groupLessons(lessons);
        const defaultSelections = {};
        for (const [type, classNos] of Object.entries(grouped)) {
          defaultSelections[type] = Object.keys(classNos)[0];
        }
        setSelections((prev) => ({ ...prev, [mod.code]: defaultSelections }));
        setSelectedMods((prev) => [...prev, { ...mod, lessons, grouped, color }]);
        setLoadingMod(null);
      })
      .catch(() => {
        const color = MOD_COLORS[selectedMods.length % MOD_COLORS.length];
        setSelectedMods((prev) => [...prev, { ...mod, lessons: [], grouped: {}, color }]);
        setLoadingMod(null);
      });
  }

  function removeMod(code) {
    setSelectedMods((prev) => prev.filter((m) => m.code !== code));
    setSelections((prev) => { const next = { ...prev }; delete next[code]; return next; });
    setSchedule(null); setConflicts([]); setScoreData(null);
    setAutoResults([]); setAutoError("");
  }

  function handleSelectionChange(modCode, lessonType, classNo) {
    setSelections((prev) => ({ ...prev, [modCode]: { ...prev[modCode], [lessonType]: classNo } }));
    setSchedule(null); setConflicts([]); setScoreData(null);
  }

  function generateWithSelections(selMap) {
    setConflicts([]); setSchedule(null);
    const { grid, conflicts: cErrs } = buildGrid(selectedMods, selMap, dayBlocks, enabledDays);
    const critErrs = checkCriteria(grid, { noGaps, freeBlock, maxConsec, bufferHours }, dayBlocks, enabledDays);
    const allErrs = [...cErrs, ...critErrs];
    setConflicts(allErrs);
    if (allErrs.length === 0) {
      setSchedule({ grid });
      setScoreData(scoreSchedule(grid, { noGaps, freeBlock, maxConsec, bufferHours }, enabledDays));
    }
  }

  function generate() {
    setGenerating(true); setConflicts([]); setSchedule(null);
    setTimeout(() => {
      if (selectedMods.length === 0) {
        setConflicts(["Please select at least one module."]);
        setGenerating(false); return;
      }
      if (freeBlock.enabled && parseInt(freeBlock.from, 10) >= parseInt(freeBlock.to, 10)) {
        setConflicts(["The 'no class' end time must be later than the start time."]);
        setGenerating(false); return;
      }
      const { grid, conflicts: cErrs } = buildGrid(selectedMods, selections, dayBlocks, enabledDays);
      const critErrs = checkCriteria(grid, { noGaps, freeBlock, maxConsec, bufferHours }, dayBlocks, enabledDays);
      const allErrs = [...cErrs, ...critErrs];
      setConflicts(allErrs);
      if (allErrs.length === 0) {
        setSchedule({ grid });
        setScoreData(scoreSchedule(grid, { noGaps, freeBlock, maxConsec, bufferHours }, enabledDays));
      }
      setGenerating(false);
    }, 300);
  }

  function autoGenerate() {
    setAutoGenerating(true); setAutoResults([]); setAutoError(""); setSelectedResult(0);
    setTimeout(() => {
      if (selectedMods.length === 0) {
        setAutoError("Please select at least one module.");
        setAutoGenerating(false); return;
      }
      if (freeBlock.enabled && parseInt(freeBlock.from, 10) >= parseInt(freeBlock.to, 10)) {
        setAutoError("The 'no class' end time must be later than the start time.");
        setAutoGenerating(false); return;
      }
      const allCombos = getAllCombinations(selectedMods);
      const valid = [];
      for (const combo of allCombos) {
        const { grid, conflicts: cErrs } = buildGrid(selectedMods, combo, dayBlocks, enabledDays);
        if (cErrs.length > 0) continue;
        const critErrs = checkCriteria(grid, { noGaps, freeBlock, maxConsec, bufferHours }, dayBlocks, enabledDays);
        if (critErrs.length === 0) {
          const sd = scoreSchedule(grid, { noGaps, freeBlock, maxConsec, bufferHours }, enabledDays);
          valid.push({ selectionMap: combo, grid, score: sd.score, breakdown: sd.breakdown });
        }
      }
      if (valid.length === 0) {
        setAutoError("No valid schedule found matching your criteria. Try relaxing the filters.");
        setAutoGenerating(false); return;
      }
      const ranked = valid.sort((a, b) => b.score - a.score).slice(0, 3);
      setAutoResults(ranked);
      setAutoGenerating(false);
    }, 400);
  }

  async function saveSchedule() {
    const finalSelectionMap = mode === "auto" && autoResults.length > 0
      ? autoResults[selectedResult].selectionMap
      : selections;

    try {
      const res = await fetch(`${API}/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          selectionMap: finalSelectionMap,
          selectedMods: selectedMods.map(m => ({ code: m.code, title: m.title, credits: m.credits })),
          dayBlocks,
          enabledDays,
          selectedResult: mode === "auto" ? selectedResult : 0,
          mode,
          no_gaps: noGaps,
          free_block: freeBlock,
          max_consec: maxConsec,
          buffer_hours: bufferHours,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      alert("Timetable saved!");
    } catch (err) {
      alert("Save failed: " + err.message);
    }
  }

  function renderCell(grid, day, hour) {
    if (!enabledDays[day]) {
      return (
        <div style={{
          height: 46,
          background: "repeating-linear-gradient(135deg, #080d16 0px, #080d16 4px, #0a1015 4px, #0a1015 8px)",
          opacity: 0.5,
        }} />
      );
    }

    const slot = grid[day][hour];
    if (!slot) return <div style={styles.emptyCell} />;

    if (slot.isBlock) {
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
          background: slot.color.bg, border: "2px solid " + slot.color.border,
          borderBottom: slot.isEnd ? "2px solid " + slot.color.border : "none",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2px 4px",
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: slot.isNameMissing ? "#ef4444" : slot.color.text, lineHeight: 1.2, textAlign: "center" }}>
            {slot.blockName || "Enter name!"}
          </span>
        </div>
      );
    }

    if (!slot.isStart) {
      return (
        <div style={{
          width: "100%", height: 46, background: slot.color.bg,
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
        background: slot.color.bg, border: "2px solid " + slot.color.border,
        borderBottom: slot.isEnd ? "2px solid " + slot.color.border : "none",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2px 4px",
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: slot.color.text, lineHeight: 1.2, textAlign: "center" }}>{slot.modCode}</span>
        <span style={{ fontSize: 10, color: slot.color.border, lineHeight: 1.2, textAlign: "center", marginTop: 1 }}>{slot.lessonType} [{slot.classNo}]</span>
        {slot.venue && (
          <span style={{ fontSize: 9, color: slot.color.text, lineHeight: 1.2, textAlign: "center", marginTop: 1, opacity: 0.75 }}>{slot.venue}</span>
        )}
      </div>
    );
  }

  function renderTimetable(grid) {
    return (
      <div style={{ overflowX: "auto" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.thTime}>Time</th>
              {DAY_SHORT.map((d, di) => {
                const day = DAYS[di];
                const on = enabledDays[day];
                return (
                  <th key={d} style={{ ...styles.th, color: on ? "#64748b" : "#2a3340", position: "relative" }}>
                    {d}
                    {!on && (
                      <span style={{ display: "block", fontSize: 9, color: "#ef4444", fontWeight: 600, letterSpacing: "0.05em", marginTop: 2 }}>OFF</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((h) => (
              <tr key={h}>
                <td style={styles.tdTime}>{hourLabel(h)}</td>
                {DAYS.map((d) => <td key={d} style={styles.td}>{renderCell(grid, d, h)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const activeSelectionMap = mode === "auto" && autoResults.length > 0
    ? autoResults[selectedResult]?.selectionMap ?? selections
    : selections;

  const activeGrid = mode === "auto" && autoResults.length > 0
    ? autoResults[selectedResult]?.grid
    : schedule?.grid;

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
        .tb-genbtn { width: 100%; padding: 12px; border-radius: 10px; background: #2563EB; border: none; color: white; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; letter-spacing: 0.03em; }
        .tb-genbtn:hover { background: #1d4ed8; }
        .tb-genbtn:disabled { opacity: 0.45; cursor: not-allowed; }
        .tb-autobtn { width: 100%; padding: 12px; border-radius: 10px; background: #2563EB; border: none; color: white; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; letter-spacing: 0.03em; }
        .tb-autobtn:hover { opacity: 0.9; }
        .tb-autobtn:disabled { opacity: 0.45; cursor: not-allowed; }
        .tb-logout { background: transparent; color: #64748b; border: 1px solid #1e293b; border-radius: 7px; padding: 6px 14px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .tb-logout:hover { background: #1e293b; color: white; }
        .tb-toggle { width: 36px; height: 20px; border-radius: 10px; background: #1e293b; border: 1px solid #334155; cursor: pointer; position: relative; flex-shrink: 0; }
        .tb-toggle.on { background: #2563EB; border-color: #2563EB; }
        .tb-toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: white; transition: left 0.2s; }
        .tb-toggle.on::after { left: 18px; }
        .slot-select { background: #0f1929; border: 1px solid #1e3a5f; border-radius: 6px; padding: 4px 6px; font-size: 11px; color: white; font-family: 'DM Sans', sans-serif; outline: none; cursor: pointer; width: 100%; margin-top: 4px; }
        .opt-btn { flex: 1; padding: 8px 4px; border-radius: 8px; border: 1px solid #1e3a5f; background: #080d16; color: #64748b; font-size: 12px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .opt-btn.active { background: #1e3a5f; border-color: #3b82f6; color: #93c5fd; }
        .opt-btn:hover:not(.active) { background: #0f1929; color: white; }
        .mode-tab { flex: 1; padding: 9px; border-radius: 8px; border: none; font-size: 12px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .mode-tab.active { background: #2563EB; color: white; }
        .mode-tab:not(.active) { background: transparent; color: #475569; }
        .time-sel { background: #0f1929; border: 1px solid #1e3a5f; border-radius: 7px; padding: 6px 8px; font-size: 12px; color: white; font-family: 'DM Sans', sans-serif; outline: none; cursor: pointer; }
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

        {/* 4-column panel layout */}
        <div style={styles.panels}>

          {/* COL 1: Units + Score stacked */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={styles.unitsPanel} className="fade-up">
              <UnitsTracker selectedMods={selectedMods} />
            </div>
            <div style={{ ...styles.unitsPanel, flex: "1 1 auto" }} className="fade-up">
              <ScorePanel scoreData={scoreData} autoResults={autoResults} selectedResult={selectedResult} mode={mode} />
            </div>
          </div>

          {/* COL 2: Modules */}
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
                        {m.credits != null && (
                          <span style={{ fontSize: 11, color: "#475569", fontWeight: 600, flexShrink: 0 }}>{m.credits} MC</span>
                        )}
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
                  <div key={m.code} style={{ padding: "10px 12px", borderRadius: 9, background: m.color.bg, border: "1px solid " + m.color.border }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: mode === "manual" ? 8 : 0 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: m.color.text }}>
                          {m.code}
                          {m.credits != null && (
                            <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 600, color: m.color.border, opacity: 0.8 }}>{m.credits} MC</span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: m.color.border, marginTop: 1 }}>{m.title}</div>
                      </div>
                      <button onClick={() => removeMod(m.code)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "2px 4px" }}>×</button>
                    </div>
                    {mode === "manual" && Object.entries(m.grouped || {}).map(([type, classNos]) => (
                      <div key={type} style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: 11, color: m.color.text, fontWeight: 600, marginBottom: 2 }}>{type}</div>
                        <select
                          className="slot-select"
                          value={selections[m.code]?.[type] || Object.keys(classNos)[0]}
                          onChange={(e) => handleSelectionChange(m.code, type, e.target.value)}
                        >
                          {Object.entries(classNos).map(([classNo, slots]) => {
                            const label = slots.map(s => `[${classNo}] ${s.day} ${s.start_time}–${s.end_time}`).join(", ");
                            return <option key={classNo} value={classNo}>{label}</option>;
                          })}
                        </select>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {loadingMod && <div style={{ fontSize: 12, color: "#2563EB", marginTop: 8 }}>Loading {loadingMod}...</div>}

            <div style={{ marginTop: "auto", paddingTop: 20 }}>
              <div style={{ display: "flex", gap: 4, background: "#0f1929", borderRadius: 10, padding: 4, marginBottom: 10 }}>
                <button className={"mode-tab" + (mode === "manual" ? " active" : "")} onClick={() => setMode("manual")}>Manual</button>
                <button className={"mode-tab" + (mode === "auto" ? " active" : "")} onClick={() => setMode("auto")}>Auto-Generate</button>
              </div>
              {mode === "manual" ? (
                <>
                  <button className="tb-genbtn" onClick={generate} disabled={generating || selectedMods.length === 0}>
                    {generating ? "Generating..." : "Generate Timetable"}
                  </button>
                  {schedule && (
                    <button className="tb-genbtn" onClick={saveSchedule} style={{ marginTop: 8, background: "#10b981" }}>
                      Save Timetable
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button className="tb-autobtn" onClick={autoGenerate} disabled={autoGenerating || selectedMods.length === 0}>
                    {autoGenerating ? "Searching combinations..." : "Auto-Generate for Me"}
                  </button>
                  {autoResults.length > 0 && (
                    <button className="tb-autobtn" onClick={saveSchedule} style={{ marginTop: 8, background: "#10b981" }}>
                      Save Option {selectedResult + 1}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* COL 3: Filters */}
          <div style={styles.rightPanel} className="fade-up">
            <div style={styles.panelTitle}>Filters</div>

            <div style={{ ...styles.fg, marginBottom: 14 }}>
              <DayToggles enabledDays={enabledDays} setEnabledDays={setEnabledDays} />
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

            <div style={{ ...styles.fg, background: "#0a1220", borderRadius: 10, padding: 12, border: "1px solid #1e293b" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: freeBlock.enabled ? 12 : 0 }}>
                <div>
                  <div style={styles.fl}>No class between</div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>Block out a free window (all days)</div>
                </div>
                <div className={"tb-toggle" + (freeBlock.enabled ? " on" : "")} onClick={() => setFreeBlock((v) => ({ ...v, enabled: !v.enabled }))} />
              </div>
              {freeBlock.enabled && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <select className="time-sel" value={freeBlock.from} onChange={(e) => setFreeBlock((v) => ({ ...v, from: e.target.value }))}>
                      {TIME_OPTIONS.slice(0, -1).map((t) => <option key={t} value={t.slice(0, 2)}>{t}</option>)}
                    </select>
                    <span style={{ color: "#475569", fontSize: 12 }}>to</span>
                    <select className="time-sel" value={freeBlock.to} onChange={(e) => setFreeBlock((v) => ({ ...v, to: e.target.value }))}>
                      {TIME_OPTIONS.slice(1).map((t) => <option key={t} value={t.slice(0, 2)}>{t}</option>)}
                    </select>
                  </div>
                  {parseInt(freeBlock.from, 10) >= parseInt(freeBlock.to, 10) && (
                    <div style={{ marginTop: 8, fontSize: 11, color: "#fca5a5", background: "#3a1a1a", borderLeft: "3px solid #ef4444", borderRadius: 5, padding: "6px 10px", fontWeight: 600 }}>
                      End time must be later than start time
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ ...styles.fg, background: "#0a1220", borderRadius: 10, padding: 12, border: "1px solid #1e293b" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: maxConsec.enabled ? 12 : 0 }}>
                <div>
                  <div style={styles.fl}>Max consecutive hours</div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>Cap back-to-back class hours</div>
                </div>
                <div className={"tb-toggle" + (maxConsec.enabled ? " on" : "")} onClick={() => setMaxConsec((v) => ({ ...v, enabled: !v.enabled }))} />
              </div>
              {maxConsec.enabled && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="range" min={1} max={6} step={1} value={maxConsec.hours}
                    onChange={(e) => setMaxConsec((v) => ({ ...v, hours: parseInt(e.target.value, 10) }))}
                    style={{ flex: 1, accentColor: "#3b82f6" }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#93c5fd", minWidth: 48, textAlign: "right" }}>
                    {maxConsec.hours}h max
                  </span>
                </div>
              )}
            </div>

            <div style={{ ...styles.fg, background: "#0a1220", borderRadius: 10, padding: 12, border: "1px solid #1e293b", opacity: maxConsec.enabled ? 1 : 0.4 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: bufferHours.enabled ? 12 : 0 }}>
                <div>
                  <div style={styles.fl}>Buffer after max run</div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
                    {maxConsec.enabled ? `Free hours needed after a ${maxConsec.hours}h run` : "Enable max consecutive first"}
                  </div>
                </div>
                <div
                  className={"tb-toggle" + (bufferHours.enabled ? " on" : "")}
                  onClick={() => { if (maxConsec.enabled) setBufferHours((v) => ({ ...v, enabled: !v.enabled })); }}
                  style={{ opacity: maxConsec.enabled ? 1 : 0.4, cursor: maxConsec.enabled ? "pointer" : "not-allowed" }}
                />
              </div>
              {bufferHours.enabled && maxConsec.enabled && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="range" min={1} max={4} step={1} value={bufferHours.hours}
                    onChange={(e) => setBufferHours((v) => ({ ...v, hours: parseInt(e.target.value, 10) }))}
                    style={{ flex: 1, accentColor: "#3b82f6" }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#93c5fd", minWidth: 48, textAlign: "right" }}>
                    {bufferHours.hours}h gap
                  </span>
                </div>
              )}
            </div>

            <div style={{ ...styles.fg, marginBottom: 14 }}>
              <DayBlocksEditor dayBlocks={dayBlocks} setDayBlocks={setDayBlocks} />
            </div>

            {mode === "manual" && conflicts.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#ef4444", marginBottom: 8 }}>⚠ Issues found</div>
                {conflicts.map((c, i) => (
                  <div key={i} style={{ fontSize: 12, color: "#fca5a5", padding: "8px 10px", marginBottom: 6, background: "#3a1a1a", borderLeft: "3px solid #ef4444", borderRadius: 6 }}>{c}</div>
                ))}
              </div>
            )}

            {mode === "auto" && autoError && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#fca5a5", padding: "10px 12px", background: "#3a1a1a", borderLeft: "3px solid #ef4444", borderRadius: 8 }}>
                ⚠ {autoError}
              </div>
            )}

            {mode === "auto" && autoResults.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#10b981", marginBottom: 10 }}>
                  ✓ {autoResults.length} valid schedule{autoResults.length > 1 ? "s" : ""} found
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {autoResults.map((_, i) => (
                    <button key={i} className={"opt-btn" + (selectedResult === i ? " active" : "")} onClick={() => setSelectedResult(i)}>
                      Option {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* COL 4: Friend Match */}
          <div style={styles.friendPanel} className="fade-up">
            <FriendMatchPanel
              selectedMods={selectedMods}
              mySelectionMap={activeSelectionMap}
              userEmail={userEmail}
              dayBlocks={dayBlocks}
              enabledDays={enabledDays}
              onSwap={(modCode, lessonType, classNo) => {
                const newSelections = {
                  ...selections,
                  [modCode]: { ...(selections[modCode] || {}), [lessonType]: classNo },
                };
                setSelections(newSelections);
                setMode("manual");
                generateWithSelections(newSelections);
              }}
            />
          </div>

        </div>

        {/* Timetable */}
        {activeGrid ? (
          <div style={styles.ttCard} className="fade-up">
            <div style={styles.ttHeader}>
              <span style={styles.ttTitle}>
                {mode === "auto" ? `Auto Schedule — Option ${selectedResult + 1}` : "Generated Schedule"}
              </span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                {selectedMods.map((m) => (
                  <span key={m.code} style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: m.color.bg, color: m.color.text, border: "1px solid " + m.color.border }}>{m.code}</span>
                ))}
                {Object.values(dayBlocks).some(arr => arr.length > 0) && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: BLOCK_COLOR.bg, color: BLOCK_COLOR.text, border: "1px solid " + BLOCK_COLOR.border }}>Personal blocks</span>
                )}
                {DAYS.some((d) => !enabledDays[d]) && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#1a1215", color: "#64748b", border: "1px solid #2a2030" }}>
                    {DAYS.filter((d) => !enabledDays[d]).map((d) => DAY_SHORT[DAYS.indexOf(d)]).join(", ")} off
                  </span>
                )}
              </div>
            </div>
            {renderTimetable(activeGrid)}
          </div>
        ) : (
          <div style={styles.placeholder}>
            <div style={{ fontSize: 14, color: "#475569", fontWeight: 600 }}>Your timetable will appear here</div>
            <div style={{ fontSize: 12, color: "#334155", marginTop: 4 }}>
              {mode === "auto" ? "Select modules, set filters, then click Auto-Generate" : "Select modules and click Generate"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", position: "relative" },
  bg: { position: "fixed", inset: 0, background: "linear-gradient(135deg,#060d1a 0%,#0a1628 50%,#060d1a 100%)", zIndex: 0 },
  page: { position: "relative", zIndex: 1, maxWidth: 1600, margin: "0 auto", padding: "24px 24px 48px" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 },
  logoIcon: { width: 36, height: 36, background: "#0f1929", border: "1px solid #1e3a5f", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" },
  panels: { display: "grid", gridTemplateColumns: "200px 1fr 260px 260px", gap: 16, marginBottom: 20 },
  unitsPanel: { background: "#080d16", border: "1px solid #1e293b", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column" },
  leftPanel: { background: "#080d16", border: "1px solid #1e293b", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", minHeight: 380 },
  rightPanel: { background: "#080d16", border: "1px solid #1e293b", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", overflowY: "auto", maxHeight: "80vh" },
  friendPanel: { background: "#080d16", border: "1px solid #2e1a3a", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", overflowY: "auto", maxHeight: "80vh" },
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
  emptyCell: { height: 46 },
  placeholder: { border: "1px dashed #1e293b", borderRadius: 16, padding: "48px 24px", textAlign: "center" },
};