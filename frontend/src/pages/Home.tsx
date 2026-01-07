import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "2rem 1rem",
      }}
    >
      <h2 style={{ marginBottom: "0.5rem" }}>Signed in</h2>
      <p style={{ marginTop: 0 }}>
        {user?.username ? (
          <>
            You are signed in as <strong>{user.username}</strong>
            {user.role ? <> ({user.role})</> : null}.
          </>
        ) : (
          "You are signed in."
        )}
      </p>

      <button
        type="button"
        onClick={() => logout()}
        style={{
          padding: "0.75rem 1rem",
          backgroundColor: "var(--surface)",
          color: "var(--text)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}

