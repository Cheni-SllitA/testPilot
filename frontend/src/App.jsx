import { useState, useRef } from "react";

const TEST_CATEGORIES = {
  ui: { label: "UI / Visual", icon: "◈", color: "#d97706" },
  a11y: { label: "Accessibility", icon: "◎", color: "#0284c7" },
  form: { label: "Form & Interaction", icon: "◇", color: "#059669" },
};

const MOCK_TESTS = [
  {
    id: 1,
    category: "ui",
    label: "Layout renders without overflow",
    status: "pass",
  },
  {
    id: 2,
    category: "a11y",
    label: "All images have alt attributes",
    status: "pass",
  },
  {
    id: 3,
    category: "form",
    label: "Required fields show validation error on empty submit",
    status: "fail",
  },
  {
    id: 4,
    category: "a11y",
    label: "Color contrast meets WCAG AA",
    status: "warn",
  },
  {
    id: 5,
    category: "form",
    label: "Tab order follows visual flow",
    status: "pass",
  },
  {
    id: 6,
    category: "ui",
    label: "Responsive breakpoints intact at 375px",
    status: "pass",
  },
  {
    id: 7,
    category: "a11y",
    label: "Focus indicators visible on all interactive elements",
    status: "fail",
  },
];

const STATUS_STYLES = {
  pass: { color: "#059669", bg: "#f0fdf4", border: "#bbf7d0", label: "PASS" },
  fail: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", label: "FAIL" },
  warn: { color: "#d97706", bg: "#fffbeb", border: "#fde68a", label: "WARN" },
};

  const downloadPageHTML = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const response = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.documentElement.outerHTML,
  });

  const pageHTML = response[0].result;
  const blob = new Blob([pageHTML], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  console.log("Page HTML downloaded:", url);

  const a = document.createElement("a");
  a.href = url;
  a.download = "page.html";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

function Tag({ category }) {
  const cat = TEST_CATEGORIES[category];
  return (
    <span
      style={{
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: cat.color,
        background: cat.color + "14",
        border: `1px solid ${cat.color}33`,
        borderRadius: 4,
        padding: "2px 6px",
        flexShrink: 0,
        fontFamily: "inherit",
        whiteSpace: "nowrap",
      }}
    >
      {cat.icon} {cat.label}
    </span>
  );
}

function ResultRow({ result, index }) {
  const s = STATUS_STYLES[result.status];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderBottom: "1px solid #f1f0ed",
        animation: `slideIn 0.25s ease both`,
        animationDelay: `${index * 80}ms`,
      }}
    >
      <Tag category={result.category} />
      <span
        style={{ flex: 1, fontSize: 12, color: "#374151", lineHeight: 1.5 }}
      >
        {result.label}
      </span>
      <span
        style={{
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.12em",
          color: s.color,
          background: s.bg,
          border: `1px solid ${s.border}`,
          borderRadius: 4,
          padding: "2px 7px",
          flexShrink: 0,
        }}
      >
        {s.label}
      </span>
    </div>
  );
}

export default function App() {
  const [url, setUrl] = useState("http://localhost:3000");
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");

  const handleRun = () => {
    if (!prompt.trim() || running) return;
    setRunning(true);
    setDone(false);
    setResults([]);
    let i = 0;
    const interval = setInterval(() => {
      if (i < MOCK_TESTS.length) {
        setResults((prev) => [...prev, MOCK_TESTS[i]]);
        i++;
      } else {
        clearInterval(interval);
        setRunning(false);
        setDone(true);
      }
    }, 600);
  };

  const handleClear = () => {
    setResults([]);
    setPrompt("");
    setDone(false);
    setActiveFilter("all");
  };

  const filtered =
    activeFilter === "all"
      ? results
      : results.filter((r) => r.category === activeFilter);

  const passCount = results.filter((r) => r.status === "pass").length;
  const failCount = results.filter((r) => r.status === "fail").length;
  const warnCount = results.filter((r) => r.status === "warn").length;

  return (
    <div style={st.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,700;1,400&family=DM+Mono:wght@400;500&display=swap');
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, textarea:focus { outline: none; border-color: #1c1917 !important; }
        input::placeholder, textarea::placeholder { color: #c4bfb8; font-family: 'DM Mono', monospace; }
        button { cursor: pointer; transition: opacity 0.15s; }
        button:hover { opacity: 0.75; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #e5e1da; border-radius: 4px; }
      `}</style>

      {/* Header */}
      <div style={st.header}>
        <div>
          <div style={st.wordmark}>testpilot</div>
          <div style={st.tagline}>AI-powered localhost QA agent</div>
        </div>
        <div
          style={{
            ...st.statusChip,
            background: running ? "#fffbeb" : done ? "#f0fdf4" : "#f5f4f2",
            color: running ? "#d97706" : done ? "#059669" : "#a8a29e",
            border: `1px solid ${running ? "#fde68a" : done ? "#bbf7d0" : "#e5e1da"}`,
          }}
        >
          {running ? (
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  border: "1.5px solid #d97706",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              Running
            </span>
          ) : done ? (
            "✓ Complete"
          ) : (
            "Ready"
          )}
        </div>
      </div>

      <div style={st.divider} />

      {/* URL */}
      <div style={st.field}>
        <label style={st.label}>Target URL</label>
        <input
          style={st.input}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          spellCheck={false}
        />
      </div>
      <button style={{ ...st.btn, ...st.btnGhost }} onClick={downloadPageHTML}>
        ↓ Download HTML
      </button>

      {/* Prompt */}
      <div style={st.field}>
        <label style={st.label}>What should I test?</label>
        <textarea
          style={st.textarea}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Describe your scenario...\ne.g. "Check form validation and ensure the page meets accessibility standards"`}
          rows={3}
        />
      </div>

      {/* Scope badges */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Object.entries(TEST_CATEGORIES).map(([key, cat]) => (
          <span
            key={key}
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: cat.color,
              background: cat.color + "12",
              border: `1px solid ${cat.color}28`,
              borderRadius: 20,
              padding: "3px 9px",
              letterSpacing: "0.06em",
            }}
          >
            {cat.icon} {cat.label}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          style={{ ...st.btn, ...st.btnPrimary }}
          onClick={handleRun}
          disabled={running}
        >
          {running ? "Analyzing…" : "▶ Run Tests"}
        </button>
        {(results.length > 0 || prompt) && (
          <button style={{ ...st.btn, ...st.btnGhost }} onClick={handleClear}>
            Clear
          </button>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <>
          <div style={st.divider} />

          {/* Summary bar */}
          <div style={st.summary}>
            {[
              { count: passCount, color: "#059669", label: "Passed" },
              { count: failCount, color: "#dc2626", label: "Failed" },
              { count: warnCount, color: "#d97706", label: "Warnings" },
            ].map((item, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                {i > 0 && <div style={st.summaryDivider} />}
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: "'Libre Baskerville', serif",
                      fontSize: 22,
                      fontWeight: 700,
                      color: item.color,
                      lineHeight: 1,
                    }}
                  >
                    {item.count}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: "#a8a29e",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginTop: 2,
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
            <div style={{ flex: 1 }} />
            {done && (
              <span style={{ fontSize: 10, color: "#c4bfb8" }}>
                {results.length} tests
              </span>
            )}
          </div>

          {/* Filter tabs */}
          <div style={st.filterBar}>
            {[
              ["all", "All"],
              ["ui", "UI"],
              ["a11y", "A11y"],
              ["form", "Forms"],
            ].map(([key, label]) => (
              <button
                key={key}
                style={{
                  ...st.filterBtn,
                  borderBottom:
                    activeFilter === key
                      ? "2px solid #1c1917"
                      : "2px solid transparent",
                  color: activeFilter === key ? "#1c1917" : "#a8a29e",
                  fontWeight: activeFilter === key ? 600 : 400,
                }}
                onClick={() => setActiveFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Rows */}
          <div style={st.resultList}>
            {filtered.map((r, i) => (
              <ResultRow key={r.id} result={r} index={i} />
            ))}
            {running && (
              <div
                style={{
                  padding: "12px 14px",
                  color: "#c4bfb8",
                  fontSize: 12,
                  fontStyle: "italic",
                }}
              >
                Analyzing next test…
              </div>
            )}
          </div>
        </>
      )}

      <div style={st.footer}>
        testpilot · undergraduate research · {new Date().getFullYear()}
      </div>
    </div>
  );
}

const st = {
  root: {
    width: "100%",
    minHeight: "100vh",
    background: "#fafaf9",
    color: "#1c1917",
    fontFamily: "'DM Mono', monospace",
    fontSize: 12,
    padding: "20px 20px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  wordmark: {
    fontFamily: "'Libre Baskerville', Georgia, serif",
    fontSize: 19,
    fontWeight: 700,
    color: "#1c1917",
    letterSpacing: "-0.02em",
    fontStyle: "italic",
  },
  tagline: {
    fontSize: 10,
    color: "#a8a29e",
    letterSpacing: "0.04em",
    marginTop: 3,
  },
  statusChip: {
    fontSize: 10,
    fontWeight: 500,
    borderRadius: 20,
    padding: "3px 10px",
    letterSpacing: "0.04em",
    display: "flex",
    alignItems: "center",
  },
  divider: { height: 1, background: "#f1f0ed", margin: "0 -20px" },
  field: { display: "flex", flexDirection: "column", gap: 5 },
  label: {
    fontSize: 10,
    fontWeight: 500,
    color: "#78716c",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  input: {
    background: "#fff",
    border: "1px solid #e5e1da",
    borderRadius: 6,
    color: "#1c1917",
    fontFamily: "'DM Mono', monospace",
    fontSize: 12,
    padding: "8px 10px",
    transition: "border-color 0.15s",
  },
  textarea: {
    background: "#fff",
    border: "1px solid #e5e1da",
    borderRadius: 6,
    color: "#1c1917",
    fontFamily: "'DM Mono', monospace",
    fontSize: 12,
    padding: "8px 10px",
    resize: "none",
    lineHeight: 1.7,
    transition: "border-color 0.15s",
  },
  btn: {
    padding: "9px 18px",
    borderRadius: 6,
    border: "none",
    fontFamily: "'DM Mono', monospace",
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: "0.04em",
  },
  btnPrimary: { background: "#1c1917", color: "#fafaf9", flex: 1 },
  btnGhost: {
    background: "transparent",
    color: "#78716c",
    border: "1px solid #e5e1da",
  },
  summary: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    background: "#fff",
    border: "1px solid #f1f0ed",
    borderRadius: 8,
  },
  summaryDivider: { width: 1, height: 30, background: "#f1f0ed" },
  filterBar: {
    display: "flex",
    borderBottom: "1px solid #f1f0ed",
    margin: "0 -20px",
    padding: "0 14px",
  },
  filterBtn: {
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    fontFamily: "'DM Mono', monospace",
    fontSize: 10,
    letterSpacing: "0.06em",
    padding: "6px 8px 8px",
    textTransform: "uppercase",
    marginBottom: -1,
    color: "#a8a29e",
    transition: "all 0.15s",
  },
  resultList: {
    background: "#fff",
    border: "1px solid #f1f0ed",
    borderRadius: 8,
    overflow: "hidden",
    maxHeight: 240,
    overflowY: "auto",
  },
  footer: {
    textAlign: "center",
    fontSize: 9,
    color: "#d6d3cf",
    letterSpacing: "0.08em",
    marginTop: 4,
  },
};
