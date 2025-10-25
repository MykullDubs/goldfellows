// In: /js/login.js

// 🚨 CRITICAL FIX: Ensure file name case exactly matches the filesystem.
// Assuming your file is exactly named 'firebaseconfig.js' (all lowercase)
import { auth, db } from './firebaseconfig.js'; 
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
        // 1. Sign In with Firebase Auth (uses 'auth' from firebaseconfig.js)
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Get user document from Firestore to check role (uses 'db' from firebaseconfig.js)
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);

        let redirectUrl = '/dashboard.html'; // Default for student

        if (docSnap.exists()) {
            const userData = docSnap.data();
            const userRole = userData.role;

            console.log(`Login successful. User role: ${userRole}`); 

            if (userRole === 'instructor') {
                redirectUrl = '/instructor-dashboard.html';
            }

            // 3. Success! Redirect to the appropriate dashboard.
            window.location.href = redirectUrl;
        } else {
            // Safety catch for existing Auth users without a Firestore profile
            showError("User profile data not found. Please contact support.");
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
