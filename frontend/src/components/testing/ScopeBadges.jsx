import { TEST_CATEGORIES } from "../../constants/testCategories";

export default function ScopeBadges() {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {Object.entries(TEST_CATEGORIES).map(([key, cat]) => (
        <span
          key={key}
          style={{
            fontSize: 10,
            color: cat.color,
            background: cat.color + "12",
            border: `1px solid ${cat.color}28`,
            borderRadius: 20,
            padding: "3px 9px",
          }}
        >
          {cat.icon} {cat.label}
        </span>
      ))}
    </div>
  );
}