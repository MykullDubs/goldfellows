// In: /js/lesson-builder.js

import { auth, db } from './firebaseconfig.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    collection, 
    addDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- DOM Elements ---
const createLessonForm = document.getElementById('create-lesson-form');
const createLessonBtn = document.getElementById('create-lesson-btn');
const formMessage = document.getElementById('form-message');

let currentInstructorId = null;

// --- Initialization & Auth Check ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        // NOTE: A production app should check if user.role === 'instructor'
        currentInstructorId = user.uid;
    } else {
        window.location.href = 'index.html'; // Redirect to login
    }
});

// --- Event Handler ---

createLessonForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentInstructorId) return;

    createLessonBtn.disabled = true;
    formMessage.textContent = '';
    
    const lessonTitle = document.getElementById('lessonTitle').value;
    const cefrLevel = document.getElementById('cefrLevel').value;
    const lessonSummary = document.getElementById('lessonSummary').value;
    const lessonContent = document.getElementById('lessonContent').value;

    try {
        const newLesson = {
            title: lessonTitle,
            cefrLevel: cefrLevel,
            summary: lessonSummary,
            content: lessonContent, // Stored as Markdown text
            instructorId: currentInstructorId,
            published: true, // Auto-publish for simplicity
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, "lessons"), newLesson);
        
        formMessage.textContent = `Lesson "${lessonTitle}" (ID: ${docRef.id}) published successfully!`;
        formMessage.classList.remove('text-red-500');
        formMessage.classList.add('text-teal-600');
        
        createLessonForm.reset();
        
    } catch (error) {
        console.error("Error creating lesson:", error);
        formMessage.textContent = `Error publishing lesson: ${error.message}`;
        formMessage.classList.remove('text-teal-600');
        formMessage.classList.add('text-red-500');
    } finally {
        createLessonBtn.disabled = false;
    }
});
