import ResultRow from "./ResultRow";

export default function ResultList({ results, running }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #f1f0ed",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {results.map((r, i) => (
        <ResultRow key={r.id} result={r} index={i} />
      ))}

      {running && (
        <div
          style={{
            padding: "12px 14px",
            color: "#c4bfb8",
            fontSize: 12,
          }}
        >
          Analyzing next test…
        </div>
      )}
    </div>
  );
}