export default function Pagination({
  page,
  setPage,
  loading,
  itemsLength,
}: {
  page: number;
  setPage: (fn: (p: number) => number) => void;
  loading: boolean;
  itemsLength: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "0.75rem",
        flexWrap: "wrap",
        alignItems: "baseline",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <button
        onClick={() => setPage((p: number) => Math.max(1, p - 1))}
        disabled={page === 1 || loading}
        style={{
          padding: "0",
          borderRadius: "4px",
          border: "none",
          backgroundColor: "transparent",
          color: "var(--link)",
          cursor: page === 1 || loading ? "not-allowed" : "pointer",
          opacity: page === 1 || loading ? 0.6 : 1,
          fontWeight: 600,
        }}
      >
        <span style={{ fontSize: "1.2rem" }}>← </span> Previous
      </button>
      <div style={{ marginTop: "0.5rem", color: "#333" }}>
        {`Page ${page} - Showing ${itemsLength} items`}
      </div>
      <button
        onClick={() => setPage((p) => p + 1)}
        disabled={loading}
        style={{
          padding: "0",
          borderRadius: "4px",
          border: "none",
          backgroundColor: "transparent",
          color: "var(--link)",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
          fontWeight: 600,
        }}
      >
        Next <span style={{ fontSize: "1.2rem" }}>→</span>
      </button>
    </div>
  );
}
