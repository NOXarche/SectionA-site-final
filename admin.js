// Firebase config
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

document.getElementById('gotoMainBtn').onclick = () => window.location.href = "mainpage.html";

// --- Alert Helper ---
function showAlert(msg, color="#ff4040") {
  const alert = document.getElementById('adminAlert');
  alert.textContent = msg;
  alert.style.background = color;
  alert.classList.add('show');
  setTimeout(() => alert.classList.remove('show'), 3500);
}

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

// --- ANNOUNCEMENT FORM ---
document.getElementById('announcementForm').onsubmit = async function(e) {
  e.preventDefault();
  const title = document.getElementById('annTitle').value.trim();
  const desc = document.getElementById('annDesc').value.trim();
  const date = document.getElementById('annDate').value;
  const priority = document.getElementById('annPriority').value;
  if (!title || !desc || !date || !priority) return showAlert("All fields required!");
  try {
    await db.collection('announcements').add({ title, desc, date, priority });
    showAlert("Announcement uploaded!", "#1bbf3b");
    this.reset();
  } catch (err) {
    showAlert("Error: " + err.message);
  }
};

// --- GALLERY FORM (URL only) ---
document.getElementById('galleryForm').onsubmit = async function(e) {
  e.preventDefault();
  const title = document.getElementById('galleryTitle').value.trim();
  const imgUrl = document.getElementById('galleryImgUrl').value.trim();
  if (!title || !imgUrl) return showAlert("All fields required!");
  try {
    await db.collection('gallery').add({ title, imgUrl, uploadedAt: new Date().toISOString() });
    showAlert("Gallery image URL saved!", "#1bbf3b");
    this.reset();
  } catch (err) {
    showAlert("Error: " + err.message);
  }
};

// --- RESOURCE FORM (URL only) ---
document.getElementById('resourceForm').onsubmit = async function(e) {
  e.preventDefault();
  const title = document.getElementById('resourceTitle').value.trim();
  const url = document.getElementById('resourceUrl').value.trim();
  if (!title || !url) return showAlert("All fields required!");
  try {
    await db.collection('resources').add({ title, url, uploadedAt: new Date().toISOString() });
    showAlert("Resource URL saved!", "#1bbf3b");
    this.reset();
  } catch (err) {
    showAlert("Error: " + err.message);
  }
};

// --- SCHEDULE FORM ---
document.getElementById('scheduleForm').onsubmit = async function(e) {
  e.preventDefault();
  const title = document.getElementById('scheduleTitle').value.trim();
  const desc = document.getElementById('scheduleDesc').value.trim();
  const date = document.getElementById('scheduleDate').value;
  const time = document.getElementById('scheduleTime').value;
  const location = document.getElementById('scheduleLocation').value.trim();
  const subsection = document.getElementById('scheduleSubsection').value;
  if (!title || !desc || !date || !time || !location || !subsection) return showAlert("All fields required!");
  try {
    await db.collection('schedule').add({ title, desc, date, time, location, subsection });
    showAlert("Schedule uploaded!", "#1bbf3b");
    this.reset();
  } catch (err) {
    showAlert("Error: " + err.message);
  }
};

// --- EVENTS FORM (for events collection) ---
document.getElementById('eventsForm').onsubmit = async function(e) {
  e.preventDefault();
  const title = document.getElementById('eventsTitle').value.trim();
  const desc = document.getElementById('eventsDesc').value.trim();
  const date = document.getElementById('eventsDate').value;
  const time = document.getElementById('eventsTime').value;
  if (!title || !date || !time) return showAlert("All fields required!");
  try {
    await db.collection('events').add({ title, desc, date, time });
    showAlert("Event uploaded!", "#1bbf3b");
    this.reset();
  } catch (err) {
    showAlert("Error: " + err.message);
  }
};
