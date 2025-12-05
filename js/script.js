// Simple interactive behaviors: typed role, scroll reveal, basic contact form handling
document.addEventListener('DOMContentLoaded', () => {
    // Insert current year
    document.getElementById('year').textContent = new Date().getFullYear();

    // Typed role text (rotate between phrases)
    const typedEl = document.getElementById('typed-role');
    if (typedEl) {
        const roles = [
            'BIM Coordinator',
            'MSc BIM & Digital Transformation (Distinction)',
            '4D Simulation • Clash Detection • Additive Manufacturing'
        ];
        let i = 0, j = 0, direction = 1;
        let current = '';
        function typeTick() {
            const full = roles[i];
            if (j < full.length) {
                current += full[j++];
                typedEl.textContent = current;
                setTimeout(typeTick, 40);
            } else {
                // pause then delete
                setTimeout(() => {
                    const del = setInterval(() => {
                        current = current.slice(0, -1);
                        typedEl.textContent = current;
                        if (current.length === 0) {
                            clearInterval(del);
                            i = (i + 1) % roles.length;
                            j = 0;
                            setTimeout(typeTick, 220);
                        }
                    }, 30);
                }, 1400);
            }
        }
        typeTick();
    }

    // Simple scroll reveal
    const reveals = document.querySelectorAll('.reveal, .project-card, .skill-chips span, .glass');
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(en => {
            if (en.isIntersecting) {
                en.target.classList.add('visible');
                // once visible, unobserve to reduce CPU
                obs.unobserve(en.target);
            }
        });
    }, { threshold: 0.12 });

    reveals.forEach(r => {
        r.classList.add('reveal');
        obs.observe(r);
    });

    // Smooth anchor scrolling
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (href.length > 1) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Mobile nav toggle
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.nav');
    toggle && toggle.addEventListener('click', () => {
        if (nav.style.display === 'block') nav.style.display = '';
        else nav.style.display = 'block';
    });

    // Form submission handled by Formspree

    // Project lightbox / gallery behaviour
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return; // Skip if no lightbox on this page
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const prevButton = document.querySelector('.lightbox-prev');
    const nextButton = document.querySelector('.lightbox-next');
    const thumbnailContainer = document.querySelector('.thumbnail-container');

    if (!lightboxImg || !lightboxCaption || !thumbnailContainer) return; // Skip if essential elements are missing

    let currentImages = [];
    let currentIndex = 0;
    let zoomLevel = 1;
    let panX = 0;
    let panY = 0;
    let isDragging = false;
    let startX, startY;

    function showImage(index) {
        if (index < 0 || index >= currentImages.length) return;
        currentIndex = index;
        lightboxImg.src = currentImages[index];
        resetZoom();
        updateThumbnails();
    }

    function updateThumbnails() {
        document.querySelectorAll('.thumbnail-container img').forEach((img, i) => {
            img.classList.toggle('active', i === currentIndex);
        });
    }

    function openLightbox(images, title, alt, startIndex = 0) {
        currentImages = images;
        lightboxCaption.textContent = title || '';

        thumbnailContainer.innerHTML = '';
        images.forEach((src, i) => {
            const thumb = document.createElement('img');
            thumb.src = src;
            thumb.alt = `Thumbnail ${i + 1}`;
            thumb.addEventListener('click', () => showImage(i));
            thumbnailContainer.appendChild(thumb);
        });

        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        showImage(startIndex);
        lightbox.querySelector('.lightbox-close')?.focus();
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        currentImages = [];
        thumbnailContainer.innerHTML = '';
        resetZoom();
        // clear src after closing to reduce memory usage on mobile
        setTimeout(() => { lightboxImg.src = ''; }, 220);
    }

    function showNextImage() {
        showImage((currentIndex + 1) % currentImages.length);
    }

    function showPrevImage() {
        showImage((currentIndex - 1 + currentImages.length) % currentImages.length);
    }

    function zoomIn() {
        zoomLevel = Math.min(zoomLevel * 1.2, 5);
        applyZoom();
    }

    function zoomOut() {
        zoomLevel = Math.max(zoomLevel / 1.2, 0.5);
        applyZoom();
    }

    function resetZoom() {
        zoomLevel = 1;
        panX = 0;
        panY = 0;
        applyZoom();
    }

    function applyZoom() {
        lightboxImg.style.transform = `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`;
    }

    function handleMouseDown(e) {
        if (zoomLevel > 1) {
            isDragging = true;
            startX = e.clientX - panX;
            startY = e.clientY - panY;
            lightboxImg.style.cursor = 'grabbing';
        }
    }

    function handleMouseMove(e) {
        if (isDragging && zoomLevel > 1) {
            panX = e.clientX - startX;
            panY = e.clientY - startY;
            applyZoom();
        }
    }

    function handleMouseUp() {
        isDragging = false;
        lightboxImg.style.cursor = zoomLevel > 1 ? 'grab' : 'default';
    }

    function handleWheel(e) {
        e.preventDefault();
        if (e.deltaY < 0) {
            zoomIn();
        } else {
            zoomOut();
        }
    }

    // Add click handlers to all images
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG' && !e.target.closest('.thumbnail-container')) {
            const imgSrc = e.target.src;
            const imgAlt = e.target.alt;
            openLightbox([imgSrc], imgAlt);
        }
    });

    // Button and key handlers
    if (nextButton) nextButton.addEventListener('click', showNextImage);
    if (prevButton) prevButton.addEventListener('click', showPrevImage);

    // Zoom controls
    const zoomInBtn = document.querySelector('.zoom-in');
    const zoomOutBtn = document.querySelector('.zoom-out');
    const zoomResetBtn = document.querySelector('.zoom-reset');
    if (zoomInBtn) zoomInBtn.addEventListener('click', zoomIn);
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', zoomOut);
    if (zoomResetBtn) zoomResetBtn.addEventListener('click', resetZoom);

    // Mouse events for panning
    if (lightboxImg) {
        lightboxImg.addEventListener('mousedown', handleMouseDown);
        lightboxImg.addEventListener('wheel', handleWheel);
    }
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Close handlers (overlay, close button, ESC key)
    lightbox.addEventListener('click', (e) => {
        const action = e.target.getAttribute('data-action');
        if (action === 'close' || e.target.classList.contains('lightbox-close')) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (lightbox.classList.contains('open')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') showNextImage();
            if (e.key === 'ArrowLeft') showPrevImage();
            if (e.key === '+') zoomIn();
            if (e.key === '-') zoomOut();
            if (e.key === '0') resetZoom();
        }
    });

    // Disable send button if form fields are empty
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const nameInput = contactForm.querySelector('input[name="name"]');
        const emailInput = contactForm.querySelector('input[name="email"]');
        const messageTextarea = contactForm.querySelector('textarea[name="message"]');
        const submitButton = contactForm.querySelector('button[type="submit"]');

        function checkFormValidity() {
            const nameValue = nameInput.value.trim();
            const emailValue = emailInput.value.trim();
            const messageValue = messageTextarea.value.trim();
            submitButton.disabled = !(nameValue && emailValue && messageValue);
        }

        // Initial check
        checkFormValidity();

        // Add event listeners to inputs
        [nameInput, emailInput, messageTextarea].forEach(input => {
            input.addEventListener('input', checkFormValidity);
        });
    }
});
