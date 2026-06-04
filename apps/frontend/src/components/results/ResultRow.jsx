export default function ResultRow({ result }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold">{result.title}</h3>

        <span
          className={`rounded-full px-2 py-1 text-xs ${
            result.status === "pass"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {result.status}
        </span>
      </div>

      <p className="text-sm text-stone-600">{result.description}</p>
    </div>
  );
}