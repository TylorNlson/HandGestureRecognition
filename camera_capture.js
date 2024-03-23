class CameraCapture {   

    handEmojisMap = new Map([
        ['Waving Hand', '👋'],
        ['Open Hand', '✋'],
        ['OK', '👌'],
        ['Peace', '✌️'],
        ['Crossed Fingers', '🤞'],
        ['Love-You Gesture', '🤟'],
        ['Hook Em', '🤘'],
        ['Call Me', '🤙'],
        ['Backhand Index Pointing Left', '👈'],
        ['Pointing', '👉'],
        ['Backhand Index Pointing Up', '👆'],
        ['Backhand Index Pointing Down', '👇'],
        ['Index Pointing Up', '☝️'],
        ['Thumbs Up', '👍'],
        ['Thumbs Down', '👎'],
        ['Raised Fist', '✊'],
        ['Closed Fist', '👊'],
        ['Open Hand', '🤚'],
        ['Pinching Hand', '🤏'],
        ['Clapping Hands', '👏'],
        ['Open Hands', '👐'],
        ['Raising Hands', '🙌'],
        ['Palms Up Together', '🤲'],
        ['Folded Hands', '🙏'],
        ['Writing Hand', '✍️'],
        ['Flexed Biceps', '💪']
    ]); 

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



    interpretGesture(landmarks, handIndex) {
        const distance = (point1, point2) => {
            return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2) + Math.pow(point1[2] - point2[2], 2));
        };
    
        // Determines if a finger is extended based on the distance between fingertips and the MCP joint
        const isFingerExtended = (tipIndex, mcpIndex) => distance(landmarks[tipIndex], landmarks[mcpIndex]) > 60; // Adjust threshold based on observation
    
        // Use the y-coordinate to determine if the thumb is higher than the MCP joint for thumb orientation
        const thumbIsUp = landmarks[4][1] < landmarks[0][1]; 
    
        // Calculate distances for gesture recognition
        const thumbIndexDistance = distance(landmarks[4], landmarks[8]);
        
        // Determine if each finger is extended
        const thumbExtended = isFingerExtended(4, 1);
        const indexExtended = isFingerExtended(8, 5);
        const middleExtended = isFingerExtended(12, 9);
        const ringExtended = isFingerExtended(16, 13);
        const pinkyExtended = isFingerExtended(20, 17);
        
        const allFingersFolded = !thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended;
    
        // OK Gesture - Thumb and index touch while other fingers extended
        if (thumbIndexDistance < 50 && middleExtended && ringExtended && pinkyExtended) {
            return "OK";
        }
        // Call Me Gesture - Thumb and pinky extended, others folded
        else if (thumbExtended && pinkyExtended && !middleExtended && !ringExtended && !indexExtended) {
            return "Call Me";
        }
        // Pointing Gesture - Only index extended
        else if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
            return "Pointing";
        }
        // Hook 'Em - Index and pinky extended, others folded
        else if (indexExtended && !middleExtended && !ringExtended && pinkyExtended && thumbExtended) {
            return "Hook Em";
        }
        // Peace or Love Gesture - Index and middle extended, others folded, with thumb orientation considered for Love
        else if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
            return "Peace";
        }
        // Thumbs Up or Thumbs Down - Based on thumb orientation
        else if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended || thumbExtended && (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended)) {
            return thumbIsUp ? "Thumbs Up" : "Thumbs Down";
        }
        // Open Hand - All fingers extended
        else if (thumbExtended && indexExtended && middleExtended && ringExtended && pinkyExtended) {
            return "Open Hand";
        }
        // Closed Fist - All fingers folded
        else if (allFingersFolded) {
            return "Closed Fist";
        }
        // Default to recognizing gesture if no other matches
        return "Recognizing gesture...";
    }

    updateLatestHandSign(handSign) {
        const latestHandSignElement = document.getElementById('latestHandSign');
        latestHandSignElement.textContent = handSign + ": " + this.handEmojisMap.get(handSign); // Update with the latest hand sign or message
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const camera = new CameraCapture('video');
    await camera.startStream();
});