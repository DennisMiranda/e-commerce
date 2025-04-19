document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const track = carousel.querySelector('[data-carousel-track]');
    const slides = track.children;
    let index = 0;
  
    const updateSlide = () => {
      track.style.transform = `translateX(-${index * 100}%)`;
    };
  
    const next = () => {
      index = (index + 1) % slides.length;
      updateSlide();
    };
  
    const prev = () => {
      index = (index - 1 + slides.length) % slides.length;
      updateSlide();
    };
  
    carousel.querySelector('[data-carousel-next]').addEventListener('click', next);
    carousel.querySelector('[data-carousel-prev]').addEventListener('click', prev);
  
    let interval = setInterval(next, 3000);
  
    carousel.addEventListener('mouseenter', () => clearInterval(interval));
    carousel.addEventListener('mouseleave', () => interval = setInterval(next, 3000));
  });
  