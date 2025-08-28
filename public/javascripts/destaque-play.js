document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('destaque-video');
  const overlay = document.getElementById('play-overlay');

  if (video && overlay) {
    overlay.addEventListener('click', () => {
      overlay.style.display = 'none';
      video.play();
    });

    video.addEventListener('ended', () => {
      overlay.style.display = 'flex';
    });
  }
});
