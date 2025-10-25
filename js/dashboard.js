// In: /js/dashboard.js (NEW FILE)

// Import the services you need from your central config
import { auth, db } from './firebase-config.js'; 
// Import the Firebase functions you'll use
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- NOTE: No firebaseConfig or initializeApp here! ---
// That's already handled by firebase-config.js

const levelColors = { A1: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', A2: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', B1: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300', B2: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' };

const events = [ 
    { date: '2025-09-29', time: '5:00 PM', title: 'B2 Writing Feedback Session' }, 
    { date: '2025-10-01', time: '10:00 AM', title: 'B1 Grammar Workshop' }
];

function renderScheduleWidget() {
    const container = document.getElementById('schedule-widget-list');
    if (!container) return;
    const today = new Date('2025-09-29T00:00:00'); // Set to Sept 29 for demo
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = events.filter(event => new Date(event.date + 'T00:00:00') >= today).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 3);

    if (upcomingEvents.length > 0) {
        container.innerHTML = upcomingEvents.map(event => {
            const eventDate = new Date(event.date + 'T00:00:00');
            const isToday = eventDate.getTime() === today.getTime();
            const dateLabel = isToday ? 'Today' : eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            return `<div class="flex items-start gap-4"><div class="flex-shrink-0 w-12 text-center bg-stone-100 dark:bg-slate-700 p-2 rounded-lg"><p class="font-bold text-sm">${isToday ? 'TODAY' : eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</p><p class="text-xl font-bold">${eventDate.getDate()}</p></div><div><p class="font-semibold">${event.title}</p><p class="text-sm text-gray-500 dark:text-gray-400">${dateLabel} at ${event.time}</p></div></div>`;
        }).join('');
    } else {
        container.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400">No upcoming classes.</p>`;
    }
}

const profileBtn = document.getElementById('profile-btn');
const profileDropdown = document.getElementById('profile-dropdown');
const logoutBtn = document.getElementById('logout-btn');
profileBtn.addEventListener('click', (e) => { e.stopPropagation(); profileDropdown.classList.toggle('hidden'); });
window.addEventListener('click', () => { profileDropdown.classList.add('hidden'); });
logoutBtn.addEventListener('click', () => { signOut(auth); });

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is logged in, continue loading the page
        document.getElementById('user-email-nav').textContent = user.email;
