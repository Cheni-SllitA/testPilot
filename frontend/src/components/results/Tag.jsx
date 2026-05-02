import { TEST_CATEGORIES } from "../../constants/testCategories";

export default function Tag({ category }) {
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
      }}
    >
      {cat.icon} {cat.label}
    </span>
  );
}