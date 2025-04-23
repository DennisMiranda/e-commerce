document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const track = carousel.querySelector('[data-carousel-track]');
    const slides = Array.from(track.children);
    // Clonar primera y última diapositiva
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);
    track.appendChild(firstClone);
    track.insertBefore(lastClone, slides[0]); 
    const newSlides = Array.from(track.children);
    let index = 1;
    const total = newSlides.length;
    // Posicionar en la "primera real"
    track.style.transform = `translateX(-${index * 100}%)`;
    const update = (animate = true) => {
    track.style.transition = animate ? 'transform 0.5s ease' : 'none';
    track.style.transform = `translateX(-${index * 100}%)`;
    };
    const next = () => {
    if (index >= total - 1) return;
    index++;
    update();
      // Si llegamos al final, después de animar, saltamos al inicio real
    if (index === total - 1) {
        setTimeout(() => {
        index = 1;
        update(false);
        }, 500);
    }
    };
    const prev = () => {
    if (index <= 0) return;
    index--;
    update();
    if (index === 0) {
        setTimeout(() => {
        index = total - 2;
        update(false);
        }, 500);
    }
    };
    carousel.querySelector('[data-carousel-next]').addEventListener('click', next);
    carousel.querySelector('[data-carousel-prev]').addEventListener('click', prev);
    let interval = setInterval(next, 2000);
    carousel.addEventListener('mouseenter', () => clearInterval(interval));
    carousel.addEventListener('mouseleave', () => interval = setInterval(next, 2000));
});

const resetInterval = () => {
    clearInterval(interval);
    interval = setInterval(next, 2000);
};

carousel.querySelector('[data-carousel-next]').addEventListener('click', () => {
    next();
    resetInterval();
});

carousel.querySelector('[data-carousel-prev]').addEventListener('click', () => {
    prev();
    resetInterval();
});
