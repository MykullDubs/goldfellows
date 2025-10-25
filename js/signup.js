// In: /js/signup.js
// IMPROVEMENT: Imports initialized services (auth, db) from the centralized config file.

// Import initialized services from the central configuration (goldfellows project)
import { auth, db } from './firebaseconfig.js'; 
// Import specific functions we need
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// REMOVED: Previous hardcoded firebaseConfig and initializeApp calls.

// Get form elements from your signup.html
const signupForm = document.getElementById('signup-form');
const submitBtn = document.getElementById('submit-btn');
// Assume an error message element exists on the signup page
const errorMessage = document.getElementById('error-message');

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;

    const displayName = signupForm.displayName.value;
    const email = signupForm.email.value;
    const password = signupForm.password.value;
    
    // Clear previous errors
    errorMessage.textContent = '';
    errorMessage.classList.add('hidden');

    try {
        // 1. Create the user in Firebase Auth (using 'auth' from firebaseconfig.js)
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Update their Auth profile
        await updateProfile(user, { displayName: displayName });

        // 3. Create their profile in Firestore (using 'db' from firebaseconfig.js)
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
            displayName: displayName,
            email: user.email,
            photoURL: '', 
            role: "student", // This is the crucial part for redirection
            cefrLevel: null, 
            currentClassId: null,
            createdAt: serverTimestamp()
        });
        
        // 4. Redirect to the dashboard
        window.location.href = 'dashboard.html';

    } catch (error) {
        console.error("Error signing up: ", error);
        submitBtn.disabled = false;
        
        let message = 'An unknown error occurred during sign up.';
        if (error.code === 'auth/email-already-in-use') {
            message = 'This email is already in use. Try logging in or use a different email.';
        } else if (error.code === 'auth/weak-password') {
            message = 'Password is too weak. Must be at least 6 characters.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'The email address is not valid.';
        }

        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }
});
