import { useState } from "react";

import Header from "../components/common/Header";
import ScopeBadges from "../components/testing/ScopeBadges";
import ResultList from "../components/results/ResultList";

import { MOCK_TESTS } from "../constants/mockTests";
import { downloadPageHTML } from "../services/chromeService";
import Navbar from "../components/common/Navbar";

export default function Home() {
  const [url, setUrl] = useState("http://localhost:5173");
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState([]);

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

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#f5f7fb] text-slate-800">
        {/* PAGE */}
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1fr_320px]">
          {/* LEFT SIDE */}
          <div className="flex flex-col gap-6">
            {/* MAIN CARD */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-slate-900">
                  Create New Test
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter a website and describe what you want to test.
                </p>
              </div>

              <div className="flex flex-col gap-5">
                {/* URL */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Website URL
                  </label>

                  <div className="flex gap-3">
                    <input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                    <button
                      onClick={downloadPageHTML}
                      className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      Download
                    </button>
                  </div>
                </div>

                {/* PROMPT */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Testing Instructions
                  </label>

                  <textarea
                    rows={6}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Example:
• Test the login form
• Check validation messages
• Verify mobile responsiveness
• Test dashboard navigation"
                    className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* SCOPE */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        Test Scope
                      </h3>

                      <p className="text-xs text-slate-500">
                        Features included in analysis
                      </p>
                    </div>
                  </div>

                  <ScopeBadges />
                </div>

                {/* ACTION BUTTON */}
                <button
                  onClick={handleRun}
                  disabled={running}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {running ? "Running Tests..." : "Run Test"}
                </button>
              </div>
            </div>

            {/* RESULTS */}
            {results.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Results
                    </h2>

                    <p className="text-sm text-slate-500">
                      AI-generated testing output
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                    {results.length} tests
                  </div>
                </div>

                <ResultList results={results} running={running} />
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="flex flex-col gap-6">
            {/* STATUS */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                Session Status
              </h3>

              <div className="mt-4 flex flex-col gap-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Current Status</p>

                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {running ? "Analyzing" : done ? "Completed" : "Waiting"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Generated Tests</p>

                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {results.length}
                  </p>
                </div>
              </div>
            </div>

            {/* INFO */}
            <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-sm">
              <h3 className="text-lg font-semibold">AI Testing Assistant</h3>

              <p className="mt-2 text-sm leading-relaxed text-blue-100">
                Automatically analyze pages, generate test cases, detect UI
                issues, and simulate user flows.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs">
                  UI Testing
                </span>

                <span className="rounded-full bg-white/20 px-3 py-1 text-xs">
                  Automation
                </span>

                <span className="rounded-full bg-white/20 px-3 py-1 text-xs">
                  AI Analysis
                </span>
              </div>
            </div>

            {/* QUICK TIPS */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                Example Prompts
              </h3>

              <div className="mt-4 flex flex-col gap-3">
                <button className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-sm transition hover:bg-slate-100">
                  Test the login and signup flow
                </button>

                <button className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-sm transition hover:bg-slate-100">
                  Check mobile responsiveness
                </button>

                <button className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-sm transition hover:bg-slate-100">
                  Validate all forms and errors
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
