# Smart Home Device

This project enables controlling smart devices like lights and sockets using voice commands. It also includes timer and scheduling functionality to control devices at specific times. The system uses WebSockets for real-time communication between the frontend and backend, Arduino for interfacing with the hardware, and the HC05 Bluetooth module for wireless communication.

## Table of Contents
- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Frontend Setup](#frontend-setup)
- [Backend Setup](#backend-setup)
- [Arduino Setup](#arduino-setup)
- [Usage](#usage)
- [Commands](#commands)
- [License](#license)

## Introduction

The Smart Voice Control System is a web-based solution where users can control smart devices (like lights and sockets) through voice commands. The application also provides options to set timers and schedule commands at specific times. The frontend is built using React and WebSocket, while the backend is powered by Node.js and communicates with Arduino via the HC05 Bluetooth module.

## Prerequisites

To run this project, you will need the following:
- Node.js installed on your machine.
- React development environment set up (with `npm` or `yarn`).
- Arduino IDE installed on your machine for uploading code to the Arduino.
- HC05 Bluetooth module connected to your system.
- A working Bluetooth device for communication with Arduino.

## Frontend Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ReyKan-KP/smart-home-device.git
   cd smart-home-device
   ```

2. **Install dependencies:**

   Make sure you have `npm` installed. Then, run the following command to install necessary dependencies:

   ```bash
   npm install
   ```

3. **Run the application:**

   After installing dependencies, start the React development server:

   ```bash
   npm start
   ```

   This will start the frontend on `http://localhost:3000`.

4. **Set up WebSocket connection:**

   In the `App.js` file, ensure that the WebSocket URL points to your server. The current URL is a placeholder:

   ```js
   const ws = new WebSocket("wss://your-websocket-server-url");
   ```

   Replace `your-websocket-server-url` with the actual server URL or localhost if testing locally.

## Backend Setup

1. **Connect your laptop to the HC05 Bluetooth module:**

   - Ensure that the HC05 Bluetooth module is powered on and paired with your laptop or PC.
   - You will need to find the MAC address of your HC05 Bluetooth module. You can typically do this through the Bluetooth settings or by using an AT command from a serial terminal.

2. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/smart-voice-control.git
   cd smart-voice-control
   cd backend
   ```

3. **Update the HC05 MAC address:**

   In the `server.js` file of the backend, locate the section where the MAC address of the HC05 Bluetooth module is defined. Update it with the correct MAC address:

   ```js
   const hc05MacAddress = "XX:XX:XX:XX:XX:XX"; // Replace with your HC05 MAC address
   ```

4. **Install dependencies:**

   You will need to install the required packages for the backend:

   ```bash
   npm install
   ```

5. **Run the server:**

   Once everything is set up, start the backend server:

   ```bash
   node server.js
   ```

   The server will now be running and listening for connections on the specified port.

## Arduino Setup

To interact with the hardware (Arduino), you'll need to upload the provided Arduino code to your Arduino board. Here’s how:

1. **Get the code:**

   Navigate to the Arduino directory:

   ```bash
   cd arduino
   ```

   Inside the `ardinou.ino` file, copy the code provided for the Arduino.

2. **Connect your Arduino to your PC:**

   Use a USB cable to connect your Arduino board to your computer.

3. **Upload the code to the Arduino:**

   - Open the Arduino IDE.
   - Paste the copied code into the Arduino IDE.
   - Select the correct board and port in the IDE.
   - Verify the code by clicking the checkmark button.
   - Upload the code to the Arduino board by clicking the upload button.

   Once the code is uploaded, the Arduino will be ready to receive commands via Bluetooth.

## Usage

After setting up both the frontend and backend, you can start using the system by opening the frontend in your browser and interacting with the app.

1. **Voice Commands:**

   - Tap the "Start Voice Command" button.
   - Say commands like:
     - "Turn on the light"
     - "Turn off the light"
     - "Turn on the socket"
     - "Turn off the socket"

   The app will process the voice commands and send the corresponding action to the backend, which will communicate with the Arduino to control the devices.

2. **Timer:**

   - In the Timer tab, set the desired time in seconds.
   - Choose the command (e.g., "Light On", "Socket Off").
   - Click the "Set Timer" button to initiate a countdown. The system will execute the selected command after the timer expires.

3. **Scheduling:**

   - In the Schedule tab, specify the date and time for the command.
   - Select the desired command and click "Schedule".
   - The system will execute the command at the scheduled time.

## Commands

Here are the supported voice commands:

- **Light Commands:**
  - "Turn on the light"
  - "Turn off the light"
  - "Light on"
  - "Light off"

- **Socket Commands:**
  - "Turn on the socket"
  - "Turn off the socket"
  - "Socket on"
  - "Socket off"

- **Timer Command:**
  - "Set timer"
  - "Start timer"


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
