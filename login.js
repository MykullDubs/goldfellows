// In: /js/login.js

// Import only the 'auth' service from your central config file
import { auth } from './firebase-config.js';

// Import the specific auth functions you need *from the full CDN URL*
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// --- Get DOM Elements ---
const loginForm = document.getElementById('login-form');
const submitBtn = document.getElementById('submit-btn');
const errorMessage = document.getElementById('error-message');

// --- Auth State Check ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is already logged in. Redirecting to dashboard.");
        window.location.href = 'dashboard.html';
    }
});

// --- Form Submit Event Listener ---
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = loginForm.email.value;
    const password = loginForm.password.value;

    errorMessage.textContent = '';
    errorMessage.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging In...';

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            window.location.href = 'dashboard.html';
        })
        .catch((error) => {
            let message = 'An unknown error occurred.';
            if (error.code === 'auth/invalid-credential' || 
                error.code === 'auth/user-not-found' || 
                error.code === 'auth/wrong-password' ||
                error.code === 'auth/invalid-email') {
                message = 'Invalid email or password. Please try again.';
            }
            errorMessage.textContent = message;
            errorMessage.classList.remove('hidden');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Log In';
        });
});
