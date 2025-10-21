// In: /js/login.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// --- Firebase Configuration ---
// This config is from your previous files.
const firebaseConfig = {
    apiKey: "AIzaSyDWpBbBLpq2fOnN5-EO3kmc0CHyG7DHXIM",
    authDomain: "elearning-e83cb.firebaseapp.com",
    projectId: "elearning-e83cb",
    storageBucket: "elearning-e83cb.appspot.com",
    messagingSenderId: "25473938624",
    appId: "1:25473938624:web:5b56738933543f32a7e925"
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- Get DOM Elements ---
const loginForm = document.getElementById('login-form');
const submitBtn = document.getElementById('submit-btn');
const errorMessage = document.getElementById('error-message');

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
            window.location.href = '/dashboard.html';
        })
        .catch((error) => {
            let message = 'An unknown error occurred.';
            // Handle common auth errors
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
            // Re-enable the button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Log In';
        });
});