// In: /js/level-finder.js

import { auth, db } from './firebaseconfig.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- Configuration: The Vocabulary Match Data (Escalating Difficulty) ---
// Note: While the task itself is matching, the vocabulary difficulty implies the level.
const QUIZ_DATA = [
    // A2/B1: Common verbs/adjectives
    { id: 1, level: 'A2', definition: 'To start or begin an activity or conversation.', answer: 'INITIATE' },
    { id: 2, level: 'B1', definition: 'The capacity to have an effect on the character, development, or behavior of someone or something.', answer: 'INFLUENCE' },
    { id: 3, level: 'B1', definition: 'The quality of being accurate, truthful, or reliable.', answer: 'INTEGRITY' },
    // B2: More formal/academic vocabulary
    { id: 4, level: 'B2', definition: 'To solve a problem or resolve a difficulty.', answer: 'RESOLVE' },
    { id: 5, level: 'B2', definition: 'Existing or in effect, but not officially stated or recognized.', answer: 'TACIT' }
];

// Combine all answers to create the word bank
const WORD_BANK_OPTIONS = QUIZ_DATA.map(q => q.answer);

// --- DOM Elements ---
const quizContainer = document.getElementById('quiz-container');
const wordBank = document.getElementById('word-bank');
const submitQuizBtn = document.getElementById('submit-quiz-btn');
const resultsContainer = document.getElementById('results-container');
const estimatedLevelMessage = document.getElementById('estimated-level-message');
const loadingSpinner = document.getElementById('loading-spinner');

// --- State ---
let currentAuthUser = null;
let draggedItem = null; 
// Stores the student's answers (Key: questionId, Value: wordText)
let studentAnswers = {}; 

// --- Core Logic ---

function initializeDragAndDrop() {
    // 1. Create Question HTML (Definitions)
    quizContainer.innerHTML = ''; // Clear spinner
    QUIZ_DATA.forEach(q => {
        const questionEl = document.createElement('div');
        questionEl.className = 'grid grid-cols-5 gap-4 items-center p-4 bg-stone-50 dark:bg-slate-900 rounded-md shadow-sm';
        
        questionEl.innerHTML = `
            <div class="col-span-3 text-gray-700 dark:text-gray-300">
                <p class="text-sm text-indigo-500 font-semibold mb-1">${q.level} Vocabulary</p>
                <p class="text-base">${q.definition}</p>
            </div>
            <div class="col-span-2">
                <span data-question-id="${q.id}" class="drag-area inline-flex w-full h-10 px-2 rounded-lg text-base font-semibold"></span>
            </div>
        `;
        quizContainer.appendChild(questionEl);
    });

    // 2. Populate the Word Bank (Words)
    // Shuffle the options before displaying
    const shuffledOptions = [...WORD_BANK_OPTIONS].sort(() => Math.random() - 0.5);
    
    shuffledOptions.forEach((option, index) => {
        const wordEl = document.createElement('span');
        wordEl.textContent = option;
        wordEl.id = `word-option-${index}`;
        wordEl.draggable = true;
        wordEl.className = 'draggable bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 font-semibold px-4 py-2 rounded-full shadow-sm transition hover:shadow-md';
        wordBank.appendChild(wordEl);
    });
    
    // 3. Add Drag/Drop Event Listeners
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
    e.dataTransfer.setData('text/plain', e.target.id);
    setTimeout(() => e.target.classList.add('opacity-40'), 0);
}

function handleDragOver(e) {
    e.preventDefault(); 
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
    
    // Return existing word to the word bank if the drop area is already full
    if (dropArea.children.length > 0) {
        const existingWord = dropArea.children[0];
        existingWord.classList.remove('dragged-item', 'opacity-40');
        existingWord.classList.add('draggable');
        wordBank.appendChild(existingWord);
        delete studentAnswers[questionId]; // Clear old answer from state
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
    draggedItem = null;
}

function checkSubmitButton() {
    // Check if all 5 definitions have been matched
    const answeredCount = Object.keys(studentAnswers).length;
    if (answeredCount === QUIZ_DATA.length) {
        submitQuizBtn.disabled = false;
        submitQuizBtn.textContent = 'Submit Assessment (All Matches Placed)';
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
            // Optional: Visually confirm correct answer in the drag area
            document.querySelector(`[data-question-id="${q.id}"]`).classList.add('border-green-500');
        } else {
            document.querySelector(`[data-question-id="${q.id}"]`).classList.add('border-red-500');
        }
    });
    return score;
}

function determineLevel(score) {
    // 5 Questions total. Score determines estimated level.
    let level = 'A1';
    let message = 'Welcome aboard! Your vocabulary is foundational (A1). We will build your word bank from the very basics.';

    if (score >= 2) { // Passed basic A2/B1 vocabulary
        level = 'A2';
        message = 'Good recognition! Your vocabulary is strong enough for simple conversations (A2). We will start with basic fluency builders.';
    }
    if (score >= 3) { // Passed A2/B1 vocabulary well
        level = 'B1';
        message = 'Excellent job! You correctly identified most B1/B2 words. You are ready for Intermediate structures (B1).';
    }
    if (score >= 5) { // Perfect score, strong indication of B2 ability
        level = 'B2';
        message = 'Outstanding! Your near-perfect score demonstrates high-level vocabulary mastery. You\'re ready for Advanced Fluency (B2) and complex tasks.';
    }

    return { score, level, message };
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
            initialAssessment: finalScore,
            lastAssessmentDate: new Date(),
        }, { merge: true });

        // 2. Display results
        estimatedLevelMessage.innerHTML = `<span class="font-bold text-4xl">${result.level}</span><br>${result.message}`;
        
        // Hide quiz, show results
        quizContainer.parentNode.classList.add('hidden'); // Hides the quiz card content
        resultsContainer.classList.remove('hidden');

    } catch (error) {
        console.error("Submission failed:", error);
        submitQuizBtn.textContent = 'Error: Failed to save results.';
        submitQuizBtn.disabled = false;
        alert('There was an error saving your results to the server. Please check your network and try again. Error: ' + error.message);
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
