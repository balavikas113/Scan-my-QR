## QR Code Camera Scanner
A simple, modern, and responsive web application for scanning QR codes in real-time using your device's camera. This project is built with pure HTML, CSS, and JavaScript, with no backend dependencies, ensuring all processing is done securely on the client-side.



## ✨ Features
📷 Live Camera Scanning: Utilizes the getUserMedia API to access your device's camera for real-time QR code detection. It defaults to the rear-facing camera for convenience.
🔐 Secure & Private: Runs entirely in your browser. No images or data are ever sent to a server.
📱 Responsive Design: A clean UI that works seamlessly on desktop, tablet, and mobile devices.
📋 Copy to Clipboard: Easily copy the decoded QR code data with a single click.
🔗 Clickable Links: Detected URLs are automatically converted into clickable links that open in a new tab.
💡 Clear User Feedback: Provides instant status messages for camera permissions, successful scans, and potential errors.



## 🛠️ Tech Stack
HTML5: For the core application structure.
CSS3: For all styling, layout, and animations.
JavaScript (ES6+): For the application logic, written in a modern class structure.
jsQR Library: A lightweight and powerful library for decoding QR codes from image data.

## Web APIs:
navigator.mediaDevices.getUserMedia for secure camera access.
Clipboard API for the "Copy Result" functionality.
