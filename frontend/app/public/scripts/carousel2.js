document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const track = carousel.querySelector('[data-carousel-track]');
    const slides = Array.from(track.children);
    let index = 0;

    const update = (animate = true) => {
        track.style.transition = animate ? 'transform 0.5s ease' : 'none';
        track.style.transform = `translateX(-${index * 100}%)`;
    };

    const next = () => {
        index++;
        update();

        // Después de la transición, si es el final, reinicia a 0 sin animación
        if (index === slides.length) {
            setTimeout(() => {
                track.style.transition = 'none';
                index = 0;
                update(false);
            }, 500); // igual a la duración de la animación
        }
    };

    const prev = () => {
        if (index === 0) {
            index = slides.length - 1;
            track.style.transition = 'none';
            update(false);
            setTimeout(() => {
                track.style.transition = 'transform 0.5s ease';
                update();
            }, 50);
        } else {
            index--;
            update();
        }
    };

    carousel.querySelector('[data-carousel-next]').addEventListener('click', next);
    carousel.querySelector('[data-carousel-prev]').addEventListener('click', prev);

    setInterval(next, 3000); // Auto-slide
});
