// This file would be linked to your 'signup.html' page.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = { /* ... your config ... */ };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Get form elements from your signup.html
const signupForm = document.getElementById('signup-form');
const submitBtn = document.getElementById('submit-btn');

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;

    const displayName = signupForm.displayName.value;
    const email = signupForm.email.value;
    const password = signupForm.password.value;

    try {
        // 1. Create the user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Update their Auth profile (this stores their name)
        await updateProfile(user, { displayName: displayName });

        // 3. Create their profile in Firestore (this stores their role)
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
            displayName: displayName,
            email: user.email,
            photoURL: '', // Start with an empty photo
            role: "student", // This is the crucial part
            cefrLevel: null, // To be set by the level-finder quiz
            currentClassId: null, // To be set by an instructor
            createdAt: serverTimestamp()
        });
        
        // 4. Redirect to the dashboard
        window.location.href = 'dashboard.html';

    } catch (error) {
        console.error("Error signing up: ", error);
        submitBtn.disabled = false;
        // You would show an error message to the user here
    }
});