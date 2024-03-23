class CameraCapture {
    constructor(videoElementId) {
        this.videoElement = document.getElementById(videoElementId);
        this.model = null;
    }

    async startStream() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.videoElement.srcObject = stream;
            this.loadHandposeModel();
        } catch (error) {
            console.error("Error accessing the webcam:", error);
        }
    }

    async loadHandposeModel() {
        this.model = await handpose.load();
        console.log('Handpose model loaded.');
        this.detectHandSign();
    }
         //Update for two hands
    async detectHandSign() {
        // Loop to continuously detect hand signs
        setInterval(async () => {
            const predictions = await this.model.estimateHands(this.videoElement);
            if (predictions.length > 0) {
                // Interpret the gesture for each hand
                predictions.forEach((prediction, index) => {
                    const gesture = this.interpretGesture(prediction.landmarks, index);
                    this.updateLatestHandSign(gesture, index); // Display interpreted gesture instead of raw data
                });
            } else {
                // No hands detected, update with appropriate message
                this.updateLatestHandSign('No hand detected', 0);
                this.updateLatestHandSign('No hand detected', 1); // Update for second hand
            }
        }, 100); // Run detection every 100 milliseconds
    }



    interpretGesture(landmarks,handIndex) {
        const distance = (point1, point2) => {
            return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2) + Math.pow(point1[2] - point2[2], 2));
        };
    
        // Helper function to determine if a finger is extended
        const isFingerExtended = (tipIndex, mcpIndex) => distance(landmarks[tipIndex], landmarks[mcpIndex]) > 50; // Example threshold
    
        // Checking thumb orientation for "Thumbs Up" vs. "Thumbs Down"
        const thumbIsUp = landmarks[4][1] < landmarks[2][1]; // If thumb tip is higher (y is lower) than its MCP joint
    
        // Check for specific gestures
        const thumbExtended = isFingerExtended(4, 0); // Checking if the thumb is extended
        const indexExtended = isFingerExtended(8, 5);
        const middleExtended = isFingerExtended(12, 9);
        const ringExtended = isFingerExtended(16, 13);
        const pinkyExtended = isFingerExtended(20, 17);
        
        const allFingersFolded = !thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended;
        if (thumbExtended && indexExtended && middleExtended && ringExtended && pinkyExtended) {
            return "Open Hand";
        } else if (allFingersFolded) {
            // Separate section for Closed Fist as requested
            return "Closed Fist";
        } else if (indexExtended && !middleExtended && !ringExtended && pinkyExtended) {
            return "Hook 'Em";
        }else {
            // Adjusted to include "Love", "Hook 'Em", and other specific gestures with distinct conditions
            if (thumbExtended) { 
        // Thumbs Up or Thumbs Down
                if (thumbIsUp && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
                    return "Thumbs Up";
                } else if (!thumbIsUp && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
                    return "Thumbs Down";
                }

                // Love Sign
                if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
                    return "Peace";
                }
                
            }
       
        // Default to Closed Fist if no other gesture matches
        return "Recognizing gesture...";
        }
    }

    updateLatestHandSign(handSign) {
        const latestHandSignElement = document.getElementById('latestHandSign');
        latestHandSignElement.textContent = handSign; // Update with the latest hand sign or message
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const camera = new CameraCapture('video');
    await camera.startStream();
});