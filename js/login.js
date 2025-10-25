// In: /js/login.js
// IMPROVEMENT: Imports auth and db from the centralized config file.

// NOTE: We replace the three generic imports below with a single import from the local file:
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Import initialized services from the central configuration (goldfellows project)
import { auth, db } from './firebaseconfig.js'; 
// Import specific functions we need
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// REMOVED: All hardcoded firebaseConfig and initializeApp calls, as they were using the wrong project ('elearning-e83cb')

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
        // 1. Sign In with Firebase Auth (using 'auth' imported from firebaseconfig.js)
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Get user document from Firestore to check role (using 'db' imported from firebaseconfig.js)
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);

        let redirectUrl = '/dashboard.html'; // Default for student

        if (docSnap.exists()) {
            const userData = docSnap.data();
            const userRole = userData.role;

            console.log(`Login successful. User role: ${userRole}`); // Helpful for debugging

            if (userRole === 'instructor') {
                redirectUrl = '/instructor-dashboard.html';
            }

            // 3. Success! Redirect to the appropriate dashboard.
            window.location.href = redirectUrl;
        } else {
            // This is a safety catch: Auth user exists, but no Firestore doc.
            showError("User profile data not found. Please contact support.");
            // If the profile is missing, you might want to sign them out here.
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
        } else if (error.code === 'auth/too-many-requests') {
             message = 'Access temporarily blocked due to too many failed login attempts. Try again later.';
        }

        showError(message);
    }
});
