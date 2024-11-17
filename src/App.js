"use client";

import React, { useEffect, useState, useRef } from "react";
import { format, addSeconds } from "date-fns";
import { Mic, Clock, Calendar, Volume2, X } from "lucide-react";

export default function EnhancedSmartVoiceControl() {
  const [socket, setSocket] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState("voice");
  const [timerSeconds, setTimerSeconds] = useState(10);
  const [timerCommand, setTimerCommand] = useState("light on");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleCommand, setScheduleCommand] = useState("light on");
  const [state, setState] = useState("Ready for command");
  const [countdown, setCountdown] = useState(null);
  const [toasts, setToasts] = useState([]);

  const countdownRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket("wss://3583-14-139-177-158.ngrok-free.app");
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
      addToast(command);

      const lightOnPhrases = [
        "turn on the light",
        "light on",
        "lights on",
        "switch on the light",
        "turn the light on",
        "put the light on",
        "activate the light",
        "power on the light",
        "turn on lights",
        "enable the light",
        "can you turn on the light",
        "please turn on the light",
        "let there be light",
        "make the light bright",
        "light it up",
        "bring up the light",
        "light up the room",
        "let's have some light",
        "on with the lights",
        "illuminate the room",
        "brighten the room",
      ];

      const lightOffPhrases = [
        "turn off the light",
        "light off",
        "lights off",
        "switch off the light",
        "turn the light off",
        "put the light off",
        "deactivate the light",
        "power off the light",
        "turn off lights",
        "disable the light",
        "can you turn off the light",
        "please turn off the light",
        "kill the light",
        "shut down the light",
        "make it dark",
        "switch the light off",
        "cut the light",
        "stop the light",
        "extinguish the light",
        "darken the room",
        // Adding "of" variants
        "turn of the light",
        "light of",
        "lights of",
        "switch of the light",
        "turn the light of",
        "put the light of",
        "deactivate the light",
        "power of the light",
        "turn of lights",
        "disable the light",
      ];

      const socketOnPhrases = [
        "turn on the socket",
        "socket on",
        "plug on",
        "switch on the socket",
        "turn the socket on",
        "put the socket on",
        "activate the socket",
        "power on the socket",
        "turn on plug",
        "enable the socket",
        "switch on plug",
        "turn the plug on",
        "can you turn on the socket",
        "please turn on the socket",
        "activate the plug",
        "switch on the plug",
        "get the socket on",
        "socket power on",
        "engage the socket",
        "make the socket live",
        "plug in the socket",
      ];

      const socketOffPhrases = [
        "turn off the socket",
        "socket off",
        "plug off",
        "switch off the socket",
        "turn the socket off",
        "put the socket off",
        "deactivate the socket",
        "power off the socket",
        "turn off plug",
        "disable the socket",
        "switch off plug",
        "turn the plug off",
        "can you turn off the socket",
        "please turn off the socket",
        "deactivate the plug",
        "switch off the plug",
        "get the socket off",
        "socket power off",
        "disengage the socket",
        "make the socket dead",
        "unplug the socket",
        // Adding "of" variants
        "turn of the socket",
        "socket of",
        "plug of",
        "switch of the socket",
        "turn the socket of",
        "put the socket of",
        "deactivate the socket",
        "power of the socket",
        "turn of plug",
        "disable the socket",
      ];

      const timerPhrases = ["set timer", "start timer"];

      if (lightOnPhrases.some((phrase) => command.includes(phrase))) {
        sendCommand("light on");
        setState("Light turned on");
      } else if (lightOffPhrases.some((phrase) => command.includes(phrase))) {
        sendCommand("light off");
        setState("Light turned off");
      } else if (socketOnPhrases.some((phrase) => command.includes(phrase))) {
        sendCommand("socket on");
        setState("Socket turned on");
      } else if (socketOffPhrases.some((phrase) => command.includes(phrase))) {
        sendCommand("socket off");
        setState("Socket turned off");
      } else if (timerPhrases.some((phrase) => command.includes(phrase))) {
        const seconds = extractSeconds(command);
        if (seconds) {
          setVoiceTimer(seconds);
        } else {
          setState("Could not determine timer duration");
        }
      } else {
        setState("Command not recognized");
      }
    };

    recognition.start();
  };

  const extractSeconds = (command) => {
    const match = command.match(/(\d+)\s*(second|minute|min|sec)/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      if (unit.startsWith("min")) {
        return value * 60;
      }
      return value;
    }
    return null;
  };

  const setVoiceTimer = (seconds) => {
    setTimerSeconds(seconds);
    setTimer();
  };

  const sendCommand = (command) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ command }));
      console.log(`Sent command to server: ${command}`);
    }
  };

  const setTimer = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    const targetTime = addSeconds(new Date(), timerSeconds);
    setCountdown(timerSeconds);

    countdownRef.current = setInterval(() => {
      const now = new Date();
      const remaining = Math.round(
        (targetTime.getTime() - now.getTime()) / 1000
      );

      if (remaining <= 0) {
        clearInterval(countdownRef.current);
        setCountdown(null);
        sendCommand(timerCommand);
        setState(`Timer executed: ${timerCommand}`);
      } else {
        setCountdown(remaining);
      }
    }, 1000);

    setState(
      `Timer set for ${format(
        targetTime,
        "HH:mm:ss"
      )} to execute: ${timerCommand}`
    );
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

  const addToast = (message) => {
    const newToast = { id: Date.now(), message };
    setToasts((prevToasts) => [...prevToasts, newToast]);
    setTimeout(() => removeToast(newToast.id), 3000);
  };

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
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
              Tap the button and say "Turn on the light", "Turn off the light",
              "Turn on the socket" or "Turn off the socket".
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
                <option value="socket on">Socket On</option>
                <option value="socket off">Socket Off</option>
              </select>
            </div>
            <button className="action-button" onClick={setTimer}>
              <Clock size={20} />
              <span>Set Timer</span>
            </button>
            {countdown !== null && (
              <div className="countdown">Countdown: {countdown} seconds</div>
            )}
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
                <option value="socket on">Socket On</option>
                <option value="socket off">Socket Off</option>
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
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="toast-close"
            >
              <X size={16} />
            </button>
          </div>
        ))}
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
        .countdown {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          margin-top: 15px;
          color: #2c3e50;
        }
        .toast-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
          z-index: 1000;
        }
        .toast {
          background-color: #34495e;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-width: 200px;
        }
        .toast-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0;
          margin-left: 10px;
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
          .toast-container {
            left: 20px;
            right: 20px;
          }
          .toast {
            width: 80%;
          }
        }
      `}</style>
    </div>
  );
}
