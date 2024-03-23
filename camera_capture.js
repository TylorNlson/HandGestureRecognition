class CameraCapture {
    constructor(videoElementId) {
      this.videoElement = document.getElementById(videoElementId);
      this.stream = null; // To hold the stream object
    }
  
    // Starts the video stream from the webcam
    async startStream() {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
        this.videoElement.srcObject = this.stream;
        this.videoElement.play(); // Begin playing the video stream
      } catch (err) {
        console.error("Error accessing the webcam: ", err);
      }
    }
  
    // Stops the video stream and releases the webcam
    stopStream() {
      if (!this.stream) {
        console.log("No stream found.");
        return;
      }
  
      // Stop all tracks to release the webcam
      this.stream.getTracks().forEach(track => track.stop());
      this.videoElement.pause();
      this.videoElement.srcObject = null; // Clear the video source
      this.stream = null;
    }
  }
