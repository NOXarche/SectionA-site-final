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

// Initialize Firebase
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

// Check for saved theme
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
        
        // Update active tab
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Hide all forms first
        authForms.forEach(form => {
            form.classList.remove('active');
        });
        
        // Show the corresponding form
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

// Show password toggle button when input has content
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
    
    // Reset all segments
    strengthSegments.forEach(segment => {
        segment.className = 'strength-segment';
    });
    
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
        strengthSegments.forEach(segment => {
            segment.classList.add('strong');
        });
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
    
    if (length < 6) {
        return 'weak';
    } else if (length < 8 || criteria < 2) {
        return 'medium';
    } else if (length < 10 || criteria < 3) {
        return 'strong';
    } else {
        return 'very-strong';
    }
}

// Show Loading
function showLoading() {
    loadingOverlay.classList.add('active');
}

// Hide Loading
function hideLoading() {
    loadingOverlay.classList.remove('active');
}

// Show Success Modal
function showSuccessModal(message, isAdmin = false) {
    successMessage.textContent = message;
    successModal.classList.add('active');
    
    // Set redirect based on user role
    successDoneBtn.onclick = () => {
        window.location.href = isAdmin ? 'admin.html' : 'mainpage.html';
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
        
        setTimeout(() => {
            backdrop.classList.remove('active');
        }, 500);
    }, 4000);
}

// Login Form Submit
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const roll = document.getElementById('loginRoll').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Validate roll number format (12 digits)
    if (!/^\d{12}$/.test(roll)) {
        showErrorMessage("Roll number must be 12 digits");
        return;
    }
    
    try {
        showLoading();
        
        // Check if user exists in Firestore
        const userDoc = await db.collection('users').doc(roll).get();
        
        if (!userDoc.exists) {
            hideLoading();
            showErrorMessage("Roll number not registered");
            return;
        }
        
        const userData = userDoc.data();
        
        // Check password
        if (userData.password !== password) {
            hideLoading();
            showErrorMessage("Incorrect password");
            return;
        }
        
        // Check if admin
        const isAdmin = adminRollNumbers.includes(roll);
        
        // Store user session
        sessionStorage.setItem('userRoll', roll);
        sessionStorage.setItem('userName', userData.name || 'User');
        sessionStorage.setItem('isAdmin', isAdmin);
        
        hideLoading();
        
        if (isAdmin) {
            showSuccessModal("Welcome to Admin Dashboard! You can now manage announcements, gallery, resources, and schedule.", true);
        } else {
            showSuccessModal("Login successful! Welcome back.");
        }
    } catch (error) {
        hideLoading();
        showErrorMessage("Login failed: " + error.message);
        console.error(error);
    }
});

// Register Form Submit
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value.trim();
    const roll = document.getElementById('registerRoll').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate roll number format (12 digits)
    if (!/^\d{12}$/.test(roll)) {
        showErrorMessage("Roll number must be 12 digits");
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
        
        // Check if roll number already exists
        const userDoc = await db.collection('users').doc(roll).get();
        
        if (userDoc.exists) {
            hideLoading();
            showErrorMessage("Roll number already registered");
            return;
        }
        
        // Save user to Firestore
        await db.collection('users').doc(roll).set({
            name,
            roll,
            password,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Check if admin
        const isAdmin = adminRollNumbers.includes(roll);
        
        // Store user session
        sessionStorage.setItem('userRoll', roll);
        sessionStorage.setItem('userName', name);
        sessionStorage.setItem('isAdmin', isAdmin);
        
        hideLoading();
        
        if (isAdmin) {
            showSuccessModal("Account created successfully! You have admin privileges.", true);
        } else {
            showSuccessModal("Account created successfully!");
        }
    } catch (error) {
        hideLoading();
        showErrorMessage("Registration failed: " + error.message);
        console.error(error);
    }
});

// Create animated code particles
function createCodeParticle() {
    const codeParticles = document.querySelector('.code-particles');
    const codeSymbols = [
        '{ code }', 
        '<div>', 
        'function()', 
        'if (true) {}', 
        '// comment', 
        'const x = 10;', 
        'return data;',
        'async await',
        'import React',
        '[1, 2, 3]'
    ];

    const particle = document.createElement('span');
    particle.className = 'code-particle';
    particle.textContent = codeSymbols[Math.floor(Math.random() * codeSymbols.length)];

    // Random positioning
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;

    // Random size
    particle.style.fontSize = `${Math.floor(10 + Math.random() * 8)}px`;

    // Set animation timing
    const duration = 5 + Math.random() * 10;
    const delay = Math.random() * 5;

    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;

    codeParticles.appendChild(particle);

    // Remove after animation completes
    setTimeout(() => {
        particle.remove();
    }, (duration + delay) * 1000);
}

// Create meteor animation
function createMeteor() {
    const meteorShower = document.querySelector('.meteor-shower');
    const meteor = document.createElement('div');
    meteor.className = 'meteor';
    
    // Random position and angle
    const startX = Math.random() * 100;
    const angle = 45 + Math.random() * 10;
    
    meteor.style.left = `${startX}%`;
    meteor.style.top = '0';
    meteor.style.transform = `rotate(${angle}deg)`;
    meteor.style.animationDuration = `${Math.random() * 2 + 1}s`;
    
    meteorShower.appendChild(meteor);
    
    // Remove after animation
    setTimeout(() => {
        meteor.remove();
    }, 3000);
}

// Initialize animations
document.addEventListener('DOMContentLoaded', function () {
    // Create initial code particles
    for (let i = 0; i < 15; i++) {
        createCodeParticle();
    }

    // Create new code particles at intervals
    setInterval(createCodeParticle, 2000);
    
    // Create meteors at intervals
    setInterval(createMeteor, 5000);
});
