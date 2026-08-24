import { useEffect, useState } from "react";

import { apiClient } from "./api/client";

interface HealthResponse {
  status: string;
  database: string;
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHealth() {
      try {
        const response = await apiClient.get<HealthResponse>("/health");

        setHealth(response.data);
      } catch {
        setError("Unable to connect to the backend.");
      }
    }

    loadHealth();
  }, []);

  return (
    <main>
      <h1>Ironbark Ridge</h1>
      <p>Compliance Intelligence Dashboard</p>

      {health && (
        <p>
          API: {health.status} | Database: {health.database}
        </p>
      )}

      {error && <p>{error}</p>}
    </main>
  );
}

export default App;