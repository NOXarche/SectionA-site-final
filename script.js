// Loader animation
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').style.opacity = 0;
    setTimeout(() => {
      document.getElementById('loader').style.display = 'none';
    }, 600);
  }, 1200);
});

// Typing effect
const typedText = document.getElementById('typed-text');
const cursor = document.querySelector('.cursor');
const text = "The only limit is our imagination. Let's build Mars together.";
let index = 0;
function type() {
  if (index < text.length) {
    typedText.textContent += text.charAt(index);
    index++;
    setTimeout(type, 50 + Math.random() * 50);
  } else {
    cursor.style.animation = 'none';
  }
}
setTimeout(type, 1000);

// Improved parallax scroll
function updateParallax() {
  const scrollY = window.scrollY;
  const heroHeight = document.querySelector('.hero').offsetHeight;
  const scrollPercent = Math.min(scrollY / heroHeight, 1);

  document.querySelector('.parallax-bg').style.transform = `translateY(${scrollPercent * 30}px)`;
  document.querySelector('.parallax-mid').style.transform = `translateY(${scrollPercent * 60}px)`;
  document.querySelector('.parallax-fg').style.transform = `translateY(${scrollPercent * 90}px)`;
  document.querySelector('.parallax-rover').style.transform = `translateY(${scrollPercent * 120}px)`;

  requestAnimationFrame(updateParallax);
}
updateParallax();

// Image loading handler
document.querySelectorAll('img').forEach(img => {
  if (img.complete) {
    img.classList.add('loaded');
  } else {
    img.addEventListener('load', () => {
      img.classList.add('loaded');
    });
    img.addEventListener('error', () => {
      // Optionally handle error
    });
  }
});

// Parallax mousemove (optional, desktop only)
const heroSection = document.querySelector('.hero');
function parallaxMouse(e) {
  if (window.matchMedia('(max-width: 700px)').matches) return;
  const { width, left } = heroSection.getBoundingClientRect();
  const x = (e.clientX - left) / width - 0.5;
  document.querySelector('.parallax-bg').style.transform += ` translateX(${x * 10}px)`;
  document.querySelector('.parallax-mid').style.transform += ` translateX(${x * 30}px)`;
  document.querySelector('.parallax-fg').style.transform += ` translateX(${x * 60}px)`;
  document.querySelector('.parallax-rover').style.transform += ` translateX(${x * 80}px)`;
}
heroSection.addEventListener('mousemove', parallaxMouse);

// Particle (dust) animation
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
function resizeParticles() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
function getParticleColor() {
  if (document.body.classList.contains('light')) {
    return "rgba(26,26,46,0.5)";
  } else {
    return "rgba(193,68,14,";
  }
}
function createParticles() {
  particles = [];
  let count = 70;
  if (window.innerWidth < 700 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) count = 30;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.8 + canvas.height * 0.2,
      r: Math.random() * 2.5 + 1,
      speed: Math.random() * 0.5 + 0.2,
      alpha: Math.random() * 0.7 + 0.2,
    });
  }
}
function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let colorBase = getParticleColor();
  for (let p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
    ctx.fillStyle = (colorBase.startsWith('rgba(193')) ? `${colorBase}${p.alpha})` : colorBase;
    ctx.shadowColor = document.body.classList.contains('light') ? "#1a1a2e" : "#c1440e";
    ctx.shadowBlur = 8;
    ctx.fill();
    p.x += p.speed * (Math.random() - 0.5);
    p.y -= p.speed * 0.5;
    if (p.y < 0) {
      p.y = canvas.height;
      p.x = Math.random() * canvas.width;
    }
  }
  requestAnimationFrame(drawParticles);
}
resizeParticles();
createParticles();
drawParticles();
window.addEventListener('resize', () => {
  resizeParticles();
  createParticles();
});
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
  createParticles();
});

// Particle color live update on mode toggle
function updateParticlesForMode() {
  createParticles();
}
const observer = new MutationObserver(updateParticlesForMode);
observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

// Card float/zoom on mousemove for gallery and features
document.querySelectorAll('.feature-card, .gallery-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.transform = `scale(1.05) translateY(-10px) rotateX(${-(y-rect.height/2)/12}deg) rotateY(${(x-rect.width/2)/12}deg)`;
    card.style.zIndex = 1;
  });
  card.addEventListener('mouseleave', e => {
    card.style.transform = '';
    card.style.zIndex = 0;
  });
});

// 3D tilt for feature cards (micro-interaction)
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width/2;
    const y = e.clientY - rect.top - rect.height/2;
    card.style.transform = `perspective(600px) rotateY(${x/20}deg) rotateX(${-y/20}deg) scale(1.05)`;
    card.style.zIndex = 2;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.zIndex = 0;
  });
});

// Dark/Light mode toggle
const modeToggle = document.getElementById('modeToggle');
const modeIcon = document.getElementById('modeIcon');
modeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  if (document.body.classList.contains('light')) {
    modeIcon.textContent = '🌞';
  } else {
    modeIcon.textContent = '🌑';
  }
  updateParticlesForMode();
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      window.scrollTo({
        top: target.offsetTop - 30,
        behavior: 'smooth'
      });
    }
  });
});

// Dedicated Login button in top bar scrolls to login section
document.getElementById('loginTopBtn').addEventListener('click', function() {
  const loginSection = document.getElementById('login');
  window.scrollTo({
    top: loginSection.offsetTop - 30,
    behavior: 'smooth'
  });
});

// Login form handling
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  window.location.href = '/auth.html';
});

// Signal strength indicator for scroll progress
const signalBars = document.querySelectorAll('.signal-bar');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  signalBars.forEach((bar, i) => {
    if (scrolled > i * 0.22) {
      bar.style.height = `${16 + i*8}px`;
      bar.style.opacity = 0.9;
    } else {
      bar.style.height = `12px`;
      bar.style.opacity = 0.5;
    }
  });
});

// Easter egg: ↑↑↓↓ to trigger Mars rover animation
let keySeq = [];
const secret = [38,38,40,40];
window.addEventListener('keydown', (e) => {
  keySeq.push(e.keyCode);
  if (keySeq.length > secret.length) keySeq.shift();
  if (keySeq.join(',') === secret.join(',')) {
    triggerRoverEasterEgg();
    keySeq = [];
  }
});
function triggerRoverEasterEgg() {
  const rover = document.querySelector('.parallax-rover');
  rover.style.transition = 'transform 2s cubic-bezier(.4,2,.6,1)';
  rover.style.transform += ' scale(1.5) translateY(-40px)';
  setTimeout(() => {
    rover.style.transform = rover.style.transform.replace(' scale(1.5) translateY(-40px)', '');
    rover.style.transition = '';
  }, 2000);
}
// Redirect all login/signup/CTA/gallery/feature links to auth page
document.querySelectorAll(
  '.login-top-btn, .cta-btn, .signup-btn, .gallery-link, .signup-link'
).forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'auth/index.html';
  });
});
