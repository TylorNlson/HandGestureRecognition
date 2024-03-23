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

    async detectHandSign() {
        // Loop to continuously detect hand signs
        setInterval(async () => {
            const predictions = await this.model.estimateHands(this.videoElement);
            if (predictions.length > 0) {
                // Interpret the gesture based on the model's predictions
                const gesture = this.interpretGesture(predictions[0].landmarks);
                this.updateLatestHandSign(gesture); // Display interpreted gesture instead of raw data
            } else {
                this.updateLatestHandSign('No hand detected');
            }
        }, 100); // Run detection every 100 milliseconds
    }

    interpretGesture(landmarks) {
        // Example gesture interpretation logic, needs to be expanded
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
        // Expand with additional gesture checks as needed
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