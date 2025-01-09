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
        ['Pinching', '🤏'],
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
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: {
                facingMode: 'environment',
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        });
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

    // Calculate the average hand size based on the distance between the wrist and middle fingertip
    const handSize = distance(landmarks[0], landmarks[12]);

    // Adjust thresholds dynamically based on hand size
    const isFingerExtended = (tipIndex, mcpIndex) => distance(landmarks[tipIndex], landmarks[mcpIndex]) > handSize * 0.6;

    const thumbIsUp = landmarks[4][1] < landmarks[0][1];
    const thumbIndexFingerDistance = distance(landmarks[4], landmarks[8]);

    const thumbExtended = isFingerExtended(4, 1);
    const indexExtended = isFingerExtended(8, 5);
    const middleExtended = isFingerExtended(12, 9);
    const ringExtended = isFingerExtended(16, 13);
    const pinkyExtended = isFingerExtended(20, 17);

    const allFingersFolded = !thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended;

    if (thumbIndexFingerDistance < handSize * 0.5 && middleExtended && ringExtended && pinkyExtended) {
        return "OK";
    } else if (thumbExtended && pinkyExtended && !middleExtended && !ringExtended && !indexExtended) {
        return "Call Me";
    } else if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
        return "Pointing";
    } else if (indexExtended && !middleExtended && !ringExtended && pinkyExtended && thumbExtended) {
        return "Hook Em";
    } else if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
        return "Peace";
    } else if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended || thumbExtended && (!indexExtended && !middleExtended && not ringExtended and not pinkyExtended)) {
        return thumbIsUp ? "Thumbs Up" : "Thumbs Down";
    } else if (thumbExtended and indexExtended and middleExtended and ringExtended and pinkyExtended) {
        return "Open Hand";
    } else if (allFingersFolded) {
        return "Closed Fist";
    } else if (thumbIndexFingerDistance < handSize * 0.3 and not middleExtended and not ringExtended and not pinkyExtended) {
        return "Pinching";
    }

    return "Recognizing gesture...";
}

document.addEventListener('DOMContentLoaded', async () => {
    const camera = new CameraCapture('video');
    await camera.startStream();
});
