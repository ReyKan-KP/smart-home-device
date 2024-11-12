const WebSocket = require("ws");

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Handle WebSocket connections from the frontend
wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  // Receive commands from the React frontend
  ws.on("message", (message) => {
    const { command } = JSON.parse(message);
    console.log(`Received command from client: ${command}`);

    // Simulate Bluetooth response (you can mock real Bluetooth responses here)
    let mockResponse = "No response";

    if (command.includes("light on")) {
      mockResponse = "Light turned ON";
    } else if (command.includes("light off")) {
      mockResponse = "Light turned OFF";
    }

    // Send the simulated response back to the frontend
    ws.send(JSON.stringify({ type: "bluetooth-data", data: mockResponse }));
  });

  // Notify when WebSocket client disconnects
  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });
});

console.log("WebSocket server is running on ws://localhost:8080");
