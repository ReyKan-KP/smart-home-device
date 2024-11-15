import React, { useEffect, useState } from "react";

export default function BluetoothControlWithVoice() {
  const [socket, setSocket] = useState(null);
  const [receivedData, setReceivedData] = useState("");
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const ws = new WebSocket("wss://68db-61-1-175-163.ngrok-free.app");
    setSocket(ws);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "bluetooth-data") {
        setReceivedData(message.data);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      console.log("Voice recognition started. Speak into the microphone.");
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log("Voice recognition stopped.");
    };

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log(`Heard command: ${command}`);

      const lightOnPhrases = [
        "please turn on the light",
        "please turn on light",
        "turn on the light",
        "turn on light",
        "light on",
        "please lights on",
        "turn on lights",
      ];
      const lightOffPhrases = [
        "please turn off the light",
        "please turn off light",
        "turn off the light",
        "turn off light",
        "light off",
        "please lights off",
        "turn off lights",
      ];

      if (lightOnPhrases.some((phrase) => command.includes(phrase))) {
        sendCommand("light on");
      } else if (lightOffPhrases.some((phrase) => command.includes(phrase))) {
        sendCommand("light off");
      } else {
        console.log("Command not recognized.");
      }
    };

    recognition.start();
  };

  const sendCommand = (command) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ command }));
      console.log(`Sent command to server: ${command}`);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Bluetooth Control with Voice Commands</h1>
      <button
        className={`voice-button ${isListening ? "listening" : ""}`}
        onClick={startListening}
        disabled={isListening}
      >
        {isListening ? "Listening..." : "Start Voice Command"}
      </button>
      <p className="data-display">
        Data from HC-05: <span>{receivedData}</span>
      </p>
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
          background-color: #f0f4f8;
          font-family: Arial, sans-serif;
        }
        .title {
          color: #2c3e50;
          text-align: center;
          margin-bottom: 30px;
          font-size: 24px;
        }
        .voice-button {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 15px 30px;
          font-size: 18px;
          border-radius: 50px;
          cursor: pointer;
          transition: background-color 0.3s, transform 0.1s;
          outline: none;
        }
        .voice-button:hover {
          background-color: #2980b9;
        }
        .voice-button:active {
          transform: scale(0.98);
        }
        .voice-button.listening {
          background-color: #e74c3c;
          animation: pulse 1.5s infinite;
        }
        .voice-button:disabled {
          background-color: #bdc3c7;
          cursor: not-allowed;
        }
        .data-display {
          margin-top: 30px;
          padding: 15px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          text-align: center;
          font-size: 16px;
        }
        .data-display span {
          font-weight: bold;
          color: #2c3e50;
        }
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(231, 76, 60, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(231, 76, 60, 0);
          }
        }
        @media (max-width: 600px) {
          .title {
            font-size: 20px;
          }
          .voice-button {
            font-size: 16px;
            padding: 12px 24px;
          }
          .data-display {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
