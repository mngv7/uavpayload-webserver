const API_URL = "http://localhost:8000"

export async function getSensorReadings() {
  const response = await fetch(`${API_URL}/sensor-readings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get sensor readings!");
  }

  return response.json();
}