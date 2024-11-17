"use client";

import React, { useEffect, useState } from "react";
import { format, addSeconds } from "date-fns";
import { Mic, Clock, Calendar, Volume2 } from "lucide-react";

export default function EnhancedBluetoothControl() {
  const [socket, setSocket] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState("voice");
  const [timerSeconds, setTimerSeconds] = useState(10);
  const [timerCommand, setTimerCommand] = useState("light on");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleCommand, setScheduleCommand] = useState("light on");
  const [state, setState] = useState("Ready for command");

  useEffect(() => {
    const ws = new WebSocket("wss://bdda-14-139-177-158.ngrok-free.app");
    setSocket(ws);
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
      setState("Listening...");
    };

    recognition.onend = () => {
      setIsListening(false);
      setState("Processing command...");
    };

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log(`Heard command: ${command}`);

      const lightOnPhrases = ["turn on the light", "light on", "lights on"];
      const lightOffPhrases = ["turn off the light", "light off", "lights off"];

      if (lightOnPhrases.some((phrase) => command.includes(phrase))) {
        sendCommand("light on");
        setState("Light turned on");
      } else if (lightOffPhrases.some((phrase) => command.includes(phrase))) {
        sendCommand("light off");
        setState("Light turned off");
      } else {
        setState("Command not recognized");
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

  const setTimer = () => {
    const targetTime = addSeconds(new Date(), timerSeconds);
    const timeoutId = setTimeout(() => {
      sendCommand(timerCommand);
      setState(`Timer executed: ${timerCommand}`);
    }, timerSeconds * 1000);

    setState(
      `Timer set for ${format(
        targetTime,
        "HH:mm:ss"
      )} to execute: ${timerCommand}`
    );
    return () => clearTimeout(timeoutId);
  };

  const scheduleDateCommand = () => {
    const targetDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    const now = new Date();
    const timeUntilExecution = targetDateTime.getTime() - now.getTime();

    if (timeUntilExecution > 0) {
      const timeoutId = setTimeout(() => {
        sendCommand(scheduleCommand);
        setState(`Scheduled command executed: ${scheduleCommand}`);
      }, timeUntilExecution);

      setState(
        `Command scheduled for ${format(
          targetDateTime,
          "yyyy-MM-dd HH:mm:ss"
        )} to execute: ${scheduleCommand}`
      );
      return () => clearTimeout(timeoutId);
    } else {
      setState(
        "Scheduled time is in the past. Please choose a future date and time."
      );
    }
  };

  return (
    <div className="container">
      <h1 className="title">Smart Voice Control</h1>
      <div className="tabs">
        <button
          className={`tab ${activeTab === "voice" ? "active" : ""}`}
          onClick={() => setActiveTab("voice")}
        >
          <Mic size={20} />
          <span>Voice</span>
        </button>
        <button
          className={`tab ${activeTab === "timer" ? "active" : ""}`}
          onClick={() => setActiveTab("timer")}
        >
          <Clock size={20} />
          <span>Timer</span>
        </button>
        <button
          className={`tab ${activeTab === "schedule" ? "active" : ""}`}
          onClick={() => setActiveTab("schedule")}
        >
          <Calendar size={20} />
          <span>Schedule</span>
        </button>
      </div>
      <div className="tab-content">
        {activeTab === "voice" && (
          <div className="voice-tab">
            <button
              className={`voice-button ${isListening ? "listening" : ""}`}
              onClick={startListening}
              disabled={isListening}
              aria-label={isListening ? "Listening" : "Start voice command"}
            >
              <Volume2 size={24} />
              <span>
                {isListening ? "Listening..." : "Start Voice Command"}
              </span>
            </button>
            <p className="voice-instruction">
              Tap the button and say "Turn on the light" or "Turn off the light"
            </p>
          </div>
        )}
        {activeTab === "timer" && (
          <div className="timer-tab">
            <div className="input-group">
              <label htmlFor="timer-seconds">Seconds:</label>
              <input
                id="timer-seconds"
                type="number"
                value={timerSeconds}
                onChange={(e) => setTimerSeconds(parseInt(e.target.value))}
                min="1"
              />
            </div>
            <div className="input-group">
              <label htmlFor="timer-command">Command:</label>
              <select
                id="timer-command"
                value={timerCommand}
                onChange={(e) => setTimerCommand(e.target.value)}
              >
                <option value="light on">Light On</option>
                <option value="light off">Light Off</option>
              </select>
            </div>
            <button className="action-button" onClick={setTimer}>
              <Clock size={20} />
              <span>Set Timer</span>
            </button>
          </div>
        )}
        {activeTab === "schedule" && (
          <div className="schedule-tab">
            <div className="input-group">
              <label htmlFor="schedule-date">Date:</label>
              <input
                id="schedule-date"
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="schedule-time">Time:</label>
              <input
                id="schedule-time"
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="schedule-command">Command:</label>
              <select
                id="schedule-command"
                value={scheduleCommand}
                onChange={(e) => setScheduleCommand(e.target.value)}
              >
                <option value="light on">Light On</option>
                <option value="light off">Light Off</option>
              </select>
            </div>
            <button className="action-button" onClick={scheduleDateCommand}>
              <Calendar size={20} />
              <span>Schedule Command</span>
            </button>
          </div>
        )}
      </div>
      <div className="data-display" aria-live="polite">
        <h3>Status</h3>
        <p>{state}</p>
      </div>
      <style jsx>{`
        .container {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Helvetica, Arial, sans-serif;
          max-width: 100%;
          padding: 20px;
          box-sizing: border-box;
          background-color: #f0f4f8;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .title {
          text-align: center;
          color: #2c3e50;
          font-size: 28px;
          margin-bottom: 20px;
        }
        .tabs {
          display: flex;
          justify-content: space-around;
          margin-bottom: 20px;
          background-color: #ffffff;
          border-radius: 12px;
          padding: 5px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .tab {
          padding: 12px;
          border: none;
          background-color: transparent;
          cursor: pointer;
          flex-grow: 1;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #7f8c8d;
          font-weight: 600;
        }
        .tab.active {
          background-color: #3498db;
          color: white;
          border-radius: 8px;
        }
        .tab span {
          margin-top: 5px;
          font-size: 12px;
        }
        .tab-content {
          background-color: #ffffff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          flex-grow: 1;
        }
        .voice-button {
          width: 100%;
          padding: 20px;
          font-size: 18px;
          background-color: #2ecc71;
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .voice-button:hover {
          background-color: #27ae60;
          transform: translateY(-2px);
        }
        .voice-button.listening {
          background-color: #e74c3c;
          animation: pulse 1.5s infinite;
        }
        .voice-instruction {
          text-align: center;
          margin-top: 15px;
          font-size: 14px;
          color: #7f8c8d;
        }
        .input-group {
          margin-bottom: 20px;
        }
        .input-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #34495e;
        }
        .input-group input,
        .input-group select {
          width: 100%;
          padding: 12px;
          border: 1px solid #bdc3c7;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s ease;
        }
        .input-group input:focus,
        .input-group select:focus {
          border-color: #3498db;
          outline: none;
        }
        .action-button {
          width: 100%;
          padding: 15px;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .action-button:hover {
          background-color: #2980b9;
          transform: translateY(-2px);
        }
        .data-display {
          margin-top: 20px;
          padding: 15px;
          background-color: #ecf0f1;
          border-radius: 8px;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .data-display h3 {
          margin-top: 0;
          color: #2c3e50;
        }
        .data-display p {
          color: #34495e;
          font-size: 16px;
        }
        @keyframes pulse {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(0.98);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @media (max-width: 600px) {
          .container {
            padding: 15px;
          }
          .title {
            font-size: 24px;
          }
          .tab span {
            font-size: 10px;
          }
          .voice-button {
            font-size: 16px;
          }
          .input-group input,
          .input-group select,
          .action-button {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
