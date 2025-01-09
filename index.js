// Adjust video constraints for mobile devices
const constraints = {
    video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user"
    }
};

// Check for touch support
if ('ontouchstart' in window) {
    // Implement touch-specific functionality
}
