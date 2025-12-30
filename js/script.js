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

        // Monitor scroll for mobile to update dots
        track.addEventListener('scroll', () => {
            if (window.innerWidth <= 768) {
                const scrollPos = track.scrollLeft;
                const slideWidth = track.offsetWidth;
                const currentIndex = Math.round(scrollPos / slideWidth);

                if (currentIndex >= 0 && currentIndex < slides.length) {
                    const currentDot = dotsNav.querySelector('.current-slide');
                    const targetDot = dots[currentIndex];
                    if (currentDot !== targetDot) {
                        updateDots(currentDot, targetDot);
                    }
                }
            }
        }, { passive: true });

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
            let delay = 5000;

            const slideshow = currentSlide.querySelector('.image-slideshow');
            if (slideshow) {
                const imgCount = slideshow.querySelectorAll('img').length;
                if (imgCount > 0) {
                    delay = (imgCount * 3000);
                }
            }

            autoPlayTimeout = setTimeout(() => {
                // If user touches/scrolls on mobile, we might want to interact differently,
                // but for now keeping autopay is standard.
                // However, 'current-slide' might be stale on mobile if we don't update it on scroll.
                // Fortunately we added the 'scroll' listener to update dots.
                // We should also ensure 'current-slide' class is updated on scroll.
                // Let's rely on the scroll listener updates?
                // Actually scroll listener updates dots, but we need to update the slide class too for this logic.

                // Refetch fresh current slide in case scroll changed it
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

        // Handle Resize
        window.addEventListener('resize', () => {
            // If switching to mobile, remove transform
            if (window.innerWidth <= 768) {
                track.style.transform = '';
            } else {
                // Restore positions
                const newSlideWidth = slides[0].getBoundingClientRect().width;
                slides.forEach((slide, index) => {
                    slide.style.left = newSlideWidth * index + 'px';
                });
                const currentSlide = track.querySelector('.current-slide');
                track.style.transform = 'translateX(-' + currentSlide.style.left + ')';
            }
        });

        // --- Mobile Logic Updates ---
        // For mobile, we rely on Native Scroll (overflow-x: auto) + Scroll Snap.
        // We REMOVE the touch event listeners that did transform manipulation
        // because they conflict with native scroll.

        // Only add touch listeners if NOT mobile (though typically desktops usually don't need swipe unless touchscreen laptop)
        // Actually, easiest is just to remove the custom swipe logic entirely since we have native scroll now?
        // Or keep it for desktop-touch users?
        // Let's keep a simplified version only if width > 768.

        let startX = 0;
        let isDragging = false;

        // We will remove the old touch logic completely in favor of native scroll on mobile,
        // and buttons on desktop. (Desktop drag is rare).

        // Add listener to update current-slide class on scroll (Manual scroll updates)
        track.addEventListener('scroll', () => {
            if (window.innerWidth <= 768) {
                const scrollPos = track.scrollLeft;
                const slideWidth = track.offsetWidth; // Use offsetWidth
                const index = Math.round(scrollPos / slideWidth);

                if (index >= 0 && index < slides.length) {
                    // Update classes
                    slides.forEach(s => s.classList.remove('current-slide'));
                    slides[index].classList.add('current-slide');

                    const dot = dots[index];
                    dotsNav.querySelector('.current-slide').classList.remove('current-slide');
                    dot.classList.add('current-slide');
                }
            }
        }, { passive: true });
    }


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
