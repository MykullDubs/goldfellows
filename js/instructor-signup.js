// In: /js/instructor-dashboard.js

import { auth, db } from './firebaseconfig.js'; 
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    doc, 
    getDoc, 
    collection, 
    query, 
    where, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- DOM Elements ---
const loader = document.getElementById('loader');
const dashboardContent = document.getElementById('dashboard-content');
const userNameEl = document.getElementById('user-name');
const userNameNavEl = document.getElementById('user-name-nav');
const navAvatarContainer = document.getElementById('nav-avatar-container');
const logoutBtn = document.getElementById('logout-btn');
const reviewContainer = document.getElementById('review-container');
const reviewCountEl = document.getElementById('review-count');
const classListWidget = document.getElementById('class-list-widget');

let currentInstructorId = null;

// --- Auth and Initialization ---

function setupNavigation() {
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    profileBtn.addEventListener('click', (e) => { e.stopPropagation(); profileDropdown.classList.toggle('hidden'); });
    window.addEventListener('click', () => { profileDropdown.classList.add('hidden'); });
    logoutBtn.addEventListener('click', () => { 
        signOut(auth)
            .then(() => { window.location.href = 'index.html'; })
            .catch(error => { console.error("Logout failed:", error); });
    });
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentInstructorId = user.uid;
        
        // 1. Fetch user data (role check)
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists() && docSnap.data().role === 'instructor') {
            const userData = docSnap.data();
            const displayName = userData.displayName || "Instructor";
            
            // Populate UI elements
            userNameEl.textContent = displayName;
            userNameNavEl.textContent = displayName;
            if (user.photoURL) { 
                navAvatarContainer.innerHTML = `<img src="${user.photoURL}" class="w-8 h-8 rounded-full object-cover">`; 
            }
            
            setupNavigation();
            await loadDashboardData();
            
            loader.classList.add('hidden');
            dashboardContent.classList.remove('hidden');
            
        } else {
            // User is authenticated but is not an instructor (security check)
            alert("Access Denied: You are not authorized as an instructor.");
            signOut(auth).then(() => { window.location.href = 'index.html'; });
        }
    } else { 
        window.location.href = 'index.html'; // Not logged in
    }
});

// --- Dashboard Data Loading ---

async function loadDashboardData() {
    // These two functions fetch live data for the new, useful widgets
    await fetchLevelFinderQueue();
    await fetchInstructorClasses();
    
    // Retain mock data for the general feedback queue for simplicity
    fetchAndRenderMockFeedbackQueue(); 
}

/** Fetches student submissions from the Level Finder Quest. */
async function fetchLevelFinderQueue() {
    reviewContainer.innerHTML = '';
    
    // Query submissions that are "Pending Review"
    const submissionsRef = collection(db, "levelSubmissions");
    const q = query(submissionsRef, where("status", "==", "Pending Review"));

    try {
        const querySnapshot = await getDocs(q);
        const submissions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (submissions.length === 0) {
            reviewContainer.innerHTML = '<p class="text-center text-gray-500">No student levels awaiting review. Great work!</p>';
            reviewCountEl.classList.add('hidden');
            return;
        }

        reviewCountEl.textContent = submissions.length;
        reviewCountEl.classList.remove('hidden');
        
        submissions.forEach(submission => {
            const itemEl = document.createElement('div');
            itemEl.className = 'flex justify-between items-center bg-stone-50 dark:bg-slate-900/50 p-4 rounded-lg';
            
            // Display score from the Vocabulary Match Quest
            const scoreDetail = submission.initialScore !== undefined ? `Score: ${submission.initialScore}/5` : 'Score: N/A';
            
            itemEl.innerHTML = `
                <div>
                    <p class="font-bold">${submission.displayName}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Vocabulary Quest - ${scoreDetail}</p>
                </div>
                <a href="review-page.html?uid=${submission.userId}" class="bg-indigo-600 text-white font-semibold px-4 py-2 text-sm rounded-lg hover:bg-indigo-700">Review</a>
            `;
            reviewContainer.appendChild(itemEl);
        });

    } catch (error) {
        console.error("Error fetching level submissions:", error);
        reviewContainer.innerHTML = '<p class="text-red-500 text-center">Failed to load review queue.</p>';
    }
}

/** Fetches classes created by the current instructor for the sidebar widget. */
async function fetchInstructorClasses() {
    if (!currentInstructorId) return;

    classListWidget.innerHTML = '<p class="text-center text-gray-500 text-sm">Loading classes...</p>';
    
    const classesRef = collection(db, "classes");
    const q = query(classesRef, where("instructorId", "==", currentInstructorId));

    try {
        const querySnapshot = await getDocs(q);
        const classes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (classes.length === 0) {
            classListWidget.innerHTML = '<p class="text-center text-gray-500 text-sm">No classes created.</p>';
            return;
        }

        classListWidget.innerHTML = classes.map(cls => `
            <div class="flex justify-between items-center p-3 bg-stone-100 dark:bg-slate-700/50 rounded-lg">
                <p class="font-semibold text-sm">${cls.className}</p>
                <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">${cls.cefrLevel}</span>
            </div>
        `).join('');

    } catch (error) {
        console.error("Error fetching classes:", error);
        classListWidget.innerHTML = '<p class="text-red-500 text-sm">Error loading classes.</p>';
    }
}

/** Placeholder function for the general feedback queue (can be replaced later). */
function fetchAndRenderMockFeedbackQueue() {
     const inboxContainer = document.getElementById('inbox-container');
     // Retain simple mock data
     const mockSubmissions = [
         { studentName: 'Alejandra V.', lessonTitle: 'B1 Writing Task' },
         { studentName: 'Ben Carter', lessonTitle: 'A2 Speaking Practice' }
     ];

     if (mockSubmissions.length === 0) {
         inboxContainer.innerHTML = '<div class="p-4 bg-stone-50 dark:bg-slate-900/50 rounded-lg text-center text-gray-500">No student assignments awaiting feedback.</div>';
         return;
     }

     inboxContainer.innerHTML = mockSubmissions.map(submission => `
         <div class="flex justify-between items-center bg-stone-50 dark:bg-slate-900/50 p-4 rounded-lg widget-card hover:shadow-lg">
             <div>
                 <p class="font-bold">${submission.studentName}</p>
                 <p class="text-sm text-gray-500 dark:text-gray-400">${submission.lessonTitle}</p>
             </div>
             <a href="#" class="bg-teal-600 text-white font-semibold px-4 py-2 text-sm rounded-lg hover:bg-teal-700">Review</a>
         </div>
     `).join('');
}
