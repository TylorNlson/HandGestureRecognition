class CameraCapture {
    constructor(videoElementId) {
        this.videoElement = document.getElementById(videoElementId);
    }

    async startStream() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.videoElement.srcObject = stream;
        } catch (error) {
            console.error("Error accessing the webcam:", error);
        }
    }
}

// Main function to initialize the camera capture
async function initializeCamera() {
    const camera = new CameraCapture('video');
    await camera.startStream();
}

// Optional: Placeholder for future gesture detection functionality
async function detectGestures() {
    // Placeholder for future implementation
    // This function would interact with a model to detect hand gestures in the camera feed.
}

document.addEventListener('DOMContentLoaded', () => {
    // Start the camera as soon as the document is fully loaded
    initializeCamera();
    
    // Additional logic for gesture recognition would be initiated here as well
});
