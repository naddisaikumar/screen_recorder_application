let video = document.querySelector("video"); // Reference to the video element
let recordBtnCont = document.querySelector(".record-btn-cont"); // Record button container
let recordBtn = document.querySelector(".record-btn"); // Actual record button
let captureBtnCont = document.querySelector(".capture-btn-cont"); // Capture button container
let captureBtn = document.querySelector(".capture-btn"); // Capture button
let muteBtn = document.querySelector(".mute-btn"); // Mute button
let transparentColor = "transparent"; // Default filter color

let recordFlag = true; // Toggle for recording state
let audioMuted = true; // Toggle for muting/unmuting audio

let recorder; // MediaRecorder object
let chunks = []; // To store video data chunks
let audioTrack; // To manage audio tracks

// Constraints for accessing audio and video
let constraints = {
    audio: true,
    video: true
};

// Get access to the user's camera and microphone
navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
        video.srcObject = stream; // Display live stream in video element
        audioTrack = stream.getAudioTracks()[0]; // Store audio track for muting/unmuting

        // Initialize MediaRecorder for recording the stream
        recorder = new MediaRecorder(stream);
        recorder.addEventListener("start", () => chunks = []); // Clear chunks at start
        recorder.addEventListener("dataavailable", (e) => chunks.push(e.data)); // Store video data chunks
        recorder.addEventListener("stop", () => {
            // Create a downloadable video file after recording stops
            let blob = new Blob(chunks, { type: "video/webm" });
            let videoURL = URL.createObjectURL(blob);
            let a = document.createElement('a');
            a.href = videoURL;
            a.download = "recording.webm"; // Download the recorded video
            a.click();
        });

        // Handle record button click
        recordBtnCont.addEventListener("click", () => {
            recordFlag = !recordFlag; // Toggle recording state
            if (recordFlag) {
                recorder.start(); // Start recording
                recordBtn.classList.add("scale-record"); // Add scaling animation
                startTimer(); // Start the recording timer
            } else {
                recorder.stop(); // Stop recording
                recordBtn.classList.remove("scale-record"); // Stop animation
                stopTimer(); // Stop the timer
            }
        });

        // Handle mute/unmute button click
        muteBtn.addEventListener("click", () => {
            audioMuted = !audioMuted; // Toggle audio muted state
            audioTrack.enabled = !audioMuted; // Mute/unmute audio
            muteBtn.innerText = audioMuted ? "Unmute" : "Mute"; // Update button text
        });
    })
    .catch((error) => {
        // Error handling if access to media devices fails
        console.error("Error accessing media devices:", error);
        alert("Unable to access media devices. Please check permissions.");
    });

// Handle capture button click
captureBtnCont.addEventListener("click", () => {
    captureBtn.classList.add("scale-capture"); // Add scaling animation

    let canvas = document.createElement("canvas"); // Create a canvas to capture the image
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    let tool = canvas.getContext("2d"); // Get 2D context of the canvas
    tool.drawImage(video, 0, 0, canvas.width, canvas.height); // Draw the current video frame on canvas
    tool.fillStyle = transparentColor; // Apply filter color
    tool.fillRect(0, 0, canvas.width, canvas.height); // Draw colored filter over the image

    // Create a downloadable image from the canvas
    let imageURL = canvas.toDataURL("image/jpeg");
    let a = document.createElement('a');
    a.href = imageURL;
    a.download = "Image.jpeg"; // Download the captured image
    a.click();

    setTimeout(() => {
        captureBtn.classList.remove("scale-capture"); // Remove animation after some time
    }, 1000); // Animation duration
});

// Filter selection logic
let filter = document.querySelector(".filter-layer"); // Layer for applying filter
let allFilter = document.querySelectorAll(".filter"); // All filter buttons

allFilter.forEach((filterElem) => {
    filterElem.addEventListener("click", () => {
        transparentColor = getComputedStyle(filterElem).getPropertyValue("background-color"); // Get selected filter color
        filter.style.backgroundColor = transparentColor; // Apply the selected filter to the video
    });
});

// Timer functionality for recording
let timerID;
let counter = 0;
let timer = document.querySelector(".timer");

function startTimer() {
    timer.style.display = "block"; // Show timer
    timerID = setInterval(() => {
        let totalSeconds = counter; // Convert seconds to hh:mm:ss format
        let hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
        let minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
        let seconds = String(totalSeconds % 60).padStart(2, "0");

        timer.innerText = `${hours}:${minutes}:${seconds}`; // Update timer display
        counter++;
    }, 1000); // Update every second
}

function stopTimer() {
    clearInterval(timerID); // Stop the timer
    counter = 0; // Reset counter
    timer.innerText = "00:00:00"; // Reset timer display
    timer.style.display = "none"; // Hide timer
}
