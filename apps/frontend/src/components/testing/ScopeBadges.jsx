const scopes = [
  "UI",
  "Accessibility",
  "Forms",
  "Performance",
  "Navigation",
];

export default function ScopeBadges() {
  return (
    <div className="flex flex-wrap gap-2">
      {scopes.map((scope) => (
        <div
          key={scope}
          className="rounded-full border border-stone-300 px-3 py-1 text-xs"
        >
          {scope}
        </div>
      ))}
    </div>
  );
}