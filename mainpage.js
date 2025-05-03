// --- Meteor Shower Canvas Animation ---
const meteorCanvas = document.getElementById('meteor-bg');
const ctx = meteorCanvas.getContext('2d');
let meteors = [];
function resizeMeteorCanvas() {
  meteorCanvas.width = window.innerWidth;
  meteorCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeMeteorCanvas);
resizeMeteorCanvas();
function spawnMeteor() {
  const angle = Math.PI / 2.5 + (Math.random() - 0.5) * 0.2;
  const speed = 7 + Math.random() * 4;
  meteors.push({
    x: Math.random() * meteorCanvas.width,
    y: -30,
    dx: Math.cos(angle) * speed,
    dy: Math.sin(angle) * speed,
    len: 90 + Math.random() * 60,
    alpha: 0.7 + Math.random() * 0.3,
    width: 2 + Math.random() * 2
  });
}
setInterval(spawnMeteor, 650);
function drawMeteors() {
  ctx.clearRect(0, 0, meteorCanvas.width, meteorCanvas.height);
  for (let m of meteors) {
    ctx.save();
    ctx.globalAlpha = m.alpha;
    ctx.strokeStyle = "white";
    ctx.lineWidth = m.width;
    ctx.shadowColor = "#ff8a00";
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(m.x - m.dx * m.len, m.y - m.dy * m.len);
    ctx.stroke();
    ctx.restore();
    m.x += m.dx;
    m.y += m.dy;
  }
  meteors = meteors.filter(m => m.x > -200 && m.y < meteorCanvas.height + 200);
  requestAnimationFrame(drawMeteors);
}
drawMeteors();

// --- Improved Parallax Scrolling ---
function updateParallax() {
  const scrollY = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const scrollPercentage = Math.min(scrollY / maxScroll, 0.95);
  
  const stars = document.querySelector('.bg-stars');
  const starsBottom = document.querySelector('.bg-stars-bottom');
  const mountains = document.querySelector('.bg-mountains');
  const dust = document.querySelector('.bg-dust');
  
  if (stars) stars.style.transform = `translateY(${scrollY * 0.1}px)`;
  if (starsBottom) starsBottom.style.transform = `translateY(${scrollY * -0.05}px)`;
  if (mountains) mountains.style.transform = `translateY(${scrollY * 0.2}px)`;
  if (dust) dust.style.transform = `translateY(${scrollY * 0.3}px)`;
  
  // Only apply zoom effect if not near the bottom
  if (scrollPercentage < 0.95) {
    if (scrollY > 40) document.body.classList.add('scrolled');
    else document.body.classList.remove('scrolled');
  } else {
    // Remove the effect when near the bottom to prevent trembling
    document.body.classList.remove('scrolled');
  }
  
  requestAnimationFrame(updateParallax);
}
// Start the parallax animation
updateParallax();

// --- Firebase config ---
const firebaseConfig = {
  apiKey: "AIzaSyDlFYzg5Te2jz-kVKXd0yGYlJkMwU9fxss",
  authDomain: "ju-civil-a-martian.firebaseapp.com",
  projectId: "ju-civil-a-martian",
  storageBucket: "ju-civil-a-martian.appspot.com",
  messagingSenderId: "247448010406",
  appId: "1:247448010406:web:a2efa79a4080513cc87e67",
  measurementId: "G-BXYMLKE395"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- SESSION CHECK & USER GREETING ---
const roll = sessionStorage.getItem('userRoll');
if (!roll) {
  window.location.href = "auth/index.html";
} else {
  db.collection("users").doc(roll).get().then(userDoc => {
    if (!userDoc.exists) {
      alert("Profile not found!");
      window.location.href = "auth/index.html";
      return;
    }
    const data = userDoc.data();
    typeGreeting(`Hi, ${data.name}! 🚀`);
    window.userSubsection = data.subsection || "A1";
    setActiveSubsectionBtn(window.userSubsection);
    if (data.role === "admin") {
      window.location.href = "/admin.html";
    }
    renderSchedule(window.userSubsection);
  });
}

// --- LOGOUT ---
document.getElementById('logoutBtn').onclick = () => {
  sessionStorage.clear();
  window.location.href = "auth/index.html";
};

// --- PROFILE BUTTON ---
document.getElementById('profileBtn').onclick = () => {
  window.location.href = "profile.html";
};

// --- THEME TOGGLE ---
const themeToggle = document.getElementById('themeToggle');
let darkMode = true;
themeToggle.onclick = () => {
  darkMode = !darkMode;
  document.body.classList.toggle('light', !darkMode);
  themeToggle.innerHTML = darkMode ? "<span>🌓</span> Theme" : "<span>🌞</span> Theme";
};
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
  document.body.classList.add('light');
  themeToggle.innerHTML = "<span>🌞</span> Theme";
  darkMode = false;
}

// --- Animated Personalized Greeting ---
function typeGreeting(text) {
  const el = document.getElementById('userGreeting');
  el.innerHTML = "";
  let i = 0;
  function type() {
    el.innerHTML = text.slice(0, i) + '<span class="type-cursor">|</span>';
    if (i < text.length) {
      i++;
      setTimeout(type, 60);
    } else {
      el.innerHTML = text + '<span class="type-cursor">|</span>';
    }
  }
  type();
}

// --- Announcements ---
let announcements = [];
db.collection("announcements").orderBy("date", "desc")
  .onSnapshot(snapshot => {
    announcements = [];
    snapshot.forEach(doc => announcements.push(doc.data()));
    renderAnnouncements(currentAnnFilter);
  });

let currentAnnFilter = "all";
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.onclick = function() {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentAnnFilter = btn.dataset.filter;
    renderAnnouncements(currentAnnFilter);
  };
});
function renderAnnouncements(filter = "all") {
  const feed = document.getElementById('announcementsFeed');
  feed.innerHTML = "";
  let filtered = announcements;
  if (filter === "today") {
    const today = new Date().toISOString().slice(0, 10);
    filtered = announcements.filter(a => a.date === today);
  } else if (filter === "high") {
    filtered = announcements.filter(a => a.priority === "high");
  }
  filtered.forEach(a => {
    const div = document.createElement('li');
    div.className = "announcement-card " + (a.priority || "");
    div.innerHTML = `
      <div class="announcement-left">
        <span class="priority">${a.priority ? a.priority.toUpperCase() : ""}</span>
        <span class="date">${a.date || ""}</span>
      </div>
      <div class="announcement-content">
        <div class="announcement-title">${a.title || ""}</div>
        <div class="announcement-desc">${a.desc || ""}</div>
      </div>
    `;
    feed.appendChild(div);
  });
}

// --- Schedule: Filter by user's subsection ---
function setActiveSubsectionBtn(sub) {
  document.querySelectorAll('.sub-btn').forEach(btn => {
    if (btn.dataset.sub === sub) btn.classList.add('active');
    else btn.classList.remove('active');
  });
}
document.querySelectorAll('.sub-btn').forEach(btn => {
  btn.onclick = function() {
    setActiveSubsectionBtn(btn.dataset.sub);
    renderSchedule(btn.dataset.sub);
  };
});

// --- UPDATED SCHEDULE RENDERING USING collectionGroup ---
function renderSchedule(subsection) {
  console.log(`Fetching schedule for subsection: ${subsection}`);
  
  db.collectionGroup('schedule')  // Using collectionGroup to query across all subcollections
    .where('subsection', '==', subsection)
    .orderBy('date', 'asc')
    .onSnapshot(
      (snapshot) => {
        console.log(`Received ${snapshot.size} schedule items`);
        const timeline = document.getElementById('scheduleTimeline');
        timeline.innerHTML = '';
        
        if (snapshot.empty) {
          console.log('No schedule items found');
          timeline.innerHTML = '<div class="schedule-item">No schedule found for this subsection.</div>';
          return;
        }
        
        snapshot.forEach(doc => {
          console.log('Schedule item:', doc.id, doc.data());
          const s = doc.data();
          const div = document.createElement('div');
          div.className = 'schedule-item';
          div.innerHTML = `
            <div class="schedule-time">${s.date || ''}${s.time ? ' ' + s.time : ''}</div>
            <div class="schedule-title">${s.title || ''}</div>
            <div class="schedule-desc">${s.desc || ''}</div>
            <div class="schedule-location">${s.location ? '📍 ' + s.location : ''}</div>
          `;
          timeline.appendChild(div);
        });
      },
      (error) => {
        console.error('Error fetching schedule:', error);
        const timeline = document.getElementById('scheduleTimeline');
        timeline.innerHTML = `<div class="schedule-item">Error loading schedule: ${error.message}</div>`;
      }
    );
}

// --- Resources ---
db.collection("resources").orderBy("uploadedAt", "desc")
  .onSnapshot(snapshot => {
    const list = document.getElementById('resourcesList');
    list.innerHTML = "";
    snapshot.forEach(doc => {
      const r = doc.data();
      const li = document.createElement('li');
      li.innerHTML = `<a href="${r.url}" target="_blank">${r.title}</a>`;
      list.appendChild(li);
    });
  });

// --- Gallery ---
db.collection("gallery").orderBy("uploadedAt", "desc")
  .onSnapshot(snapshot => {
    const carousel = document.getElementById('galleryCarousel');
    carousel.innerHTML = "";
    snapshot.forEach(doc => {
      const g = doc.data();
      const imgDiv = document.createElement('div');
      imgDiv.className = "gallery-img-card";
      imgDiv.innerHTML = `
        <img src="${g.imgUrl}" alt="${g.title || "Gallery"}" class="carousel-img"/>
        <div class="gallery-img-title">${g.title || ""}</div>
      `;
      carousel.appendChild(imgDiv);
    });
  });

// --- Events & Countdown ---
let events = [];
db.collection("events").orderBy("date", "asc")
  .onSnapshot(snapshot => {
    events = [];
    const list = document.getElementById('eventsList');
    list.innerHTML = "";
    snapshot.forEach(doc => {
      const e = doc.data();
      events.push(e);
      const li = document.createElement('li');
      li.innerHTML = `<span>${e.date || ""} ${e.time || ""}</span> <span>${e.title || ""}</span> <span>${e.desc || ""}</span>`;
      list.appendChild(li);
    });
    renderEventCountdown();
  });

function renderEventCountdown() {
  const timerEl = document.getElementById('eventCountdown');
  if (!events.length) {
    timerEl.textContent = "No upcoming events";
    return;
  }
  // Find the next event with a future date/time
  const now = new Date();
  let nextEvent = null;
  for (let e of events) {
    if (e.date) {
      const eventDate = new Date(`${e.date}T${e.time || "00:00"}:00`);
      if (eventDate > now) {
        nextEvent = eventDate;
        break;
      }
    }
  }
  if (!nextEvent) {
    timerEl.textContent = "No upcoming events";
    return;
  }
  function updateCountdown() {
    const now = new Date();
    const diff = nextEvent - now;
    if (diff <= 0) {
      timerEl.textContent = "Happening now!";
      return;
    }
    const days = Math.floor(diff / (1000*60*60*24));
    const hours = Math.floor((diff / (1000*60*60)) % 24);
    const mins = Math.floor((diff / (1000*60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    timerEl.textContent = `${days}d ${hours}h ${mins}m ${secs}s`;
    setTimeout(updateCountdown, 1000);
  }
  updateCountdown();
}

// --- Martian Daily Knowledge ---
const facts = [
  "Mars is home to the tallest mountain in the solar system, Olympus Mons.",
  "A year on Mars is 687 Earth days.",
  "Mars has two moons: Phobos and Deimos.",
  "Martian sunsets are blue.",
  "Mars is named after the Roman god of war."
];
function renderKnowledgeBubble() {
  const idx = Math.floor(Math.random() * facts.length);
  document.getElementById('knowledgeBubble').textContent = facts[idx];
}
renderKnowledgeBubble();

// --- Projects & Clubs (static for demo) ---
const projects = [
  { title: "Mars Rover Bridge", team: "Team Ares", status: "Ongoing" },
  { title: "Hydroponics Dome", team: "GreenMartians", status: "Completed" },
  { title: "Martian Habitat AI", team: "RedBrains", status: "Ongoing" },
  { title: "Mars Radio Club", team: "ComMartians", status: "Recruiting" }
];
function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = "";
  projects.forEach(p => {
    const div = document.createElement('div');
    div.className = "project-card";
    div.innerHTML = `<div class="project-title">${p.title}</div>
      <div class="project-team">${p.team}</div>
      <div class="project-status">${p.status}</div>`;
    grid.appendChild(div);
  });
}
renderProjects();

// --- Weather (static for demo) ---
document.getElementById('weatherWidget').innerHTML = `
  <span class="weather-icon">☀️</span>
  <span class="weather-temp">-60°C</span>
  <span class="weather-desc">Sunny, thin atmosphere</span>
`;

// --- Simplified Card Hover (No 3D tilt) ---
document.querySelectorAll('.float-card').forEach(card => {
  // Replace the mousemove event with simpler hover
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'scale(1.02)';
    card.style.boxShadow = "0 16px 64px #ff8a0033, 0 6px 32px #1a1a2e88, 0 0 24px #ff8a00cc";
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = "";
    card.style.boxShadow = "";
  });
});
