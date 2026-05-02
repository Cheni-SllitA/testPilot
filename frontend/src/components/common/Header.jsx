export default function Header({ running, done }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 19,
            fontWeight: 700,
            fontStyle: "italic",
          }}
        >
          testpilot
        </div>

        <div
          style={{
            fontSize: 10,
            color: "#a8a29e",
          }}
        >
          AI-powered localhost QA agent
        </div>
      </div>

      <div>{running ? "Running" : done ? "Complete" : "Ready"}</div>
    </div>
  );
}