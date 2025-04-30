// Firebase v9 compat (CDN)
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

// --- SESSION: Get roll from sessionStorage (from login/register) ---
const roll = sessionStorage.getItem('userRoll');
if (!roll) {
  window.location.href = "auth.html";
}

// --- Fetch and render user profile ---
let userDocRef = db.collection("users").doc(roll);
userDocRef.get().then(docSnap => {
  if (!docSnap.exists) {
    alert("Profile not found!");
    window.location.href = "auth.html";
    return;
  }
  renderProfile(docSnap.data());
});

// --- Go to main page ---
document.getElementById('gotoMainBtn').onclick = () => {
  window.location.href = "mainpage.html";
};

// --- Edit Name ---
document.getElementById('editNameBtn').onclick = () => {
  document.getElementById('editNameInput').value = document.getElementById('profileName').textContent;
  document.getElementById('editNameModal').classList.add('active');
};
document.getElementById('cancelEditName').onclick = () => document.getElementById('editNameModal').classList.remove('active');
document.getElementById('editNameForm').onsubmit = async function(e) {
  e.preventDefault();
  const newName = document.getElementById('editNameInput').value.trim();
  if (!newName) return alert("Name cannot be empty!");
  await userDocRef.update({ name: newName });
  document.getElementById('profileName').textContent = newName;
  document.getElementById('editNameModal').classList.remove('active');
  alert("Name updated!");
};

// --- Edit Subsection (inline) ---
const subsectionSpan = document.getElementById('profileSubsection');
const editSubsectionBtn = document.getElementById('editSubsectionBtn');
const subsectionSelect = document.getElementById('subsectionSelect');
const saveSubsectionBtn = document.getElementById('saveSubsectionBtn');
editSubsectionBtn.onclick = () => {
  subsectionSpan.style.display = "none";
  editSubsectionBtn.style.display = "none";
  subsectionSelect.value = subsectionSpan.textContent;
  subsectionSelect.style.display = "";
  saveSubsectionBtn.style.display = "";
};
saveSubsectionBtn.onclick = async () => {
  const newSub = subsectionSelect.value;
  await userDocRef.update({ subsection: newSub });
  subsectionSpan.textContent = newSub;
  subsectionSpan.style.display = "";
  editSubsectionBtn.style.display = "";
  subsectionSelect.style.display = "none";
  saveSubsectionBtn.style.display = "none";
  alert("Subsection updated!");
};

// --- Change Password Modal (local only, for demo) ---
document.getElementById('changePasswordBtn').onclick = () => document.getElementById('changePasswordModal').classList.add('active');
document.getElementById('cancelChangePassword').onclick = () => document.getElementById('changePasswordModal').classList.remove('active');
document.getElementById('changePasswordForm').onsubmit = async function(e) {
  e.preventDefault();
  const newPass = document.getElementById('newPassword').value;
  const confirmPass = document.getElementById('confirmPassword').value;
  if (newPass !== confirmPass) {
    alert("New passwords do not match!");
    return;
  }
  await userDocRef.update({ password: newPass });
  alert("Password changed!");
  document.getElementById('changePasswordModal').classList.remove('active');
};

// --- Floating Card 3D Animation ---
const floatCard = document.querySelector('.float-card');
if (floatCard) {
  floatCard.addEventListener('mousemove', (e) => {
    const rect = floatCard.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width/2;
    const y = e.clientY - rect.top - rect.height/2;
    floatCard.style.transform = `perspective(1200px) rotateY(${x/18}deg) rotateX(${-y/18}deg) scale(1.03)`;
    floatCard.style.boxShadow = "0 16px 64px #ff8a0033, 0 6px 32px #1a1a2e88, 0 0 24px #ff8a00cc";
  });
  floatCard.addEventListener('mouseleave', () => {
    floatCard.style.transform = "";
    floatCard.style.boxShadow = "";
  });
}

// --- Rocket Emoji Avatar and Profile Render ---
function renderProfile(data) {
  document.getElementById('profileName').textContent = data.name;
  document.getElementById('profileRoll').textContent = data.roll;
  document.getElementById('profileSubsection').textContent = data.subsection;
  document.getElementById('profileRole').textContent = data.role.charAt(0).toUpperCase() + data.role.slice(1);
  document.getElementById('profileAvatar').textContent = "🚀";
  document.getElementById('adminBadge').style.display = data.role === "admin" ? "" : "none";
}

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
