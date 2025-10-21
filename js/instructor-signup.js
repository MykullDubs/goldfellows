// This file would be linked to your 'instructor-signup.html' page.
import { initializeApp } from "https-://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https-://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https-://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// ... (Firebase initialization) ...

const signupForm = document.getElementById('signup-form');
// ... (Get all form elements: fullName, email, password, bio, etc.)

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // ... (Get form values) ...

    try {
        // 1. Create Auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Update Auth profile
        await updateProfile(user, { displayName: fullName });

        // 3. Create Firestore profile with 'instructor' role
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
            displayName: fullName,
            email: user.email,
            photoURL: '', // Or a default instructor photo
            role: "instructor", // This is the crucial part
            bio: bio,
            specialties: specialties,
            createdAt: serverTimestamp()
        });
        
        // 4. Redirect to the instructor dashboard
        window.location.href = 'instructor-dashboard.html';

    } catch (error) {
        console.error("Instructor sign up failed:", error);
    }
});