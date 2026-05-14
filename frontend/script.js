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

if (twLocation && twCoords && twTagline) {
  const twSequence = [
    { el: twLocation, text: '[ LOCATION ]\u00A0\u00A0' },
    { el: twCoords, text: '42° 23′ 56.76″ N, 18° 49′ 6.24″ E' },
    { el: twTagline, text: '\u00A0\u00A0// UNMAPPED' }
  ];

  let cancelled = false;

  function runTypewriter() {
    let partIndex = 0;
    let charIndex = 0;

    function typeNext() {
      if (cancelled || partIndex >= twSequence.length) return;
      const part = twSequence[partIndex];
      if (charIndex < part.text.length) {
        part.el.textContent += part.text.charAt(charIndex);
        charIndex++;
        setTimeout(typeNext, 50);
      } else {
        partIndex++;
        charIndex = 0;
        setTimeout(typeNext, 120);
      }
    }
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

const contactForm = document.querySelector('.contact-form');
const contactStatus = document.querySelector('.contact-status');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      level: formData.get('level'),
      message: formData.get('message'),
    };

    contactStatus.textContent = 'Sending...';
    contactStatus.classList.remove('error');

    try {
      const apiUrl = contactForm.dataset.apiUrl || '/api/contact';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to submit form');
      }

      contactStatus.textContent = 'Thanks — we have your request and a confirmation email is on its way.';
      contactForm.reset();
    } catch (error) {
      contactStatus.textContent = 'Sorry, we could not send your message. Please try again later.';
      contactStatus.classList.add('error');
      console.error('Contact form submit failed:', error);
    }
  });
}
