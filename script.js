// const audio = document.getElementById('audio');
// const playPause = document.getElementById('playPause');
// const seekBar = document.getElementById('seekBar');
// const volume = document.getElementById('volume');

// // Play/Pause toggle
// playPause.addEventListener('click', () => {
//   if (audio.paused) {
//     audio.play();
//     playPause.textContent = '⏸️';
//   } else {
//     audio.pause();
//     playPause.textContent = '▶️';
//   }
// });

// // Update seekBar as audio plays
// audio.addEventListener('timeupdate', () => {
//   seekBar.value = audio.currentTime;
//   seekBar.max = audio.duration;
// });

// // Seek when slider is moved
// seekBar.addEventListener('input', () => {
//   audio.currentTime = seekBar.value;
// });

// // Volume control
// volume.addEventListener('input', () => {
//   audio.volume = volume.value;
// });

// Handle all play buttons
document.querySelectorAll('button[data-audio]').forEach(button => {
    const audioId = button.getAttribute('data-audio');
    const audio = document.getElementById(audioId);
    const seekBar = document.querySelector(`input[data-seek="${audioId}"]`);
    const volumeSlider = document.querySelector(`input[data-volume="${audioId}"]`);
  
    // Play/Pause toggle
    button.addEventListener('click', () => {
      if (audio.paused) {
        // Pause all other tracks
        document.querySelectorAll('audio').forEach(other => {
          if (other !== audio) {
            other.pause();
            const otherBtn = document.querySelector(`button[data-audio="${other.id}"]`);
            if (otherBtn) otherBtn.textContent = '▶️';
          }
        });
        audio.play();
        button.textContent = '⏸️';
      } else {
        audio.pause();
        button.textContent = '▶️';
      }
    });
  
    // Update seek bar while playing
    audio.addEventListener('timeupdate', () => {
      seekBar.value = audio.currentTime;
      seekBar.max = audio.duration;
    });
  
    // Scrub audio
    seekBar.addEventListener('input', () => {
      audio.currentTime = seekBar.value;
    });
  
    // Volume control
    volumeSlider.addEventListener('input', () => {
      audio.volume = volumeSlider.value;
    });
  
    // Reset button when track ends
    audio.addEventListener('ended', () => {
      button.textContent = '▶️';
    });
  });