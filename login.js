// In: /js/login.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
const db = getFirestore(app); // Initialize Firestore

// --- Get DOM Elements ---
const loginForm = document.getElementById('login-form');
const submitBtn = document.getElementById('submit-btn');
const errorMessage = document.getElementById('error-message');

// Helper function to show a custom error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Log In';
}

// --- Form Submit Event Listener ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = loginForm.email.value;
    const password = loginForm.password.value;

    errorMessage.textContent = '';
    errorMessage.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging In...';

    try {
        // 1. Sign In with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Get user document from Firestore to check role
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);

        let redirectUrl = '/dashboard.html'; // Default for student

        if (docSnap.exists()) {
            const userData = docSnap.data();
            const userRole = userData.role;

            if (userRole === 'instructor') {
                redirectUrl = '/instructor-dashboard.html';
            }
            // For students ('role: "student"'), the default URL is used.

            // 3. Success! Redirect to the appropriate dashboard.
            window.location.href = redirectUrl;
        } else {
            // This is a safety catch: Auth user exists, but no Firestore doc.
            showError("User profile data not found. Please contact support.");
            // OPTIONAL: Force sign out here if you want to prevent them from staying logged in without a profile.
            // await auth.signOut();
        }

    } catch (error) {
        console.error("Login failed: ", error);
        let message = 'An unknown error occurred.';
        
        // Handle common auth errors
        if (error.code === 'auth/invalid-credential' || 
            error.code === 'auth/user-not-found' || 
            error.code === 'auth/wrong-password' ||
            error.code === 'auth/invalid-email') {
            message = 'Invalid email or password. Please try again.';
        } else if (error.code === 'auth/network-request-failed') {
             message = 'Network error. Check your connection.';
        }

        showError(message);
    }
});
