const WebSocket = require("ws");
const bluetoothSerialPort =
  require("bluetooth-serial-port").BluetoothSerialPort;

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Create Bluetooth Serial Port instance
const btSerial = new bluetoothSerialPort();

// Handle device discovery and connection
btSerial.on("found", function (address, name) {
  console.log("Found device: " + name + " (" + address + ")");

  // Try to connect to the first available Bluetooth device
  btSerial.connect(
    address,
    1,
    function () {
      console.log("Connected to device");

      // Read data from the Bluetooth connection
      btSerial.on("data", function (buffer) {
        const command = buffer.toString("utf-8");
        console.log("Received command from Bluetooth: " + command);

        // Forward command to WebSocket clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({ type: "bluetooth-data", data: command })
            );
          }
        });
      });
    },
    function (error) {
      console.error("Failed to connect to device:", error);
      // Log error message to debug the issue
      console.log("Error details:", error);
    }
  );
});

// Start scanning for Bluetooth devices
btSerial.inquire();

// Handle WebSocket connections from the frontend
wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  ws.on("message", (message) => {
    console.log("Received from client: " + message);
    // Handle commands from frontend if needed
  });

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });
});

console.log("WebSocket server is running on ws://localhost:8080");
