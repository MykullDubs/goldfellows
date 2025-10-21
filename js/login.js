// In: /js/login.js

// Import the 'auth' service from your central config file
import { auth } from './firebase-config.js';

// Import the specific auth functions you need
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// --- Get DOM Elements ---
const loginForm = document.getElementById('login-form');
const submitBtn = document.getElementById('submit-btn');
const errorMessage = document.getElementById('error-message');

// --- Auth State Check ---
// If the user is already logged in, redirect them to the dashboard.
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is already logged in. Redirecting to dashboard.");
        window.location.href = 'dashboard.html';
    } else {
        // User is signed out, show the login form (or do nothing)
        console.log("No user signed in. Login page is ready.");
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

    // --- Sign In with Firebase ---
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Success! Redirect to the dashboard.
            window.location.href = 'dashboard.html';
        })
        .catch((error) => {
            let message = 'An unknown error occurred.';
            
            // Handle common auth errors
            if (error.code === 'auth/invalid-credential' || 
                error.code === 'auth/user-not-found' || 
                error.code === 'auth/wrong-password' ||
                error.code === 'auth/invalid-email') {
                message = 'Invalid email or password. Please try again.';
            } else {
                message = error.message; // For other errors like network issues
            }
            
            errorMessage.textContent = message;
            errorMessage.classList.remove('hidden');
        })
        .finally(() => {
            // Re-enable the button whether login succeeded or failed
            submitBtn.disabled = false;
            submitBtn.textContent = 'Log In';
        });
});