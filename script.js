let html5QrcodeScanner = null;
let scanHistory = JSON.parse(localStorage.getItem('qrScanHistory')) || [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    displayHistory();
    
    // File input handler
    const fileInput = document.getElementById('qr-input-file');
    fileInput.addEventListener('change', handleFileSelect);
});

// Switch between tabs
function switchTab(tab) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(t => t.classList.remove('active'));
    buttons.forEach(b => b.classList.remove('active'));
    
    if (tab === 'camera') {
        document.getElementById('camera-tab').classList.add('active');
        buttons[0].classList.add('active');
    } else {
        document.getElementById('file-tab').classList.add('active');
        buttons[1].classList.add('active');
        // Stop camera if switching away
        if (html5QrcodeScanner) {
            stopScanner();
        }
    }
}

// Start camera scanner
function startScanner() {
    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
    };
    
    html5QrcodeScanner = new Html5Qrcode("reader");
    
    html5QrcodeScanner.start(
        { facingMode: "environment" }, // Use back camera
        config,
        onScanSuccess,
        onScanError
    ).then(() => {
        document.getElementById('start-button').classList.add('hidden');
        document.getElementById('stop-button').classList.remove('hidden');
    }).catch(err => {
        console.error(`Unable to start scanning: ${err}`);
        alert(`Camera Error: ${err}`);
    });
}

// Stop camera scanner
function stopScanner() {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.stop().then(() => {
            html5QrcodeScanner.clear();
            document.getElementById('start-button').classList.remove('hidden');
            document.getElementById('stop-button').classList.add('hidden');
        }).catch(err => {
            console.error(`Unable to stop scanning: ${err}`);
        });
    }
}

// Handle successful scan
function onScanSuccess(decodedText, decodedResult) {
    // Play success sound (optional)
    playBeep();
    
    // Display result
    displayResult(decodedText);
    
    // Add to history
    addToHistory(decodedText);
    
    // Stop scanner after successful scan
    stopScanner();
}

// Handle scan errors (silent - just for debugging)
function onScanError(errorMessage) {
    // Log errors to console for debugging
    // console.log(`QR error: ${errorMessage}`);
}

// Handle file selection
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('file-preview');
        preview.innerHTML = `<img src="${e.target.result}" alt="QR Code Preview">`;
    };
    reader.readAsDataURL(file);
    
    // Scan the file
    const html5QrCode = new Html5Qrcode("reader");
    html5QrCode.scanFile(file, true)
        .then(decodedText => {
            playBeep();
            displayResult(decodedText);
            addToHistory(decodedText);
        })
        .catch(err => {
            alert(`Error scanning file: ${err}`);
        });
}

// Display scan result
function displayResult(text) {
    const resultContainer = document.getElementById('result-container');
    const resultText = document.getElementById('result-text');
    
    resultText.textContent = text;
    resultContainer.classList.remove('hidden');
    
    // Check if it's a URL and make it clickable
    if (isValidUrl(text)) {
        resultText.innerHTML = `<a href="${text}" target="_blank" style="color: #667eea;">${text}</a>`;
    }
}

// Copy result to clipboard
function copyResult() {
    const resultText = document.getElementById('result-text').textContent;
    navigator.clipboard.writeText(resultText).then(() => {
        alert('Copied to clipboard!');
    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
}

// Clear result
function clearResult() {
    document.getElementById('result-container').classList.add('hidden');
    document.getElementById('result-text').textContent = '';
}

// Add to scan history
function addToHistory(text) {
    const historyItem = {
        text: text,
        timestamp: new Date().toISOString()
    };
    
    scanHistory.unshift(historyItem);
    
    // Keep only last 10 items
    if (scanHistory.length > 10) {
        scanHistory = scanHistory.slice(0, 10);
    }
    
    localStorage.setItem('qrScanHistory', JSON.stringify(scanHistory));
    displayHistory();
}

// Display scan history
function displayHistory() {
    const historyList = document.getElementById('history-list');
    
    if (scanHistory.length === 0) {
        historyList.innerHTML = '<p style="color: #666; text-align: center;">No scan history</p>';
        return;
    }
    
    historyList.innerHTML = scanHistory.map(item => {
        const date = new Date(item.timestamp);
        const timeString = date.toLocaleTimeString();
        const dateString = date.toLocaleDateString();
        
        return `
            <div class="history-item">
                <div style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${item.text}
                </div>
                <div class="history-time">
                    ${dateString} ${timeString}
                </div>
            </div>
        `;
    }).join('');
}

// Clear history
function clearHistory() {
    if (confirm('Are you sure you want to clear all scan history?')) {
        scanHistory = [];
        localStorage.removeItem('qrScanHistory');
        displayHistory();
    }
}

// Check if string is valid URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Play beep sound (optional)
function playBeep() {
    const beep = new Audio('beep.mp3'); // Ensure you have a beep.mp3 file in your project
    beep.play().catch(err => {
        console.error('Error playing beep sound:', err);
    });
}
