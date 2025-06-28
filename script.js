class QRCameraScanner {
    constructor() {
        // DOM Elements
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.resultContent = document.getElementById('resultContent');
        this.copyBtn = document.getElementById('copyBtn');
        this.status = document.getElementById('status');
        
        // State
        this.stream = null;
        this.isScanning = false;

        this.bindEvents();
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startCamera());
        this.stopBtn.addEventListener('click', () => this.stopCamera());
        this.copyBtn.addEventListener('click', () => this.copyResult());
    }

    async startCamera() {
        // **IMPORTANT**: Check if running on a secure context (localhost or https)
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            this.showStatus('ERROR: Camera access requires a secure connection (HTTPS or localhost).', 'error');
            return;
        }

        this.resetUI();
        this.showStatus('Requesting camera permission...', 'info');

        try {
            // Request camera access. This is where the user gets the permission prompt.
            const constraints = { video: { facingMode: 'environment' } };
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // If permission is granted:
            this.video.srcObject = this.stream;
            this.video.onloadedmetadata = () => {
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
                this.startContinuousScanning();
            };

            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.showStatus('Camera active. Point it at a QR code.', 'success');
            
        } catch (error) {
            // If permission is denied or another error occurs:
            console.error("Camera access error:", error);
            let errorMessage = "Could not start camera.";
            if (error.name === "NotAllowedError") {
                errorMessage = "Camera permission was denied. Please enable it in your browser settings.";
            } else if (error.name === "NotFoundError") {
                errorMessage = "No camera was found on this device.";
            }
            this.showStatus(errorMessage, 'error');
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        this.isScanning = false;
        this.video.srcObject = null;
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.showStatus('Camera stopped.', 'info');
        this.resetUI();
    }

    startContinuousScanning() {
        this.isScanning = true;
        requestAnimationFrame(this.scanFrame.bind(this));
    }

    scanFrame() {
        if (!this.isScanning) return;

        if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                // When a code is found, stop scanning and show the result
                this.isScanning = false;
                this.displayResult(code.data);
                this.stopBtn.disabled = true; // No need to stop manually after a find
            }
        }
        
        // Continue scanning if no code was found
        if (this.isScanning) {
            requestAnimationFrame(this.scanFrame.bind(this));
        }
    }
    
    displayResult(data) {
        this.resultContent.innerHTML = ''; // Clear previous
        const resultElement = document.createElement('a');
        resultElement.textContent = data;
        resultElement.className = 'qr-result';
        
        // Make the result a clickable link if it's a valid URL
        try {
            new URL(data);
            resultElement.href = data;
            resultElement.target = '_blank';
            resultElement.rel = 'noopener noreferrer';
        } catch (_) { /* Not a valid URL, do nothing */ }
        
        this.resultContent.appendChild(resultElement);
        this.copyBtn.style.display = 'inline-block';
        this.showStatus('QR Code Detected!', 'success');
    }

    async copyResult() {
        const textToCopy = this.resultContent.querySelector('.qr-result').textContent;
        try {
            await navigator.clipboard.writeText(textToCopy);
            this.showStatus('Result copied to clipboard!', 'success');
        } catch (err) {
            this.showStatus('Failed to copy result.', 'error');
        }
    }

    resetUI() {
        this.resultContent.innerHTML = '<p class="no-result">Camera is off. Click "Start Camera" to begin scanning.</p>';
        this.copyBtn.style.display = 'none';
        this.clearStatus();
    }
    
    showStatus(message, type) {
        this.status.textContent = message;
        this.status.className = `status-message ${type}`;
    }

    clearStatus() {
        if (!this.status.classList.contains('error')) {
            this.status.textContent = '';
            this.status.className = 'status-message';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new QRCameraScanner();
});
