// --- Dynamic Falling Stars ---
function spawnFallingStar() {
  const star = document.createElement('div');
  star.className = 'falling-star';
  star.style.left = `${Math.random() * 100}vw`;
  star.style.top = `${Math.random() * 10}vh`;
  star.style.opacity = Math.random() * 0.5 + 0.5;
  star.style.width = `${1.5 + Math.random() * 2}px`;
  star.style.height = `${18 + Math.random() * 18}px`;
  document.body.appendChild(star);
  setTimeout(() => star.remove(), 2600);
}
setInterval(spawnFallingStar, 300);

// --- Parallax Zoom/Scroll ---
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) document.body.classList.add('scrolled');
  else document.body.classList.remove('scrolled');
});

// --- Floating Card 3D Animation ---
document.querySelectorAll('.float-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width/2;
    const y = e.clientY - rect.top - rect.height/2;
    card.style.transform = `perspective(1200px) rotateY(${x/18}deg) rotateX(${-y/18}deg) scale(1.03)`;
    card.style.boxShadow = "0 16px 64px #ff8a0033, 0 6px 32px #1a1a2e88, 0 0 24px #ff8a00cc";
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = "";
    card.style.boxShadow = "";
  });
});

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
  themeToggle.textContent = darkMode ? "🌑" : "☀️";
};
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
  document.body.classList.add('light');
  themeToggle.textContent = "☀️";
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
function renderSchedule(subsection) {
  db.collection('schedule')
    .where('subsection', '==', subsection)
    .orderBy('date', 'asc')
    .get().then(snapshot => {
      const timeline = document.getElementById('scheduleTimeline');
      timeline.innerHTML = '';
      snapshot.forEach(doc => {
        const s = doc.data();
        const div = document.createElement('div');
        div.className = 'schedule-item';
        div.innerHTML = `<span class="schedule-time">${s.date || ''}</span>
          <span>${s.title || ''}</span>
          <span class="schedule-location">${s.location || ''}</span>`;
        timeline.appendChild(div);
      });
    });
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
      li.innerHTML = `<span>${e.date || ""}</span> <span>${e.title || ""}</span> <span>${e.desc || ""}</span>`;
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
  // Find the next event with a future date
  const now = new Date();
  let nextEvent = null;
  for (let e of events) {
    if (e.date) {
      const eventDate = new Date(e.date + "T00:00:00");
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
