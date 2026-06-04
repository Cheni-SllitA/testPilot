import ResultRow from "./ResultRow";

export default function ResultList({ results }) {
  return (
    <div className="mt-4 flex flex-col gap-3">
      {results.map((result) => (
        <ResultRow key={result.id} result={result} />
      ))}
    </div>
  );
}