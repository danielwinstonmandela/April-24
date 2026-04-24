/* ─────────────────────────────────────────────────────
   MUSIC GENRE CLASSIFIER → EMOTIONAL SITE
   Two-phase UX with smooth reveal transition
───────────────────────────────────────────────────── */

(function () {
  'use strict';

  // ─── DOM REFS ───────────────────────────────────────
  const phase1        = document.getElementById('phase1');
  const phase2        = document.getElementById('phase2');
  const startBtn      = document.getElementById('startBtn');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const loadingStatus = document.getElementById('loadingStatus');
  const progressFill  = document.getElementById('progressFill');
  const galleryGrid   = document.getElementById('galleryGrid');
  const btnYes        = document.getElementById('btnYes');
  const btnOfCourse   = document.getElementById('btnOfCourse');
  const finalSection  = document.getElementById('finalSection');
  const finalText     = document.getElementById('finalText');
  const backgroundMusic = document.getElementById('backgroundMusic');
  const musicPauseBtn = document.getElementById('musicPauseBtn');
  const answerMusic   = document.getElementById('answerMusic');

  // ─── TRANSITION OVERLAY (created dynamically) ───────
  const overlay = document.createElement('div');
  overlay.id = 'transitionOverlay';
  document.body.appendChild(overlay);

  // ─── LOADING STATUS MESSAGES ────────────────────────
  const loadingMessages = [
    { text: 'Extracting audio features…', progress: 15 },
    { text: 'Running intermediate fusion…', progress: 35 },
    { text: 'Applying Mel-spectrogram analysis…', progress: 52 },
    { text: 'Classification complete.', progress: 70 },
    { text: 'Wait… anomaly detected.', progress: 82 },
    { text: 'Mapping to target subject: Gisel.', progress: 95 },
    { text: '…', progress: 100 },
  ];

  let msgIndex = 0;

  function cycleLoadingMessage() {
    if (msgIndex >= loadingMessages.length) return;
    const { text, progress } = loadingMessages[msgIndex];

    // Fade out, update, fade in
    loadingStatus.style.opacity = '0';
    setTimeout(() => {
      loadingStatus.textContent = text;
      loadingStatus.style.opacity = '1';
      progressFill.style.width = progress + '%';
    }, 200);

    msgIndex++;
  }

  // ─── START BUTTON CLICK ─────────────────────────────
  startBtn.addEventListener('click', function () {
    // Disable button
    startBtn.disabled = true;

    // Show loading overlay
    loadingOverlay.classList.add('visible');

    // Play background music
    backgroundMusic.play().catch(err => console.warn('Audio autoplay blocked:', err));

    // Cycle through messages
    cycleLoadingMessage(); // immediate first message
    let interval = setInterval(() => {
      if (msgIndex < loadingMessages.length) {
        cycleLoadingMessage();
      } else {
        clearInterval(interval);
        // Begin transition after last message settles
        setTimeout(beginRevealTransition, 900);
      }
    }, 700);
  });

  // ─── REVEAL TRANSITION ──────────────────────────────
  function beginRevealTransition() {
    // 1. Dark overlay fades in over phase 1
    overlay.classList.add('active');

    setTimeout(() => {
      // 2. Hide phase 1, show phase 2 (still hidden under overlay)
      phase1.style.opacity = '0';
      phase1.style.pointerEvents = 'none';

      setTimeout(() => {
        phase1.style.display = 'none';
        phase2.classList.remove('hidden');
        document.body.style.background = '#0b0b0f';

        // Give the browser a frame to register the new DOM
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // 3. Overlay fades out, phase 2 fades in
            overlay.classList.remove('active');
            phase2.classList.add('visible');

            // 4. Init scroll observers now that phase 2 is visible
            initScrollReveal();
            loadGallery();
          });
        });
      }, 600);

    }, 800);
  }

  // ─── SCROLL REVEAL ──────────────────────────────────
  function initScrollReveal() {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            // Cascade to child reveal-items with stagger
            const items = entry.target.querySelectorAll('.reveal-item');
            items.forEach((item, i) => {
              setTimeout(() => item.classList.add('in-view'), i * 120);
            });
            sectionObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('#phase2 .reveal-section').forEach(el => {
      sectionObserver.observe(el);
    });

    // Immediately reveal the intro (it's likely in viewport)
    const intro = document.querySelector('.s-intro');
    if (intro) {
      setTimeout(() => {
        intro.classList.add('in-view');
        const items = intro.querySelectorAll('.reveal-item');
        items.forEach((item, i) => {
          setTimeout(() => item.classList.add('in-view'), i * 120);
        });
      }, 200);
    }
  }

  // ─── IMAGE GALLERY ──────────────────────────────────
  function loadGallery() {
    fetch('./images.json')
      .then(r => {
        if (!r.ok) throw new Error('images.json not found');
        return r.json();
      })
      .then(data => {
        // Support both { "us": [...] } or flat array
        let images = Array.isArray(data) ? data : (data.us || Object.values(data).flat());
        renderGallery(images);
      })
      .catch(err => {
        console.warn('Gallery load failed:', err.message);
        // Show placeholder message gracefully
        galleryGrid.innerHTML = `<p style="color:var(--text-tertiary);font-size:13px;text-align:center;padding:40px;grid-column:1/-1">
          [ add your images to /images and update images.json ]
        </p>`;
      });
  }

  function renderGallery(images) {
    if (!images || images.length === 0) return;

    const validExts = /\.(jpg|jpeg|png|webp|gif)$/i;
    const filtered  = images.filter(name => validExts.test(name));

    // Shuffle lightly for a natural mosaic feel
    const shuffled = filtered.slice().sort(() => Math.random() - 0.5);

    // Lazy image observer
    const imgObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, _) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const src = el.dataset.src;
            if (src) {
              el.src = src;
              el.removeAttribute('data-src');
            }
            // Staggered reveal per batch
            el.closest('.gallery-item').classList.add('in-view');
            imgObserver.unobserve(el);
          }
        });
      },
      { rootMargin: '200px 0px', threshold: 0 }
    );

    shuffled.forEach((filename, idx) => {
      const item = document.createElement('div');
      item.className = 'gallery-item';

      const img = document.createElement('img');
      img.dataset.src = `./images/${filename}`;
      img.alt = '';
      img.loading = 'lazy';
      // Placeholder blur
      img.style.background = '#1a1a22';
      img.style.minHeight  = '100px';

      // Add stagger delay via CSS custom property
      item.style.transitionDelay = `${(idx % 12) * 50}ms`;

      img.addEventListener('load', () => {
        img.style.background = 'none';
        img.style.minHeight  = 'unset';
      });

      item.appendChild(img);
      galleryGrid.appendChild(item);
      imgObserver.observe(img);
    });
  }

  // ─── QUIZ HANDLER ───────────────────────────────────
  const quizForm = document.getElementById('quizForm');
  const quizResponse = document.getElementById('quizResponse');

  const responses = [
    'hmmm benerrr gak yaa sayang???',
  ];

  quizForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Get all selects
    const selects = quizForm.querySelectorAll('.quiz-select');
    let allAnswered = true;
    let correctCount = 0;

    selects.forEach(select => {
      if (!select.value) allAnswered = false;
      const correct = select.value === select.dataset.answer;
      if (correct) correctCount++;
    });

    if (!allAnswered) {
      quizResponse.textContent = 'pick an answer for each one…';
      quizResponse.classList.add('visible');
      return;
    }

    // Show light response
    const response = responses[Math.floor(Math.random() * responses.length)];
    quizResponse.textContent = response;
    quizResponse.classList.add('visible');

    // Disable button & selects
    quizForm.querySelector('.quiz-btn').disabled = true;
    selects.forEach(s => s.disabled = true);

    // After 1.5s, fade out quiz section and scroll to next section
    setTimeout(() => {
      quizResponse.classList.add('fade-out');
      const quizBlock = document.querySelector('.quiz-block');
      quizBlock.style.opacity = '0';
      quizBlock.style.pointerEvents = 'none';
      quizBlock.style.transition = 'opacity 0.6s ease';

      setTimeout(() => {
        const textSection = document.querySelector('.s-text');
        textSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 600);
    }, 1500);
  });

  // ─── ROSES ANIMATION ────────────────────────────────
  function createRosesAnimation() {
    const rosesContainer = document.getElementById('rosesContainer');
    const roseEmojis = ['🌹', '🥀', '🌷', '💐'];
    
    const roses = [];
    const maxBounceHeight = -800; // Allow bouncing up to 800px above screen
    const startTime = performance.now();
    const fadeInDuration = 5000; // 5 seconds in milliseconds
    
    for (let i = 0; i < 1000; i++) {
      const rose = document.createElement('div');
      rose.className = 'rose';
      rose.textContent = roseEmojis[Math.floor(Math.random() * roseEmojis.length)];
      
      // Start all at the bottom
      const x = Math.random() * window.innerWidth;
      const y = window.innerHeight - 24;
      
      // Very slow velocity
      const vx = (Math.random() - 0.5) * 0.8;
      const vy = (Math.random() - 0.5) * 0.8 - 0.4; // Bias slightly upward
      
      roses.push({
        element: rose,
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        rotation: Math.random() * 360
      });
      
      rose.style.left = x + 'px';
      rose.style.top = y + 'px';
      rose.style.opacity = '0.5'; // Start at 50% opacity
      rosesContainer.appendChild(rose);
    }
    
    // Animation loop
    function animate(currentTime) {
      // Calculate fade progress (0 to 1)
      const elapsed = currentTime - startTime;
      const fadeProgress = Math.min(elapsed / fadeInDuration, 1);
      const currentOpacity = 0.5 + (fadeProgress * 0.5); // Fade from 0.5 to 1
      
      roses.forEach(rose => {
        // Update position
        rose.x += rose.vx;
        rose.y += rose.vy;
        
        // Bounce off left/right edges
        if (rose.x <= 0 || rose.x >= window.innerWidth - 24) {
          rose.vx *= -1;
          rose.x = Math.max(0, Math.min(window.innerWidth - 24, rose.x));
        }
        
        // Bounce off top/bottom edges with extended range
        if (rose.y <= maxBounceHeight || rose.y >= window.innerHeight - 24) {
          rose.vy *= -1;
          rose.y = Math.max(maxBounceHeight, Math.min(window.innerHeight - 24, rose.y));
        }
        
        // Rotate slowly
        rose.rotation = (rose.rotation + 1) % 360;
        
        // Apply transform and opacity
        rose.element.style.transform = `translate(${rose.x}px, ${rose.y}px) rotate(${rose.rotation}deg)`;
        rose.element.style.opacity = currentOpacity;
        rose.element.style.left = '0';
        rose.element.style.top = '0';
      });
      
      requestAnimationFrame(animate);
    }
    
    requestAnimationFrame(animate);
  }

  // ─── ANSWER BUTTONS ─────────────────────────────────
  function handleAnswer() {
    // Micro-interaction
    this.style.transform = 'scale(0.96)';
    setTimeout(() => { this.style.transform = ''; }, 150);

    // Play answer music
    answerMusic.currentTime = 0;
    answerMusic.play().catch(err => console.warn('Audio play failed:', err));

    // Trigger roses animation
    createRosesAnimation();

    // Smooth scroll to final section
    setTimeout(() => {
      finalSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Reveal final text after scroll settles
      setTimeout(() => {
        finalText.classList.add('revealed');
      }, 800);
    }, 200);
  }

  btnYes.addEventListener('click', handleAnswer);
  btnOfCourse.addEventListener('click', handleAnswer);

  // ─── MUSIC PAUSE BUTTON ─────────────────────────────
  musicPauseBtn.addEventListener('click', function () {
    backgroundMusic.pause();
    this.textContent = 'music is paused ✓';
    this.style.opacity = '0.6';
    this.disabled = true;
  });

  // ─── SAFARI COMPAT: smooth scroll fallback ──────────
  // iOS Safari < 15.4 may not support smooth scrollIntoView
  // We polyfill using scrollTo with requestAnimationFrame
  function smoothScrollTo(targetY, duration) {
    const startY = window.scrollY;
    const distance = targetY - startY;
    let startTime = null;

    function easeInOutCubic(t) {
      return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
    }

    function step(currentTime) {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + distance * easeInOutCubic(progress));
      if (elapsed < duration) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  // Override scrollIntoView for answer buttons on iOS
  [btnYes, btnOfCourse].forEach(btn => {
    btn.addEventListener('click', function () {
      setTimeout(() => {
        const targetY = finalSection.getBoundingClientRect().top + window.scrollY - 60;
        smoothScrollTo(targetY, 1200);
        setTimeout(() => finalText.classList.add('revealed'), 1000);
      }, 250);
    }, { once: true });
  });

})();
