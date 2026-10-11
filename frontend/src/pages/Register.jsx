
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", { name, email, password });

      navigate("/login", {
        replace: true,
        state: { message: "Account created. Please sign in." },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.logo}>S</div>
        <p style={styles.eyebrow}>SECUREDEPLOY / GET STARTED</p>
        <h1 style={styles.heading}>Create account</h1>
        <p style={styles.subheading}>
          Register to access the SecureDeploy dashboard.
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label} htmlFor="name">Full name</label>
        <input
          id="name"
          autoComplete="name"
          required
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          style={styles.input}
        />

        <label style={styles.label} htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={styles.input}
        />

        <label style={styles.label} htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          style={styles.input}
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p style={styles.footer}>
          Already registered? <Link to="/login">Sign in</Link>
        </p>
        <p style={styles.note}>
          New accounts receive the standard Employee role.
        </p>
      </form>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
    background: "linear-gradient(135deg, #0b1020, #171d3a)",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    boxSizing: "border-box",
    padding: 36,
    borderRadius: 18,
    background: "#ffffff",
    boxShadow: "0 24px 70px rgba(0,0,0,.3)",
  },
  logo: {
    width: 44,
    height: 44,
    display: "grid",
    placeItems: "center",
    borderRadius: 12,
    background: "#7161ff",
    color: "white",
    fontSize: 24,
    fontWeight: 700,
  },
  eyebrow: {
    marginTop: 24,
    color: "#7161ff",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.5,
  },
  heading: { marginBottom: 8, color: "#151b2c", fontSize: 30 },
  subheading: { marginBottom: 24, color: "#737b8d", lineHeight: 1.6 },
  label: {
    display: "block",
    marginBottom: 8,
    color: "#30384b",
    fontSize: 13,
    fontWeight: 600,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    marginBottom: 18,
    border: "1px solid #dce0ea",
    borderRadius: 9,
    fontSize: 14,
  },
  button: {
    width: "100%",
    padding: 14,
    border: 0,
    borderRadius: 9,
    background: "#7161ff",
    color: "white",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  error: {
    padding: 12,
    marginBottom: 18,
    borderRadius: 8,
    background: "#fff0f0",
    color: "#bd2525",
    fontSize: 13,
  },
  footer: {
    marginTop: 24,
    textAlign: "center",
    color: "#737b8d",
    fontSize: 13,
  },
  note: {
    textAlign: "center",
    color: "#737b8d",
    fontSize: 12,
  },
};
