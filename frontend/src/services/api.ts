const API_URL = "http://localhost:5000"

interface websocketParams {
  serverAddress: string,
  socketNumber: string
}

export async function getSensorReadings() {
  const response = await fetch(`${API_URL}/sensor/readings`, {
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

export async function connectToWebsocket({ serverAddress, socketNumber }: websocketParams) {
  const response = await fetch(`${API_URL}/ws/connect`, {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json'
      },
      body: JSON.stringify({
      serverAddress,
      socketNumber})
  });

  if (!response.ok) {
    throw new Error("Failed to connect to websocket!");
  }

  return response.json();
}