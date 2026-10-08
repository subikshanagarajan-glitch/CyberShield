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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/alerts`);
      const data = await response.json();

      setAlerts(data);
      setLoading(false);
    } catch (error) {
      console.log("Unable to fetch alerts:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    const interval = setInterval(fetchAlerts, 5000);

    return () => clearInterval(interval);
  }, []);

  const totalAlerts = alerts.length;

  const totalAttempts = alerts.reduce(
    (total, alert) => total + alert.failedAttempts,
    0
  );

  const latestAlert = alerts.length > 0 ? alerts[0] : null;

  const chartData = {
    labels: alerts.map((alert) =>
      new Date(alert.timestamp).toLocaleTimeString()
    ),

    datasets: [
      {
        label: "Failed Login Attempts",
        data: alerts.map((alert) => alert.failedAttempts),
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true
      },
      title: {
        display: true,
        text: "Brute-Force Attack Monitoring"
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="dashboard">

      {/* HEADER */}

      <header className="topbar">

        <div>
          <h1>CyberShield</h1>

          <p>
            Real-Time Security Monitoring System
          </p>
        </div>

        <div className="status">

          <span className="status-dot"></span>

          System Online

        </div>

      </header>


      {/* MAIN CONTENT */}

      <main className="content">

        <h2>Security Dashboard</h2>


        {/* STATISTICS */}

        <div className="cards">

          <div className="card">

            <div className="card-icon">
              
            </div>

            <div>

              <p>Total Alerts</p>

              <h3>
                {totalAlerts}
              </h3>

            </div>

          </div>


          <div className="card">

            <div className="card-icon">
              
            </div>

            <div>

              <p>Failed Attempts</p>

              <h3>
                {totalAttempts}
              </h3>

            </div>

          </div>


          <div className="card">

            <div className="card-icon">
              
            </div>

            <div>

              <p>Threat Status</p>

              <h3
                className={
                  totalAlerts > 0
                    ? "danger"
                    : "safe"
                }
              >
                {totalAlerts > 0
                  ? "Threat Detected"
                  : "Secure"}
              </h3>

            </div>

          </div>

        </div>


        {/* CHART */}

        <section className="chart-section">

          <h2>Attack Monitoring</h2>

          <div className="chart-container">

            {alerts.length > 0 ? (

              <Bar
                data={chartData}
                options={chartOptions}
              />

            ) : (

              <p className="no-alerts">
                No attack data available.
              </p>

            )}

          </div>

        </section>


        {/* ALERT TABLE */}

        <section className="alert-section">

          <div className="section-header">

            <h2>
              Security Alerts
            </h2>

            <button onClick={fetchAlerts}>
              Refresh
            </button>

          </div>


          {loading ? (

            <p className="loading">
              Loading alerts...
            </p>

          ) : alerts.length === 0 ? (

            <div className="no-alerts">

              <span>
                ✅
              </span>

              <p>
                No security threats detected.
              </p>

            </div>

          ) : (

            <div className="table-container">

              <table>

                <thead>

                  <tr>

                    <th>
                      Alert Type
                    </th>

                    <th>
                      Username
                    </th>

                    <th>
                      IP Address
                    </th>

                    <th>
                      Failed Attempts
                    </th>

                    <th>
                      Message
                    </th>

                    <th>
                      Time
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {alerts.map((alert) => (

                    <tr key={alert._id}>

                      <td>

                        <span className="badge">

                           {alert.alertType}

                        </span>

                      </td>


                      <td>
                        {alert.username}
                      </td>


                      <td>
                        {alert.ipAddress}
                      </td>


                      <td>

                        <strong>
                          {alert.failedAttempts}
                        </strong>

                      </td>


                      <td>
                        {alert.message}
                      </td>


                      <td>

                        {new Date(
                          alert.timestamp
                        ).toLocaleString()}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>


        {/* LATEST THREAT */}

        {latestAlert && (

          <section className="latest-alert">

            <h2>
              Latest Threat Detected
            </h2>


            <div className="threat-box">

              <div className="threat-icon">
                
              </div>


              <div>

                <h3>
                  Brute-Force Attack
                </h3>


                <p>

                  {latestAlert.failedAttempts}
                  {" "}
                  failed login attempts
                  detected within 1 minute.

                </p>


                <p>

                  <strong>
                    Source IP:
                  </strong>

                  {" "}

                  {latestAlert.ipAddress}

                </p>

              </div>

            </div>

          </section>

        )}

      </main>


      <footer>

        CyberShield Security Monitoring System © 2026

      </footer>

    </div>
  );
}

export default App;