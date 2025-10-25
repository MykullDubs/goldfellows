// In: /js/class-builder.js

import { auth, db } from './firebaseconfig.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs, 
    doc, 
    updateDoc,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- DOM Elements ---
const createClassForm = document.getElementById('create-class-form');
const createClassBtn = document.getElementById('create-class-btn');
const classListContainer = document.getElementById('class-list-container');
const unassignedStudentsList = document.getElementById('unassigned-students-list');
const formMessage = document.getElementById('form-message');

let currentInstructorId = null;
let unassignedStudents = []; // Cache student data

// --- Initialization & Auth Check ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        // NOTE: A production app should check if user.role === 'instructor'
        currentInstructorId = user.uid;
        loadClassData();
    } else {
        window.location.href = 'index.html'; // Redirect to login
    }
});

// --- Core Data Loading ---

async function loadClassData() {
    await fetchUnassignedStudents();
    await fetchInstructorClasses();
}

/** Fetches all students who have a CEFR level but are not assigned to a class. */
async function fetchUnassignedStudents() {
    unassignedStudentsList.innerHTML = '<p class="text-center text-gray-500 text-sm">Loading students...</p>';
    
    // Query: users where role === 'student' AND currentClassId === null AND cefrLevel != null
    const studentsRef = collection(db, "users");
    const q = query(studentsRef, 
        where("role", "==", "student"),
        where("currentClassId", "==", null) // Find unassigned students
        // NOTE: In a real app, you might only fetch students with a determined cefrLevel
    );

    try {
        const querySnapshot = await getDocs(q);
        unassignedStudents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (unassignedStudents.length === 0) {
            unassignedStudentsList.innerHTML = '<p class="text-center text-teal-600 text-sm font-semibold">All students are assigned!</p>';
            return;
        }

        renderUnassignedStudents();
    } catch (error) {
        console.error("Error fetching unassigned students:", error);
        unassignedStudentsList.innerHTML = '<p class="text-red-500 text-sm">Error loading students.</p>';
    }
}

/** Renders the list of unassigned students into the sidebar widget. */
function renderUnassignedStudents() {
    unassignedStudentsList.innerHTML = unassignedStudents.map(student => `
        <div id="student-${student.id}" class="flex justify-between items-center p-2 bg-stone-100 dark:bg-slate-700 rounded-lg">
            <div>
                <p class="font-semibold">${student.displayName}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Level: ${student.cefrLevel || 'Unknown'}</p>
            </div>
            <button data-student-id="${student.id}" 
                    data-level="${student.cefrLevel}"
                    class="assign-student-btn bg-indigo-500 text-white text-xs px-3 py-1 rounded-full hover:bg-indigo-600"
                    title="Assign to a class">
                Assign
            </button>
        </div>
    `).join('');
    
    document.querySelectorAll('.assign-student-btn').forEach(button => {
        button.addEventListener('click', handleAssignStudent);
    });
}


/** Fetches classes created by the current instructor. */
async function fetchInstructorClasses() {
    if (!currentInstructorId) return;

    const classesRef = collection(db, "classes");
    const q = query(classesRef, where("instructorId", "==", currentInstructorId));

    try {
        const querySnapshot = await getDocs(q);
        const classes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (classes.length === 0) {
            classListContainer.innerHTML = '<p class="text-center text-gray-500">No classes created yet. Use the form to start one!</p>';
            return;
        }

        renderClassList(classes);
    } catch (error) {
        console.error("Error fetching classes:", error);
        classListContainer.innerHTML = '<p class="text-red-500">Error loading classes.</p>';
    }
}

/** Renders the list of active classes and calls to get the roster for each. */
function renderClassList(classes) {
    classListContainer.innerHTML = '';
    classes.forEach(cls => {
        const classEl = document.createElement('div');
        classEl.className = 'p-5 rounded-xl shadow-md border border-stone-200 dark:border-slate-700/50 space-y-4';
        classEl.innerHTML = `
            <div class="flex justify-between items-center">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">${cls.className}</h3>
                <span class="text-sm font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">${cls.cefrLevel}</span>
            </div>
            <div id="roster-${cls.id}" class="roster-container border-t border-stone-200 dark:border-slate-700 pt-4 space-y-3">
                <p class="text-gray-500 text-sm">Loading roster...</p>
            </div>
            <button data-class-id="${cls.id}" data-class-name="${cls.className}" class="take-attendance-btn text-sm font-semibold text-teal-600 hover:text-teal-500">Take Attendance</button>
        `;
        classListContainer.appendChild(classEl);
        fetchClassRoster(cls.id); // Load roster dynamically
    });
}

/** Fetches students assigned to a specific class. */
async function fetchClassRoster(classId) {
    const rosterContainer = document.getElementById(`roster-${classId}`);
    rosterContainer.innerHTML = ''; // Clear 'Loading roster...'

    const studentsRef = collection(db, "users");
    const q = query(studentsRef, where("currentClassId", "==", classId));
    
    try {
        const querySnapshot = await getDocs(q);
        const roster = querySnapshot.docs.map(doc => doc.data());

        if (roster.length === 0) {
            rosterContainer.innerHTML = `<p class="text-gray-500 text-sm">No students assigned to this class.</p>`;
            return;
        }

        rosterContainer.innerHTML = `<p class="font-semibold text-sm mb-2">Roster (${roster.length} students):</p>`;
        roster.forEach(student => {
            const studentEl = document.createElement('div');
            studentEl.className = 'flex items-center justify-between p-2 bg-white dark:bg-slate-700/50 rounded-lg border border-stone-100 dark:border-slate-700';
            studentEl.innerHTML = `
                <p class="text-sm">${student.displayName} (${student.cefrLevel})</p>
                <span class="text-xs text-green-500">✓</span> `;
            rosterContainer.appendChild(studentEl);
        });

    } catch (error) {
        console.error(`Error fetching roster for ${classId}:`, error);
        rosterContainer.innerHTML = `<p class="text-red-500 text-sm">Failed to load roster.</p>`;
    }
}

// --- Event Handlers ---

createClassForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentInstructorId) return;

    createClassBtn.disabled = true;
    formMessage.textContent = '';

    const className = document.getElementById('className').value;
    const cefrLevel = document.getElementById('cefrLevel').value;

    try {
        const newClass = {
            className: className,
            cefrLevel: cefrLevel,
            instructorId: currentInstructorId,
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, "classes"), newClass);
        formMessage.textContent = `Class "${className}" created successfully!`;
        formMessage.classList.remove('text-red-500');
        formMessage.classList.add('text-teal-600');
        
        createClassForm.reset();
        loadClassData(); // Refresh the list
        
    } catch (error) {
        console.error("Error creating class:", error);
        formMessage.textContent = `Error creating class: ${error.message}`;
        formMessage.classList.remove('text-teal-600');
        formMessage.classList.add('text-red-500');
    } finally {
        createClassBtn.disabled = false;
    }
});


async function handleAssignStudent(e) {
    const studentId = e.currentTarget.getAttribute('data-student-id');
    const studentName = unassignedStudents.find(s => s.id === studentId)?.displayName || 'Student';
    
    // Simple alert-based class selection (In a production app, use a modal)
    const classId = prompt(`Assign ${studentName} to which Class ID? (e.g., Use the ID from one of your active classes)`);

    if (!classId) return;

    e.currentTarget.disabled = true;
    e.currentTarget.textContent = 'Assigning...';

    try {
        // 1. Update the student document's currentClassId
        const studentDocRef = doc(db, "users", studentId);
        await updateDoc(studentDocRef, {
            currentClassId: classId
        });
        
        // 2. Refresh the UI
        alert(`${studentName} successfully assigned.`);
        loadClassData();
        
    } catch (error) {
        console.error("Error assigning student:", error);
        alert(`Failed to assign student: ${error.message}`);
        e.currentTarget.disabled = false;
        e.currentTarget.textContent = 'Assign';
    }
}
