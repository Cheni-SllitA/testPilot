import { useState } from "react";

import ScopeBadges from "../components/testing/ScopeBadges";
import ResultList from "../components/results/ResultList";
import { downloadPageHTML } from "../services/chromeService";
import Navbar from "../components/common/Navbar";

export default function Home() {
  const [url, setUrl] = useState("http://localhost:5173");
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState("");

  const handleRun = async () => {
    if (!prompt.trim() || running) return;

    try {
      setRunning(true);
      setDone(false);


      const pageData = await downloadPageHTML();

      console.log("Page Data:", pageData);

      const response = await fetch(
        "http://localhost:8000/api/ai/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            url: pageData.url,
            title: pageData.title,
            html: pageData.html,
          }),
        }
      );

      const data = await response.json();

      console.log("API Response:", data);

      setResult(data.result);

      setDone(true);
    } catch (error) {
      console.error("Test run failed:", error);
    } finally {
      setRunning(false);
    }
  };



  return (
    <>
      <Navbar />

      <div className="relative flex min-h-screen items-center justify-center bg-stone-50 px-4 py-12">

        <div className="w-full max-w-2xl">

          <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-8">

            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-stone-900">
                Create New Test
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                Enter a website and describe what you want to test.
              </p>
            </div>


            {/* URL */}
            <div className="mb-4">

              <label className="block text-sm font-medium text-stone-700 mb-2">
                Website URL
              </label>

              <div className="flex gap-3">

                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="
                flex-1
                rounded-lg
                border
                border-stone-300
                bg-white
                px-3
                py-2.5
                text-sm
                outline-none
                transition-colors
                focus:border-stone-500
                focus:ring-2
                focus:ring-stone-500/20"
                />

                <button
                  onClick={downloadPageHTML}
                  className="
                rounded-lg
                border
                border-stone-300
                bg-stone-100
                px-4
                py-2.5
                text-sm
                font-medium
                text-stone-700
                hover:bg-stone-200"
                >
                  Download
                </button>

              </div>
            </div>


            {/* PROMPT */}
            <div className="mb-6">

              <label className="block text-sm font-medium text-stone-700 mb-2">
                Testing Instructions
              </label>

              <textarea
                rows={6}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Example:
• Test the login form
• Check validation messages
• Verify mobile responsiveness
• Test dashboard navigation`}
                className="
              w-full
              resize-none
              rounded-lg
              border
              border-stone-300
              bg-white
              px-3
              py-3
              text-sm
              outline-none
              transition-colors
              focus:border-stone-500
              focus:ring-2
              focus:ring-stone-500/20"
              />
            </div>



            {/* Scope */}
            <div className="mb-6 rounded-lg border border-stone-200 bg-stone-50 p-4">

              <h3 className="text-sm font-semibold text-stone-800 mb-3">
                Test Scope
              </h3>

              <ScopeBadges />

            </div>



            {/* Run Button */}
            <button
              onClick={handleRun}
              disabled={running}
              className="
            w-full
            rounded-lg
            bg-stone-900
            py-3
            text-sm
            font-semibold
            text-white
            transition-colors
            hover:bg-stone-800
            disabled:opacity-70"
            >
              {running ? "Running Tests..." : "Run Test"}
            </button>



            {/* Session Status */}
            <div className="mt-6 rounded-lg border border-stone-200 bg-stone-50 p-4">

              <p className="mt-3 text-sm text-stone-500">
                Status: {done ? "Done" : "—"}
              </p>

              <p className="mt-1 text-lg font-semibold text-stone-900">
                {running
                  ? "Analyzing"
                  : done
                    ? "Completed"
                    : "Waiting"}
              </p>

              <p className="mt-3 text-sm text-stone-500">
                Generated Tests: {done ? "1" : "0"}
              </p>

            </div>



            {/* Results */}
            {result && (
              <div className="mt-6 border-t border-stone-200 pt-6">
                <h2 className="text-lg font-semibold text-stone-900">AI Response</h2>
                <p className="text-sm text-stone-500 mb-4">AI-generated testing output</p>
                <pre className="mt-2 rounded-lg bg-stone-100 border border-stone-200 p-4 text-sm text-stone-700 overflow-auto whitespace-pre-wrap">
                  {result}
                </pre>
              </div>
            )}

          </div>

        </div>

      </div>
    </>
  );
}