// Audio context and analyzer setup
let audioContext;
let analyzer;
let dataArray;
let currentAudioSource;

// Visualizer setup
const canvas = document.getElementById("visualizer");
const canvasCtx = canvas.getContext("2d");
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

// Format time in MM:SS
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

// Visualizer animation for a specific track
function drawTrackVisualizer(canvas, progress, isPlaying) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!isPlaying) {
    // Draw a static visualization when not playing
    ctx.fillStyle = "rgba(100, 50, 50, 0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }

  // Draw animated visualization when playing
  const barWidth = 2;
  const spacing = 1;
  const numBars = Math.floor(canvas.width / (barWidth + spacing));
  const amplitude = canvas.height / 2;

  for (let i = 0; i < numBars; i++) {
    const x = i * (barWidth + spacing);
    const progressOffset = (i / numBars) * Math.PI * 2;
    const height = Math.sin(progress + progressOffset) * amplitude;

    ctx.fillStyle = `rgb(${Math.abs(height) + 100}, 50, 50)`;
    ctx.fillRect(x, canvas.height / 2 - height / 2, barWidth, height);
  }
}

// Initialize audio context
function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    currentAudioSource = null;
  }
}

// Handle all play buttons
document.querySelectorAll("button[data-audio]").forEach((button) => {
  const audioId = button.getAttribute("data-audio");
  const audio = document.getElementById(audioId);
  const seekBar = document.querySelector(`input[data-seek="${audioId}"]`);
  const volumeSlider = document.querySelector(
    `input[data-volume="${audioId}"]`
  );
  const timeDisplay = button.parentElement.querySelector(".time-display");
  const visualizer = document.querySelector(
    `canvas[data-visualizer="${audioId}"]`
  );
  let animationFrame;
  let progress = 0;

  // Initialize visualizer
  visualizer.width = visualizer.offsetWidth;
  visualizer.height = visualizer.offsetHeight;

  // Update time display when metadata is loaded
  audio.addEventListener("loadedmetadata", () => {
    timeDisplay.textContent = `0:00 / ${formatTime(audio.duration)}`;
  });

  // Add error handling
  audio.addEventListener("error", (e) => {
    console.error(`Error loading audio ${audioId}:`, e);
    button.textContent = "❌";
  });

  // Add loading state
  audio.addEventListener("loadstart", () => {
    console.log(`Loading audio ${audioId}...`);
    button.textContent = "⏳";
  });

  // Add loaded state
  audio.addEventListener("loadeddata", () => {
    console.log(`Audio ${audioId} loaded successfully`);
    button.textContent = "▶️";
  });

  // Play/Pause toggle
  button.addEventListener("click", async () => {
    try {
      if (audio.paused) {
        // Initialize audio context on first play
        initAudioContext();

        // Pause all other tracks
        document.querySelectorAll("audio").forEach((other) => {
          if (other !== audio) {
            other.pause();
            const otherBtn = document.querySelector(
              `button[data-audio="${other.id}"]`
            );
            if (otherBtn) otherBtn.textContent = "▶️";
          }
        });

        // Start visualizer animation
        function animate() {
          progress += 0.1;
          drawTrackVisualizer(visualizer, progress, true);
          animationFrame = requestAnimationFrame(animate);
        }
        animate();

        await audio.play();
        button.textContent = "⏸️";
      } else {
        audio.pause();
        button.textContent = "▶️";
        drawTrackVisualizer(visualizer, progress, false);
        cancelAnimationFrame(animationFrame);
      }
    } catch (error) {
      console.error(`Error playing audio ${audioId}:`, error);
      button.textContent = "❌";
    }
  });

  // Update seek bar and time display while playing
  audio.addEventListener("timeupdate", () => {
    seekBar.value = audio.currentTime;
    seekBar.max = audio.duration;
    timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(
      audio.duration
    )}`;
  });

  // Scrub audio
  seekBar.addEventListener("input", () => {
    audio.currentTime = seekBar.value;
    timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(
      audio.duration
    )}`;
  });

  // Volume control
  volumeSlider.addEventListener("input", () => {
    audio.volume = volumeSlider.value;
  });

  // Reset button when track ends
  audio.addEventListener("ended", () => {
    button.textContent = "▶️";
    drawTrackVisualizer(visualizer, progress, false);
    cancelAnimationFrame(animationFrame);
  });
});

const isiOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.userAgent.includes("Macintosh") && "ontouchend" in document);

if (isiOS) {
  document.querySelectorAll("input[data-volume]").forEach((el) => {
    el.style.display = "none";
  });
}
