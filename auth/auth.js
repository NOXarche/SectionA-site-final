// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDlFYzg5Te2jz-kVKXd0yGYlJkMwU9fxss",
    authDomain: "ju-civil-a-martian.firebaseapp.com",
    projectId: "ju-civil-a-martian",
    storageBucket: "ju-civil-a-martian.firebasestorage.app",
    messagingSenderId: "247448010406",
    appId: "1:247448010406:web:a2efa79a4080513cc87e67",
    measurementId: "G-BXYMLKE395"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Admin roll numbers (10 specific 12-digit roll numbers)
const adminRollNumbers = [
    "123456789012",
    "234567890123",
    "345678901234",
    "456789012345",
    "567890123456",
    "678901234567",
    "789012345678",
    "890123456789",
    "901234567890",
    "012345678901"
];

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const successModal = document.getElementById('successModal');
const successMessage = document.getElementById('successMessage');
const successDoneBtn = document.getElementById('successDoneBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const registerPassword = document.getElementById('registerPassword');
const strengthSegments = document.querySelectorAll('.strength-segment');
const strengthText = document.querySelector('.strength-text');

// Theme Toggle
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
});

// Auth Tabs
authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabTarget = tab.getAttribute('data-tab');
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        authForms.forEach(form => form.classList.remove('active'));
        document.getElementById(tabTarget + 'Form').classList.add('active');
    });
});

// Toggle Password Visibility
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = btn.parentElement.querySelector('input');
        const icon = btn.querySelector('.material-icons');
        if (input.type === 'password') {
            input.type = 'text';
            icon.textContent = 'visibility';
        } else {
            input.type = 'password';
            icon.textContent = 'visibility_off';
        }
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        const toggleBtn = input.parentElement.querySelector(".toggle-password");
        input.addEventListener("input", function () {
            toggleBtn.style.display = input.value.length > 0 ? "inline-block" : "none";
        });
    });
});

// Password Strength Meter
registerPassword.addEventListener('input', () => {
    const password = registerPassword.value;
    const passwordStrengthContainer = document.querySelector('.password-strength');
    passwordStrengthContainer.style.display = password.length > 0 ? 'block' : 'none';
    const strength = checkPasswordStrength(password);
    strengthSegments.forEach(segment => segment.className = 'strength-segment');
    if (password.length === 0) {
        strengthText.textContent = 'Password strength';
        return;
    }
    if (strength === 'weak') {
        strengthSegments[0].classList.add('weak');
        strengthText.textContent = 'Weak';
    } else if (strength === 'medium') {
        strengthSegments[0].classList.add('medium');
        strengthSegments[1].classList.add('medium');
        strengthText.textContent = 'Medium';
    } else if (strength === 'strong') {
        strengthSegments[0].classList.add('strong');
        strengthSegments[1].classList.add('strong');
        strengthSegments[2].classList.add('strong');
        strengthText.textContent = 'Strong';
    } else if (strength === 'very-strong') {
        strengthSegments.forEach(segment => segment.classList.add('strong'));
        strengthText.textContent = 'Very Strong';
    }
});
function checkPasswordStrength(password) {
    const length = password.length;
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const criteria = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChars].filter(Boolean).length;
    if (length < 6) return 'weak';
    else if (length < 8 || criteria < 2) return 'medium';
    else if (length < 10 || criteria < 3) return 'strong';
    else return 'very-strong';
}

// Show Loading
function showLoading() { loadingOverlay.classList.add('active'); }
function hideLoading() { loadingOverlay.classList.remove('active'); }

// Show Success Modal
function showSuccessModal(message, isAdmin = false) {
    successMessage.textContent = message;
    successModal.classList.add('active');
    successDoneBtn.onclick = () => {
        window.location.href = isAdmin ? "/admin.html" : "/mainpage.html";
    };
}

// Show Error Message
function showErrorMessage(message) {
    const errorAlert = document.getElementById('error-alert');
    const backdrop = document.getElementById('backdrop');
    const alertMessageElement = errorAlert.querySelector('.alert-message');
    alertMessageElement.textContent = message;
    backdrop.classList.add('active');
    errorAlert.classList.add('show');
    setTimeout(() => {
        errorAlert.classList.remove('show');
        setTimeout(() => backdrop.classList.remove('active'), 500);
    }, 4000);
}

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const roll = document.getElementById('loginRoll').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!/^\d{12}$/.test(roll)) {
        showErrorMessage("Roll number must be 12 digits");
        return;
    }
    try {
        showLoading();
        const userDoc = await db.collection('users').doc(roll).get();
        if (!userDoc.exists) {
            hideLoading();
            showErrorMessage("Roll number not registered");
            return;
        }
        const userData = userDoc.data();
        if (userData.password !== password) {
            hideLoading();
            showErrorMessage("Incorrect password");
            return;
        }
        const isAdmin = adminRollNumbers.includes(roll);
        sessionStorage.setItem('userRoll', roll);
        sessionStorage.setItem('userName', userData.name || 'User');
        sessionStorage.setItem('userSubsection', userData.subsection || '');
        sessionStorage.setItem('userRole', userData.role || (isAdmin ? "admin" : "student"));
        hideLoading();
        showSuccessModal(isAdmin
            ? "Welcome to Admin Dashboard! You can now manage announcements, gallery, resources, and schedule."
            : "Login successful! Welcome back.",
            isAdmin
        );
    } catch (error) {
        hideLoading();
        showErrorMessage("Login failed: " + error.message);
        console.error(error);
    }
});

// Register
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value.trim();
    const roll = document.getElementById('registerRoll').value.trim();
    const subsection = document.getElementById('registerSubsection').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (!/^\d{12}$/.test(roll)) {
        showErrorMessage("Roll number must be 12 digits");
        return;
    }
    if (!subsection) {
        showErrorMessage("Please select a subsection");
        return;
    }
    if (password !== confirmPassword) {
        showErrorMessage("Passwords do not match");
        return;
    }
    if (password.length < 6) {
        showErrorMessage("Password must be at least 6 characters");
        return;
    }
    try {
        showLoading();
        const userDoc = await db.collection('users').doc(roll).get();
        if (userDoc.exists) {
            hideLoading();
            showErrorMessage("Roll number already registered");
            return;
        }
        const role = adminRollNumbers.includes(roll) ? "admin" : "student";
        await db.collection('users').doc(roll).set({
            name,
            roll,
            role,
            subsection,
            password
        });
        sessionStorage.setItem('userRoll', roll);
        sessionStorage.setItem('userName', name);
        sessionStorage.setItem('userSubsection', subsection);
        sessionStorage.setItem('userRole', role);
        hideLoading();
        showSuccessModal(
            role === "admin"
                ? "Account created successfully! You have admin privileges."
                : "Account created successfully!",
            role === "admin"
        );
    } catch (error) {
        hideLoading();
        showErrorMessage("Registration failed: " + error.message);
        console.error(error);
    }
});

// Mars Background Animation
function drawMarsScene() {
    const canvas = document.getElementById('mars-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    // Mars
    const marsX = w * 0.8;
    const marsY = h * 0.85;
    const marsR = Math.min(w, h) * 0.13;
    ctx.save();
    const grad = ctx.createRadialGradient(marsX, marsY, marsR * 0.2, marsX, marsY, marsR);
    grad.addColorStop(0, "#ff9652");
    grad.addColorStop(0.8, "#b22222");
    grad.addColorStop(1, "#7a1c1c");
    ctx.beginPath();
    ctx.arc(marsX, marsY, marsR, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.shadowColor = "#ff6f3c";
    ctx.shadowBlur = 40;
    ctx.fill();
    ctx.restore();

    // Mars craters
    for (let i = 0; i < 7; i++) {
        const angle = Math.random() * Math.PI;
        const r = marsR * (0.4 + Math.random() * 0.4);
        const x = marsX + Math.cos(angle) * r * 0.7;
        const y = marsY + Math.sin(angle) * r * 0.5;
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, marsR * (0.06 + Math.random() * 0.04), 0, Math.PI * 2);
        ctx.fillStyle = "rgba(120,40,40,0.22)";
        ctx.fill();
        ctx.restore();
    }

    // Mars moons
    const now = Date.now() / 1000;
    for (let i = 0; i < 2; i++) {
        const moonR = marsR * (0.12 + 0.07 * i);
        const angle = now * (0.7 + i * 1.3) + i * Math.PI;
        const x = marsX + Math.cos(angle) * (marsR * (1.7 + i * 0.5));
        const y = marsY + Math.sin(angle) * (marsR * (1.3 + i * 0.4));
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, moonR, 0, Math.PI * 2);
        ctx.fillStyle = i === 0 ? "#e4e4e4" : "#b0aeb1";
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
    }

    // Twinkling stars
    for (let i = 0; i < 70; i++) {
        const sx = Math.random() * w;
        const sy = Math.random() * h * 0.7;
        const sr = Math.random() * 1.3 + 0.3;
        ctx.save();
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.globalAlpha = 0.7 + 0.3 * Math.sin(now * 2 + i);
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
    }
}
function animateMars() {
    drawMarsScene();
    requestAnimationFrame(animateMars);
}
window.addEventListener('resize', drawMarsScene);
document.addEventListener('DOMContentLoaded', animateMars);
