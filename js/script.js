document.addEventListener('DOMContentLoaded', () => {

    // --- Language Switching System ---
    const langSwitch = document.querySelector('.lang-switch');

    // Get saved language or default to English
    let currentLang = localStorage.getItem('pallab-lang') || 'en';

    // Apply language on page load
    const applyLanguage = (lang) => {
        document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-TW' : 'en');

        // Update all translatable elements
        document.querySelectorAll('[data-en]').forEach(el => {
            if (lang === 'zh' && el.dataset.zh) {
                el.textContent = el.dataset.zh;
            } else if (el.dataset.en) {
                el.textContent = el.dataset.en;
            }
        });

        // Update elements with HTML content
        document.querySelectorAll('[data-en-html]').forEach(el => {
            if (lang === 'zh' && el.dataset.zhHtml) {
                el.innerHTML = el.dataset.zhHtml;
            } else if (el.dataset.enHtml) {
                el.innerHTML = el.dataset.enHtml;
            }
        });

        // Update lang switch button text
        if (langSwitch) {
            langSwitch.textContent = lang === 'zh' ? '中文 | EN' : 'EN | 中文';
        }

        // Save preference
        localStorage.setItem('pallab-lang', lang);
        currentLang = lang;
    };

    // Initialize language
    applyLanguage(currentLang);

    // Toggle language on click
    if (langSwitch) {
        langSwitch.addEventListener('click', (e) => {
            e.preventDefault();
            const newLang = currentLang === 'en' ? 'zh' : 'en';
            applyLanguage(newLang);
        });
    }

    // --- Mobile Navigation Toggle ---
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('toggle');
        });

        // Support keyboard navigation for hamburger menu
        hamburger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navLinks.classList.toggle('active');
                hamburger.classList.toggle('toggle');
            }
        });
    }

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
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';
            } else {
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
            }
        });
    }

    // --- Carousel Logic ---
    window.initCarousel = () => {
        const track = document.querySelector('.carousel-track');
        const nextButton = document.querySelector('.carousel-button--right');
        const prevButton = document.querySelector('.carousel-button--left');
        const dotsNav = document.querySelector('.carousel-nav');

        // Only proceed if all carousel elements exist (index.html)
        if (track && nextButton && prevButton && dotsNav) {
            const slides = Array.from(track.children);
            const dots = Array.from(dotsNav.children);

            // Ensure we have slides to work with
            if (slides.length === 0) return;

            // Arrange slides next to one another
            // width of one slide
            const slideWidth = slides[0].getBoundingClientRect().width;

            const setSlidePosition = (slide, index) => {
                slide.style.left = slideWidth * index + 'px';
            };
            slides.forEach(setSlidePosition);

            // Function to move to target slide
            const moveToSlide = (currentSlide, targetSlide) => {
                if (window.innerWidth <= 768) {
                    // Mobile: Native Scroll
                    const targetIndex = slides.findIndex(s => s === targetSlide);
                    const slideWidth = track.offsetWidth;
                    track.scrollTo({
                        left: targetIndex * slideWidth,
                        behavior: 'smooth'
                    });

                    // Update helpers manually since we hijack the transform logic
                    currentSlide.classList.remove('current-slide');
                    targetSlide.classList.add('current-slide');
                } else {
                    // Desktop: Transform
                    track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
                    currentSlide.classList.remove('current-slide');
                    targetSlide.classList.add('current-slide');
                }
            };

            const updateDots = (currentDot, targetDot) => {
                currentDot.classList.remove('current-slide');
                targetDot.classList.add('current-slide');
            };

            const hideShowArrows = (slides, prevButton, nextButton, targetIndex) => {
                if (window.innerWidth <= 768) return; // Ignore arrows on mobile

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
                if (!nextSlide) return;

                const currentDot = dotsNav.querySelector('.current-slide');
                const nextDot = currentDot.nextElementSibling;
                if (!nextDot) return;

                const nextIndex = slides.findIndex(slide => slide === nextSlide);

                moveToSlide(currentSlide, nextSlide);
                updateDots(currentDot, nextDot);
                hideShowArrows(slides, prevButton, nextButton, nextIndex);
                resetAutoPlay();
            });

            // Click Left
            prevButton.addEventListener('click', e => {
                const currentSlide = track.querySelector('.current-slide');
                const prevSlide = currentSlide.previousElementSibling;
                if (!prevSlide) return;

                const currentDot = dotsNav.querySelector('.current-slide');
                const prevDot = currentDot.previousElementSibling;
                if (!prevDot) return;

                const prevIndex = slides.findIndex(slide => slide === prevSlide);

                moveToSlide(currentSlide, prevSlide);
                updateDots(currentDot, prevDot);
                hideShowArrows(slides, prevButton, nextButton, prevIndex);
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
                resetAutoPlay();
            });

            // Auto Play
            let autoPlayTimeout;

            const startAutoPlay = () => {
                if (autoPlayTimeout) clearTimeout(autoPlayTimeout);

                const currentSlide = track.querySelector('.current-slide');
                if (!currentSlide) return;

                let delay = 5000;

                const slideshow = currentSlide.querySelector('.image-slideshow');
                if (slideshow) {
                    const imgCount = slideshow.querySelectorAll('img').length;
                    if (imgCount > 0) {
                        delay = (imgCount * 3000);
                    }
                }

                autoPlayTimeout = setTimeout(() => {
                    const freshCurrentSlide = track.querySelector('.current-slide');
                    const nextSlide = freshCurrentSlide.nextElementSibling || slides[0];
                    const freshCurrentDot = dotsNav.querySelector('.current-slide');
                    const nextDot = nextSlide === slides[0] ? dots[0] : freshCurrentDot.nextElementSibling;
                    const nextIndex = slides.findIndex(slide => slide === nextSlide);

                    moveToSlide(freshCurrentSlide, nextSlide);
                    updateDots(freshCurrentDot, nextDot);
                    hideShowArrows(slides, prevButton, nextButton, nextIndex);

                    startAutoPlay();
                }, delay);
            };

            const resetAutoPlay = () => {
                if (autoPlayTimeout) clearTimeout(autoPlayTimeout);
                startAutoPlay();
            };

            // Initialize AutoPlay
            startAutoPlay();

            // Handle Resize with debounce
            const handleResize = () => {
                const isMobile = window.innerWidth <= 768;
                const currentSlide = track.querySelector('.current-slide');
                if (!currentSlide) return;
                const currentIndex = slides.findIndex(s => s === currentSlide);

                // Disable transitions temporarily
                track.classList.add('no-transition');

                if (isMobile) {
                    // Mobile: Undo any transforms, rely on native scroll
                    track.style.transform = '';
                    slides.forEach(s => s.style.left = '');

                    // Snap to current slide
                    const slideWidth = track.offsetWidth;
                    track.scrollLeft = currentIndex * slideWidth;
                } else {
                    // Desktop: Reset scroll, re-apply transforms
                    track.scrollLeft = 0;

                    // Re-calculate absolute positions
                    const sw = slides[0].getBoundingClientRect().width;
                    slides.forEach((slide, index) => {
                        slide.style.left = sw * index + 'px';
                    });

                    // Move to current slide
                    track.style.transform = 'translateX(-' + (sw * currentIndex) + 'px)';

                    // Update buttons
                    hideShowArrows(slides, prevButton, nextButton, currentIndex);
                }

                // Re-enable transitions
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        track.classList.remove('no-transition');
                    });
                });
            };

            window.addEventListener('resize', () => {
                // Simple debounce
                clearTimeout(window.carouselResizeTimer);
                window.carouselResizeTimer = setTimeout(handleResize, 100);
            });

            // Also handle orientation change for mobile devices
            window.addEventListener('orientationchange', () => {
                // Wait for orientation change to complete
                setTimeout(handleResize, 200);
            });

            // Handle visibility change (when user switches tabs and comes back)
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    // Reset carousel position when page becomes visible again
                    handleResize();
                }
            });

            // Add listener to update current-slide class on scroll (Manual scroll updates)
            track.addEventListener('scroll', () => {
                if (window.innerWidth <= 768) {
                    // Mobile mode: update slide and dot classes based on scroll
                    const scrollPos = track.scrollLeft;
                    const sw = track.offsetWidth;
                    const index = Math.round(scrollPos / sw);

                    if (index >= 0 && index < slides.length) {
                        // Update slide classes
                        slides.forEach(s => s.classList.remove('current-slide'));
                        slides[index].classList.add('current-slide');

                        // Update dot classes
                        const currentDot = dotsNav.querySelector('.current-slide');
                        if (currentDot && dots[index] && currentDot !== dots[index]) {
                            currentDot.classList.remove('current-slide');
                            dots[index].classList.add('current-slide');
                        }
                    }
                } else {
                    // Desktop mode: ensure scroll is reset
                    if (track.scrollLeft !== 0) {
                        track.scrollLeft = 0;
                    }
                }
            }, { passive: true });

            // Initial setup
            handleResize();
        }
    };

    // Initialize carousel if elements exist
    window.initCarousel();


    // --- Research Detail Modal Logic ---
    const modalOverlay = document.getElementById('research-modal');
    // Only proceed if modal exists (research.html)
    if (modalOverlay) {
        const modalBody = document.querySelector('.modal-body');
        const closeBtn = document.querySelector('.close-modal');
        // Select all cards instead of buttons
        const researchCards = document.querySelectorAll('.research-card');

        const openModal = (content) => {
            // Content can be HTML from a hidden div
            modalBody.innerHTML = content;
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling

            // Apply language to dynamically injected content
            const currentLang = localStorage.getItem('pallab-lang') || 'en';
            modalBody.querySelectorAll('[data-en]').forEach(el => {
                if (currentLang === 'zh' && el.dataset.zh) {
                    el.textContent = el.dataset.zh;
                } else if (el.dataset.en) {
                    el.textContent = el.dataset.en;
                }
            });
        };

        const closeModal = () => {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        researchCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Find hidden detail content WITHIN the clicked card
                // Ensure we don't trigger if clicking inside the detail itself (rare edge case since detail is hidden)
                const detailContent = card.querySelector('.research-detail').innerHTML;
                if (detailContent) {
                    openModal(detailContent);
                }
            });
        });

        closeBtn.addEventListener('click', closeModal);

        // Close on clicking outside
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                closeModal();
            }
        });
    }
});
