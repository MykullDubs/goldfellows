// In: /js/level-finder.js

import { auth, db } from './firebaseconfig.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- Configuration: The Escalating Difficulty Quiz Data ---
const QUIZ_DATA = [
    // A1/A2: Basic articles, possessives, simple present/past
    { id: 1, level: 'A1', sentence: 'She __ to school every morning.', answer: 'goes', options: ['goes', 'going', 'go'] },
    { id: 2, level: 'A2', sentence: 'We __ the film last night; it was good.', answer: 'watched', options: ['watch', 'watching', 'watched'] },
    { id: 3, level: 'A2', sentence: 'I need __ buy some new shoes.', answer: 'to', options: ['too', 'to', 'for'] },
    
    // B1: Conditionals, modals, present perfect
    { id: 4, level: 'B1', sentence: 'If I __ richer, I would travel the world.', answer: 'were', options: ['am', 'was', 'were'] },
    { id: 5, level: 'B1', sentence: 'They __ finished the report yet.', answer: "haven't", options: ["don't", "haven't", "hasn't"] },
    { id: 6, 'level': 'B1', sentence: 'This report must __ finished by Friday.', answer: 'be', options: ['is', 'be', 'done'] },
    
    // B2: Passive voice, advanced prepositions, reported speech, phrasal verbs
    { id: 7, level: 'B2', sentence: 'The concert __ postponed due to the heavy rain.', answer: 'was', options: ['is', 'was', 'were'] },
    { id: 8, level: 'B2', sentence: 'She apologized __ arriving late to the meeting.', answer: 'for', options: ['on', 'to', 'for'] },
    { id: 9, level: 'B2', sentence: 'The manager suggested __ down the project timeline.', answer: 'cutting', options: ['cut', 'to cut', 'cutting'] }
];

// --- DOM Elements ---
const quizContainer = document.getElementById('quiz-container');
const wordBank = document.getElementById('word-bank');
const submitQuizBtn = document.getElementById('submit-quiz-btn');
const resultsContainer = document.getElementById('results-container');
const estimatedLevelMessage = document.getElementById('estimated-level-message');
const loadingSpinner = document.getElementById('loading-spinner');

// --- State ---
let currentAuthUser = null;
let allOptions = []; // Combined unique options from all questions

// --- Drag and Drop Logic (Client-Side State Management) ---

// Stores the word currently being dragged
let draggedItem = null; 

// Stores the student's answers (Key: questionId, Value: wordText)
let studentAnswers = {}; 

function initializeDragAndDrop() {
    // Collect all unique options for the word bank
    allOptions = [...new Set(QUIZ_DATA.flatMap(q => q.options))]; 

    // Create question HTML and populate options
    QUIZ_DATA.forEach(q => {
        const questionEl = document.createElement('div');
        questionEl.className = 'p-4 border-l-4 border-indigo-400 bg-stone-50 dark:bg-slate-900 rounded-md shadow-sm';
        
        // Find the blank spot
        const parts = q.sentence.split('__');
        
        questionEl.innerHTML = `
            <p class="text-sm text-indigo-500 font-semibold mb-1">${q.level} Level</p>
            <p class="text-lg text-gray-700 dark:text-gray-300">
                ${parts[0]}
                <span data-question-id="${q.id}" class="drag-area inline-flex justify-center items-center w-24 h-8 px-2 align-middle text-base font-typewriter"></span>
                ${parts[1]}
            </p>
        `;
        quizContainer.appendChild(questionEl);
    });

    // Populate the Word Bank
    allOptions.forEach((option, index) => {
        const wordEl = document.createElement('span');
        wordEl.textContent = option;
        wordEl.id = `option-${index}`;
        wordEl.draggable = true;
        wordEl.className = 'draggable bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 font-semibold px-4 py-2 rounded-full shadow-sm transition hover:shadow-md';
        wordBank.appendChild(wordEl);
    });
    
    // Add event listeners
    document.querySelectorAll('.draggable').forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
    });

    document.querySelectorAll('.drag-area').forEach(dropArea => {
        dropArea.addEventListener('dragenter', handleDragEnter);
        dropArea.addEventListener('dragleave', handleDragLeave);
        dropArea.addEventListener('dragover', handleDragOver);
        dropArea.addEventListener('drop', handleDrop);
    });
    
    checkSubmitButton();
}

function handleDragStart(e) {
    draggedItem = e.target;
    // Store the ID of the dragged item
    e.dataTransfer.setData('text/plain', e.target.id);
    setTimeout(() => e.target.classList.add('opacity-40'), 0);
}

function handleDragOver(e) {
    e.preventDefault(); // Necessary to allow dropping
    e.currentTarget.classList.add('hovering');
}

function handleDragEnter(e) {
    e.preventDefault();
    e.currentTarget.classList.add('hovering');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('hovering');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('hovering');
    
    const dropArea = e.currentTarget;
    const questionId = dropArea.getAttribute('data-question-id');
    
    // Check if the drop area already has a word
    if (dropArea.children.length > 0) {
        // Return the existing word to the word bank
        const existingWord = dropArea.children[0];
        existingWord.classList.remove('dragged-item', 'opacity-40');
        existingWord.classList.add('draggable');
        wordBank.appendChild(existingWord);
    }
    
    // Move the new dragged item into the drop area
    if (draggedItem) {
        draggedItem.classList.remove('opacity-40', 'draggable');
        draggedItem.classList.add('dragged-item');
        dropArea.appendChild(draggedItem);
        
        // Update state
        studentAnswers[questionId] = draggedItem.textContent.trim();
        checkSubmitButton();
    }
}

function checkSubmitButton() {
    // Check if all questions have an answer
    const answeredCount = Object.keys(studentAnswers).length;
    if (answeredCount === QUIZ_DATA.length) {
        submitQuizBtn.disabled = false;
        submitQuizBtn.textContent = 'Submit Assessment (All Answers Placed)';
    } else {
        submitQuizBtn.disabled = true;
        submitQuizBtn.textContent = `Place ${QUIZ_DATA.length - answeredCount} words to submit`;
    }
}

// --- Scoring and Submission ---

function calculateScore() {
    let score = 0;
    QUIZ_DATA.forEach(q => {
        if (studentAnswers[q.id] === q.answer) {
            score++;
            // Optional: Mark correct answers visually
            document.querySelector(`[data-question-id="${q.id}"]`).classList.add('correct');
        } else {
            // Optional: Mark incorrect answers visually
            document.querySelector(`[data-question-id="${q.id}"]`).classList.add('incorrect');
        }
    });
    return score;
}

function determineLevel(score) {
    // Logic based on passing threshold (e.g., 66% pass rate per level)
    // A1/A2: Q1-3 (3 questions)
    // B1: Q4-6 (3 questions)
    // B2: Q7-9 (3 questions)
    
    const results = {
        score: score,
        level: 'A1',
        message: 'Great start! Your score suggests a solid foundational A1/A2 level. You\'ll begin with Core Fundamentals.'
    };

    if (score >= 4) { // Passed A1/A2 portion
        results.level = 'B1';
        results.message = 'Excellent job! Your grammar is strong enough for everyday B1 conversations and writing. You\'ll start with Intermediate Structures.';
    }
    if (score >= 7) { // Passed B1 portion
        results.level = 'B2';
        results.message = 'Outstanding! You demonstrated mastery of complex B2 grammar. You\'re ready for Advanced Fluency and professional tasks.';
    }
    if (score < 3) {
        results.level = 'A1';
        results.message = 'Welcome aboard! Your score suggests you are at the beginning of your journey. We will start with the very basics (A1).';
    }

    return results;
}

submitQuizBtn.addEventListener('click', async () => {
    if (!currentAuthUser) return;
    
    submitQuizBtn.disabled = true;
    submitQuizBtn.textContent = 'Calculating Level...';
    
    const finalScore = calculateScore();
    const result = determineLevel(finalScore);
    
    try {
        // 1. Update the user's document in Firestore with their estimated level
        const userDocRef = doc(db, "users", currentAuthUser.uid);
        await setDoc(userDocRef, {
            cefrLevel: result.level, // Store the determined level
            initialScore: finalScore,
            lastAssessmentDate: new Date(),
        }, { merge: true }); // Use merge: true to avoid overwriting existing fields like displayName, email, role.

        // 2. Display results
        estimatedLevelMessage.innerHTML = `<span class="font-bold text-4xl">${result.level}</span><br>${result.message}`;
        
        // Hide quiz, show results
        document.getElementById('quiz-container').classList.add('hidden');
        document.getElementById('word-bank-container').classList.add('hidden');
        submitQuizBtn.classList.add('hidden');
        resultsContainer.classList.remove('hidden');

    } catch (error) {
        console.error("Submission failed:", error);
        submitQuizBtn.textContent = 'Error: Failed to save results.';
        submitQuizBtn.disabled = false;
        alert('There was an error saving your results to the server. Please check your network and try again.');
    }
});

// --- Initialization ---

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentAuthUser = user;
        loadingSpinner.classList.add('hidden');
        initializeDragAndDrop();
    } else {
        window.location.href = 'index.html'; // Ensure user is logged in
    }
});
