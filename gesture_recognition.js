class GestureRecognition {
    constructor(videoElement) {
        this.videoElement = videoElement;
        this.model = null;
    }

    async loadModel() {
        this.model = await handpose.load();
        console.log("Handpose model loaded.");
    }

    async detectHands() {
        if (!this.model) {
            console.error("Model not loaded, make sure to call loadModel() first.");
            return;
        }

        // Corrected call to estimate hands
        const predictions = await this.model.estimateHands(this.videoElement);
        if (predictions.length > 0) {
            console.log(predictions); // Debugging: log predictions to see raw output
            const gesture = this.interpretHandGesture(predictions[0].landmarks);
            this.postMessage(gesture);
        } else {
            console.log("No hands detected.");
        }
    }


    interpretHandGesture(landmarks) {
        // Define indices for fingertips and palm base in the landmarks array
        const palmBase = landmarks[0];
        const thumbTip = landmarks[4];
        const indexFingerTip = landmarks[8];
        const pinkyTip = landmarks[20];

        // Euclidean distance between two points
        const distance = (point1, point2) => {
            return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2) + Math.pow(point1[2] - point2[2], 2));
        };

        // Average distance of index and pinky tips from the palm base
        const averageDistance = (distance(palmBase, indexFingerTip) + distance(palmBase, pinkyTip)) / 2;

        // Detecting gestures based on the distances
        if (averageDistance > 100) { // Threshold value, adjust based on your testing
            return "Open Hand";
        } else if (distance(palmBase, thumbTip) > 100 && averageDistance < 100) { // Thumbs-up, adjust threshold as needed
            return "Thumbs-Up";
        } else {
            return "Closed Fist";
        }
    }

    // calculateDistance(point1, point2) {
    //     // Calculate Euclidean distance between two points
    //     const [x1, y1, z1] = point1;
    //     const [x2, y2, z2] = point2;
    //     return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
    // }

    postMessage(message) {
        const messagesDiv = document.getElementById('messages');
        const messageP = document.createElement('p');
        messageP.textContent = message;
        messagesDiv.appendChild(messageP);

        // Auto-scroll to the bottom of the chat section
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
}

// Assuming your video element and TensorFlow.js scripts are correctly initialized and loaded
document.addEventListener('DOMContentLoaded', async () => {
    const videoElement = document.getElementById('video');
    
    // Camera setup
    const camera = new CameraCapture('video');
    await camera.startStream();

    // Gesture recognition
    const gestureRecognizer = new GestureRecognition(videoElement);
    await gestureRecognizer.loadModel();

    // Start detecting hands at an interval
    setInterval(async () => {
        await gestureRecognizer.detectHands();
    }, 100); // Adjust the interval for performance and accuracy
});