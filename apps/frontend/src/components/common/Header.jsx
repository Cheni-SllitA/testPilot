export default function Header({ running, done }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">TestPilot</h1>
        <p className="text-sm text-stone-500">
          AI powered QA testing assistant
        </p>
      </div>

      <div className="text-sm text-stone-500">
        {running && "Running tests..."}
        {!running && done && "Completed"}
      </div>
    </div>
  );
}