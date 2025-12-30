document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Navigation Toggle ---
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('toggle');
    });

    // --- Scroll Reveal Animation ---
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Stop observing once revealed if you want it to happen only once
                // observer.unobserve(entry.target);
            }
        });
    }, {
        root: null, // viewport
        threshold: 0.15, // Trigger when 15% visible
        rootMargin: "0px 0px -50px 0px" // Offset slightly so it doesn't trigger too early at bottom
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- Sticky Header Effect ---
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';
        } else {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        }
    });

    // --- Carousel Logic ---
    const track = document.querySelector('.carousel-track');
    // Only proceed if carousel exists (index.html)
    if (track) {
        const slides = Array.from(track.children);
        const nextButton = document.querySelector('.carousel-button--right');
        const prevButton = document.querySelector('.carousel-button--left');
        const dotsNav = document.querySelector('.carousel-nav');
        const dots = Array.from(dotsNav.children);

        // Arrange slides next to one another
        // width of one slide
        const slideWidth = slides[0].getBoundingClientRect().width;

        const setSlidePosition = (slide, index) => {
            slide.style.left = slideWidth * index + 'px';
        };
        slides.forEach(setSlidePosition);

        // Function to move to target slide
        const moveToSlide = (currentSlide, targetSlide) => {
            track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
            currentSlide.classList.remove('current-slide');
            targetSlide.classList.add('current-slide');
        };

        const updateDots = (currentDot, targetDot) => {
            currentDot.classList.remove('current-slide');
            targetDot.classList.add('current-slide');
        };

        const hideShowArrows = (slides, prevButton, nextButton, targetIndex) => {
            if (targetIndex === 0) {
                prevButton.classList.add('is-hidden');
                nextButton.classList.remove('is-hidden');
            } else if (targetIndex === slides.length - 1) {
                prevButton.classList.remove('is-hidden');
                nextButton.classList.add('is-hidden');
            } else {
                prevButton.classList.remove('is-hidden');
                nextButton.classList.remove('is-hidden');
            }
        };

        // Click Right
        nextButton.addEventListener('click', e => {
            const currentSlide = track.querySelector('.current-slide');
            const nextSlide = currentSlide.nextElementSibling;
            const currentDot = dotsNav.querySelector('.current-slide');
            const nextDot = currentDot.nextElementSibling;
            const nextIndex = slides.findIndex(slide => slide === nextSlide);

            moveToSlide(currentSlide, nextSlide);
            updateDots(currentDot, nextDot);
            hideShowArrows(slides, prevButton, nextButton, nextIndex);

            // Reset auto-play timer on manual interaction
            resetAutoPlay();
        });

        // Click Left
        prevButton.addEventListener('click', e => {
            const currentSlide = track.querySelector('.current-slide');
            const prevSlide = currentSlide.previousElementSibling;
            const currentDot = dotsNav.querySelector('.current-slide');
            const prevDot = currentDot.previousElementSibling;
            const prevIndex = slides.findIndex(slide => slide === prevSlide);

            moveToSlide(currentSlide, prevSlide);
            updateDots(currentDot, prevDot);
            hideShowArrows(slides, prevButton, nextButton, prevIndex);

            // Reset auto-play timer on manual interaction
            resetAutoPlay();
        });

        // Click Dots
        dotsNav.addEventListener('click', e => {
            const targetDot = e.target.closest('button');
            if (!targetDot) return;

            const currentSlide = track.querySelector('.current-slide');
            const currentDot = dotsNav.querySelector('.current-slide');
            const targetIndex = dots.findIndex(dot => dot === targetDot);
            const targetSlide = slides[targetIndex];

            moveToSlide(currentSlide, targetSlide);
            updateDots(currentDot, targetDot);
            hideShowArrows(slides, prevButton, nextButton, targetIndex);

            // Reset auto-play timer
            resetAutoPlay();
        });

        // Auto Play
        let autoPlayTimeout;

        const startAutoPlay = () => {
            // Clear any existing timeout to avoid overlaps
            if (autoPlayTimeout) clearTimeout(autoPlayTimeout);

            const currentSlide = track.querySelector('.current-slide');
            let delay = 5000; // Default delay

            // Check if current slide has a nested image slideshow
            const slideshow = currentSlide.querySelector('.image-slideshow');
            if (slideshow) {
                // Determine duration based on number of images
                // User CSS has 18s animation for 6 images (3s each).
                // We'll calculate: (number of images * 3000) + buffer
                const imgCount = slideshow.querySelectorAll('img').length;
                if (imgCount > 0) {
                    delay = (imgCount * 3000);
                }
            }

            autoPlayTimeout = setTimeout(() => {
                const nextSlide = currentSlide.nextElementSibling || slides[0]; // Loop back to start
                const currentDot = dotsNav.querySelector('.current-slide');
                const nextDot = nextSlide === slides[0] ? dots[0] : currentDot.nextElementSibling;
                const nextIndex = slides.findIndex(slide => slide === nextSlide);

                moveToSlide(currentSlide, nextSlide);
                updateDots(currentDot, nextDot);
                hideShowArrows(slides, prevButton, nextButton, nextIndex);

                // Continue loop
                startAutoPlay();
            }, delay);
        };

        const resetAutoPlay = () => {
            if (autoPlayTimeout) clearTimeout(autoPlayTimeout);
            startAutoPlay();
        };

        // Initialize AutoPlay
        startAutoPlay();

        // Handle Resize (Re-calculate positions)
        window.addEventListener('resize', () => {
            const newSlideWidth = slides[0].getBoundingClientRect().width;
            slides.forEach((slide, index) => {
                slide.style.left = newSlideWidth * index + 'px';
            });
            // Re-center current slide
            const currentSlide = track.querySelector('.current-slide');
            track.style.transform = 'translateX(-' + currentSlide.style.left + ')';
        });

        // --- Touch / Swipe Support ---
        let startX = 0;
        let diff = 0;
        let isDragging = false;

        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            // Pause auto-play on touch
            if (autoPlayTimeout) clearTimeout(autoPlayTimeout);
            track.style.transition = 'none'; // Remove transition for direct 1:1 movement
        }, { passive: true });

        track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const currentX = e.touches[0].clientX;
            diff = startX - currentX;
            // Optional: visual feedback (drag the track slightly)
            // Ideally we'd need current translate value, but for simplicity we rely on snap after end.
            // keeping it simple: just detect swipe direction on end.
        }, { passive: true });

        track.addEventListener('touchend', () => {
            isDragging = false;
            track.style.transition = 'transform 0.5s ease-in-out'; // Restore transition

            const threshold = 50; // min swipe distance

            if (diff > threshold) {
                // Swiped Left -> Next Slide
                nextButton.click();
            } else if (diff < -threshold) {
                // Swiped Right -> Prev Slide
                prevButton.click();
            }

            diff = 0;
            // Restart auto-play
            startAutoPlay();
        });
    }
});
