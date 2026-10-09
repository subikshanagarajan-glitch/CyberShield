
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "./App.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

function App() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedInUser, setLoggedInUser] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);

    try {
      const endpoint =
        mode === "register" ? "/api/register" : "/api/login";

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Request failed. Please try again.");
        return;
      }

      if (mode === "register") {
        setMessage("Account created successfully! Please log in.");
        setMode("login");
        setPassword("");
      } else {
        setLoggedInUser(data.username || username);
        setPassword("");
      }
    } catch {
      setError("Cannot connect to the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function fetchAlerts() {
    try {
      const response = await fetch(`${API_URL}/api/alerts`);

      if (!response.ok) {
        throw new Error("Unable to load alerts");
      }

      const data = await response.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Alert loading error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!loggedInUser) return;

    fetchAlerts();
    const timer = setInterval(fetchAlerts, 5000);

    return () => clearInterval(timer);
  }, [loggedInUser]);

  function logout() {
    setLoggedInUser("");
    setUsername("");
    setPassword("");
    setAlerts([]);
    setLoading(true);
    setMode("login");
    setError("");
    setMessage("");
  }

  if (!loggedInUser) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">🛡️</div>
          <h1>CyberShield</h1>
          <p className="auth-subtitle">
            Real-Time Security Monitoring System
          </p>

          <div className="auth-tabs">
            <button
              className={mode === "login" ? "active" : ""}
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
              }}
            >
              Login
            </button>

            <button
              className={mode === "register" ? "active" : ""}
              onClick={() => {
                setMode("register");
                setError("");
                setMessage("");
              }}
            >
              Register
            </button>
          </div>

          <h2>
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="auth-hint">
            {mode === "login"
              ? "Log in to access your security dashboard."
              : "Register to create your CyberShield account."}
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              required
              autoComplete="username"
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
            />

            {error && <p className="auth-error">{error}</p>}
            {message && <p className="auth-success">{message}</p>}

            <button
              className="auth-submit"
              type="submit"
              disabled={busy}
            >
              {busy
                ? "Please wait..."
                : mode === "login"
                  ? "Login Securely"
                  : "Create Account"}
            </button>
          </form>

          <p className="auth-footer">
            🔒 Passwords are protected with bcrypt hashing.
          </p>
        </div>
      </div>
    );
  }

  const totalAttempts = alerts.reduce(
    (total, alert) => total + Number(alert.failedAttempts || 0),
    0
  );

  const chartData = {
    labels: alerts.map((alert) =>
      new Date(alert.timestamp).toLocaleTimeString()
    ),
    datasets: [
      {
        label: "Failed Login Attempts",
        data: alerts.map((alert) => alert.failedAttempts),
        backgroundColor: "#06b6d4"
      }
    ]
  };

  return (
    <div className="dashboard">
      <header className="topbar">
        <div>
          <h1>🛡️ CyberShield</h1>
          <p>Real-Time Security Monitoring System</p>
        </div>

        <div className="header-actions">
          <span className="status">
            <span className="status-dot"></span>
            System Online
          </span>
          <span className="welcome-user">Hi, {loggedInUser}</span>
          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="content">
        <h2>Security Dashboard</h2>

        <div className="cards">
          <div className="card">
            <div className="card-icon">🔐</div>
            <div>
              <p>Total Alerts</p>
              <h3>{alerts.length}</h3>
            </div>
          </div>

          <div className="card">
            <div className="card-icon">⚡</div>
            <div>
              <p>Failed Attempts</p>
              <h3>{totalAttempts}</h3>
            </div>
          </div>

          <div className="card">
            <div className="card-icon">🛡️</div>
            <div>
              <p>Threat Status</p>
              <h3 className={alerts.length ? "danger" : "safe"}>
                {alerts.length ? "Threat Detected" : "Secure"}
              </h3>
            </div>
          </div>
        </div>

        <section className="chart-section">
          <h2>Attack Monitoring</h2>
          <div className="chart-container">
            {alerts.length ? (
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: true },
                    title: {
                      display: true,
                      text: "Brute-Force Attack Monitoring"
                    }
                  },
                  scales: { y: { beginAtZero: true } }
                }}
              />
            ) : (
              <p className="no-alerts">No attack data available.</p>
            )}
          </div>
        </section>

        <section className="alert-section">
          <div className="section-header">
            <h2>Security Alerts</h2>
            <button onClick={fetchAlerts}>Refresh</button>
          </div>

          {loading ? (
            <p>Loading alerts...</p>
          ) : alerts.length === 0 ? (
            <p className="no-alerts">No security threats detected.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Alert Type</th>
                    <th>Username</th>
                    <th>IP Address</th>
                    <th>Attempts</th>
                    <th>Message</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert) => (
                    <tr key={alert._id}>
                      <td>{alert.alertType}</td>
                      <td>{alert.username}</td>
                      <td>{alert.ipAddress}</td>
                      <td>{alert.failedAttempts}</td>
                      <td>{alert.message}</td>
                      <td>{new Date(alert.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <footer>CyberShield Security Monitoring System © 2026</footer>
    </div>
  );
}

export default App;