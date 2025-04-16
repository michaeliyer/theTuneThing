// Format time in MM:SS
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
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

        // Try to play the audio
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
          button.textContent = "⏸️";
        }
      } else {
        audio.pause();
        button.textContent = "▶️";
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
