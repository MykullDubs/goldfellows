// In: /js/signup.js

// Import services from your central config file
import { auth, db } from './firebase-config.js';

// Import the specific Firebase functions you need *from the full CDN URL*
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- Get DOM Elements ---
const signupForm = document.getElementById('signup-form');
const submitBtn = document.getElementById('submit-btn');
const errorMessage = document.getElementById('error-message');

// --- Form Submit Event Listener ---
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const displayName = signupForm.displayName.value;
    const email = signupForm.email.value;
    const password = signupForm.password.value;

    errorMessage.textContent = '';
    errorMessage.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';

    try {
        // 1. Create the user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // 2. Update the user's Auth profile with their name
        await updateProfile(user, { 
            displayName: displayName 
        });

        // 3. Create a corresponding document in the 'users' collection in Firestore
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
            displayName: displayName,
            email: user.email,
            role: "student", 
            photoURL: '', 
            cefrLevel: null,
            currentClassId: null,
            createdAt: serverTimestamp()
        });
        
        // 4. Redirect to the dashboard on success
        window.location.href = 'dashboard.html';

    } catch (error) {
        let message = 'An unknown error occurred.';
        if (error.code === 'auth/email-already-in-use') {
            message = 'This email address is already registered.';
        } else if (error.code === 'auth/weak-password') {
            message = 'Password is too weak. Please use at least 6 characters.';
        } else {
            message = error.message;
        }
        
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
    }
});
