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

document.addEventListener('DOMContentLoaded', async () => {
    const camera = new CameraCapture('video');
    await camera.startStream();
});