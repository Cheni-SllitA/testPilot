import Tag from "./Tag";
import { STATUS_STYLES } from "../../constants/statusStyles";

export default function ResultRow({ result, index }) {
  const s = STATUS_STYLES[result.status];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderBottom: "1px solid #f1f0ed",
      }}
    >
      <Tag category={result.category} />

      <span
        style={{
          flex: 1,
          fontSize: 12,
          color: "#374151",
        }}
      >
        {result.label}
      </span>

      <span
        style={{
          fontSize: 9,
          fontWeight: 800,
          color: s.color,
          background: s.bg,
          border: `1px solid ${s.border}`,
          borderRadius: 4,
          padding: "2px 7px",
        }}
      >
        {s.label}
      </span>
    </div>
  );
}