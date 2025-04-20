document.querySelectorAll('[data-carousel]').forEach(carousel => {
  const track = carousel.querySelector('[data-carousel-track]');
  const slides = Array.from(track.children);
  const total = slides.length;
  let index = 0;

  const moverCarrusel = () => {
    index++;
    track.style.transition = 'transform 0.5s ease';
    track.style.transform = `translateX(-${index * 100}%)`;

    if (index >= total) {
      setTimeout(() => {
        track.style.transition = 'none';
        track.style.transform = 'translateX(0)';
        index = 0;
      }, 500);
    }
  };

  setInterval(moverCarrusel, 3000);
});
