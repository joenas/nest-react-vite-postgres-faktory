import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "var(--bg)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          // Responsive: reduce padding on small screens
          padding: "clamp(1rem, 4vw, 2rem)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          backgroundColor: "var(--surface)",
          color: "var(--text)",
        }}
      >
        <h2 style={{ marginBottom: "1.5rem", textAlign: "center" }}>App</h2>
        <button
          type="button"
          onClick={() => login("/")}
          style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "var(--link)",
            color: "var(--primary-contrast)",
            border: "none",
            borderRadius: "4px",
            fontSize: "1rem",
            fontWeight: "500",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}
