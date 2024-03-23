class CameraCapture {
    constructor(videoElementId) {
        this.videoElement = document.getElementById(videoElementId);
    }
  a
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
                // Display the raw prediction data for the first detected hand
                this.updateLatestHandSign(JSON.stringify(predictions[0], null, 2));
            } else {
                this.updateLatestHandSign('No hand detected');
            }
        }, 100); // Run detection every 100 milliseconds
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