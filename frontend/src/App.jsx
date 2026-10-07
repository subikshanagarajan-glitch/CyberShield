function App() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

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
export default App;