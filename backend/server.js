const BluetoothSerialPort =
  require("bluetooth-serial-port").BluetoothSerialPort;
const WebSocket = require("ws");

const btSerial = new BluetoothSerialPort();
const wss = new WebSocket.Server({ port: 8080 });

const BLUETOOTH_DEVICE_ADDRESS = "00:22:03:01:70:95";

// Connect to HC-05 Bluetooth Module
btSerial.findSerialPortChannel(
  BLUETOOTH_DEVICE_ADDRESS,
  (channel) => {
    btSerial.connect(
      BLUETOOTH_DEVICE_ADDRESS,
      channel,
      () => {
        console.log("Connected to HC-05 Bluetooth module");

        // Broadcast Bluetooth data to WebSocket clients
        btSerial.on("data", (buffer) => {
          const data = buffer.toString("utf-8");
          console.log(`Received from Bluetooth: ${data}`);

          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: "bluetooth-data", data }));
            }
          });
        });
      },
      () => {
        console.error("Failed to connect to the Bluetooth device.");
      }
    );
  },
  () => {
    console.error("Could not find serial port channel.");
  }
);

// WebSocket connection handler for frontend clients
wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  ws.on("message", (message) => {
    const { command } = JSON.parse(message);
    console.log(`Received command from client: ${command}`);

    btSerial.write(Buffer.from(command, "utf-8"), (err) => {
      if (err) {
        console.error("Error writing to Bluetooth device:", err);
      } else {
        console.log(`Sent to Bluetooth: ${command}`);
      }
    });
  });

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });
});

btSerial.on("failure", (err) => {
  console.error("Bluetooth connection failed:", err);
});

btSerial.on("closed", () => {
  console.log("Bluetooth connection closed");
});

console.log("Server is running. WebSocket listening on ws://localhost:8080");
