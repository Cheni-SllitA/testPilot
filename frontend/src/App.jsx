import { useState } from "react";

import Header from "./components/common/Header";
import ScopeBadges from "./components/testing/ScopeBadges";
import ResultList from "./components/results/ResultList";

import { MOCK_TESTS } from "./constants/mockTests";
import { downloadPageHTML } from "./services/chromeService";

export default function App() {
  const [url, setUrl] = useState("http://localhost:3000");
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState([]);

  const handleRun = () => {
    if (!prompt.trim() || running) return;

    setRunning(true);

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
    <div style={{ padding: 20 }}>
      <Header running={running} done={done} />

      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <ScopeBadges />

      <button onClick={handleRun}>
        Run Tests
      </button>

      <button onClick={downloadPageHTML}>
        Download HTML
      </button>

      {results.length > 0 && (
        <ResultList
          results={results}
          running={running}
        />
      )}
    </div>
  );
}