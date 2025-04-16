
// Handle all play buttons
document.querySelectorAll("button[data-audio]").forEach((button) => {
  const audioId = button.getAttribute("data-audio");
  const audio = document.getElementById(audioId);
  const seekBar = document.querySelector(`input[data-seek="${audioId}"]`);
  const volumeSlider = document.querySelector(
    `input[data-volume="${audioId}"]`
  );

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

  // Update seek bar while playing
  audio.addEventListener("timeupdate", () => {
    seekBar.value = audio.currentTime;
    seekBar.max = audio.duration;
  });

  // Scrub audio
  seekBar.addEventListener("input", () => {
    audio.currentTime = seekBar.value;
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



const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

if (isiOS) {
  document.querySelectorAll('input[data-volume]').forEach(el => {
    el.style.display = 'none';
  });
}