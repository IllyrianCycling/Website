const scrollProgress = document.querySelector('.scroll-progress');
let ticking = false;

if (scrollProgress) {
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress.style.height = ((scrollTop / docHeight) * 100) + '%';
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

const twLocation = document.getElementById('tw-location');
const twCoords = document.getElementById('tw-coords');
const twTagline = document.getElementById('tw-tagline');

const isDesktop = window.innerWidth >= 768;

if (twLocation && twCoords && twTagline) {
  const twSequence = [
    { el: twLocation, text: '[ LOCATION ]' },
    { el: twCoords, text: "42° 23′ 56.76″ N, 18° 49′ 6.24″ E" },
    { el: twTagline, text: isDesktop ? '// UNMAPPED' : 'UNMAPPED' },
  ];

  let cancelled = false;

  function runTypewriter() {
    let partIndex = 0;
    let charIndex = 0;

    function setCursorActive(el, active) {
      const line = el.parentElement;
      if (!line) return;
      const cursor = line.querySelector('.cursor');
      if (!cursor) return;
      cursor.classList.toggle('is-active', active);
    }

    function typeNext() {
      if (cancelled || partIndex >= twSequence.length) return;
      const part = twSequence[partIndex];
      if (charIndex < part.text.length) {
        if (charIndex === 0) {
          if (partIndex > 0) setCursorActive(twSequence[partIndex - 1].el, false);
          setCursorActive(part.el, true);
        }
        part.el.textContent += part.text.charAt(charIndex);
        charIndex++;
        setTimeout(typeNext, 50);
      } else {
        partIndex++;
        charIndex = 0;
        setTimeout(typeNext, 120);
      }
    }
    if (!isDesktop) setCursorActive(twSequence[0].el, true);
    typeNext();
  }

  const startTimer = setTimeout(runTypewriter, 800);

  window.addEventListener('unload', () => {
    cancelled = true;
    clearTimeout(startTimer);
  });
}

const routeCards = document.querySelectorAll('.route-card');

if (routeCards.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  routeCards.forEach(card => observer.observe(card));
}
/// Backend API interaction for contact form
const contactForm = document.querySelector('.contact-form');
const contactStatus = document.querySelector('.contact-status');

function updateStatus(message, isError = false) {
  if (!contactStatus) return;
  contactStatus.textContent = message;
  contactStatus.classList.toggle('error', isError);
}

async function parseJsonResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
// Email content builders
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
// Sanitize input values
    const formData = new FormData(contactForm);
    const payload = {
      name: formData.get('name')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      level: formData.get('level')?.toString() || '',
      message: formData.get('message')?.toString() || '',
    };

    updateStatus('Sending...');

    try {
      const apiUrl = contactForm.dataset.apiUrl || contactForm.action || '/api/contact';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await parseJsonResponse(response);

      if (!response.ok) {
        const message = result?.error || result?.message || `Request failed with status ${response.status}`;
        throw new Error(message);
      }

      updateStatus('Thanks — we have your request and a confirmation email is on its way.');
      contactForm.reset();
    } catch (error) {
      console.error('Contact form submit failed:', error);
      updateStatus('Sorry, we could not send your message. Please try again later.', true);
    }
  });
}

// Music toggle
const musicToggle = document.getElementById('music-toggle');
const musicUrl = 'https://github.com/IllyrianCycling/website/releases/download/audio-v1/Supersonic.Shadows.mp3';

if (musicToggle) {
  let track = null;

  musicToggle.addEventListener('click', () => {
    if (!track) {
      track = new Audio(musicUrl);
      track.loop = true;
      track.preload = 'none';
    }

    if (track.paused) {
      track.play().then(() => {
        musicToggle.setAttribute('aria-pressed', 'true');
        musicToggle.classList.add('is-on');
      }).catch((err) => {
        console.error('Playback failed:', err);
      });
    } else {
      track.pause();
      musicToggle.setAttribute('aria-pressed', 'false');
      musicToggle.classList.remove('is-on');
    }
  });
}
