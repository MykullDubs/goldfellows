<!DOCTYPE html>
<html lang="en" class="">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instructor Dashboard - Golden Fellows English</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Source+Serif+Pro:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">

    <script>
        // Theme loader script
        if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    </script>
    
    <style>
        body { 
            font-family: 'Source Serif Pro', serif;
            background-color: #F7F5F2;
        }
        .dark body {
            background-color: #0F172A; /* Smokey Dark Blue/Slate */
        }
        .font-brand { font-family: 'Source Serif Pro', serif; }
        @keyframes slideUpFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: slideUpFadeIn 0.6s ease-out forwards; opacity: 0; }
    </style>
</head>
<body class="text-gray-900 dark:text-gray-200 antialiased">

    <div id="dashboard-content">
        <header class="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm border-b border-stone-200 dark:border-slate-800 sticky top-0 z-40">
            <div class="container mx-auto px-4 sm:px-6 md:px-8 py-4 flex justify-between items-center">
                <a href="instructor-dashboard.html" class="text-xl font-bold font-brand text-gray-900 dark:text-white">Golden Fellows English</a>
                <div class="flex items-center gap-4">
                    <span class="text-sm font-semibold text-teal-600 dark:text-teal-400">Instructor Portal</span>
                    <div class="relative">
                        <button id="profile-btn" class="flex items-center gap-2">
                             <span id="user-email-nav" class="text-sm text-stone-600 dark:text-stone-300 hidden sm:block font-brand">instructor@goldfellows.lat</span>
                            <div id="nav-avatar-container">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-stone-400 dark:text-stone-500" fill="currentColor" viewBox="0 0 16 16"><path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/><path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/></svg>
                            </div>
                        </button>
                        <div id="profile-dropdown" class="hidden absolute font-brand right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-stone-200 dark:border-gray-700 overflow-hidden z-10">
                            <a href="settings.html" class="block px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-gray-700">Settings</a>
                            <div class="border-t border-stone-200 dark:border-gray-600"></div>
                            <button id="logout-btn" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-stone-100 dark:hover:bg-gray-700">Log Out</button>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <main class="container mx-auto p-4 sm:p-6 md:p-8 max-w-7xl font-brand">
            <header class="mb-12 animate-in">
                <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">Welcome, <span id="user-name">Instructor</span>!</h1>
                <p class="text-gray-600 dark:text-gray-400 mt-3 text-lg">Here is your overview for Tuesday, September 30, 2025.</p>
            </header>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                <div class="lg:col-span-2 space-y-8">
                     <section class="animate-in" style="animation-delay: 100ms;">
                        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                            Feedback Queue
                            <span id="feedback-count" class="ml-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"></span>
                        </h2>
                        <div id="inbox-container" class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-stone-200/50 dark:border-slate-700/50 space-y-4">
                            </div>
                    </section>
                    <section class="animate-in" style="animation-delay: 200ms;">
                        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Today's Appointments</h2>
                         <div id="appointments-container" class="space-y-3">
                            </div>
                    </section>
                </div>
                
                <aside class="lg:col-span-1 space-y-8">
                    <section class="animate-in sticky top-24" style="animation-delay: 300ms;">
                        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Builder Tools</h2>
                        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-stone-200/50 dark:border-slate-700/50 space-y-4">
                            <a href="lesson-builder.html" class="block text-center bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg shadow-sm hover:bg-teal-700">
                                Lesson Builder
                            </a>
                            <a href="class-builder.html" class="block text-center bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-sm hover:bg-indigo-700">
                                Class Builder
                            </a>
                            <a href="forum-builder.html" class="block text-center bg-stone-500 text-white font-semibold py-3 px-6 rounded-lg shadow-sm hover:bg-stone-600">
                                Forum Builder
                            </a>
                        </div>
                    </section>
                </aside>
            </div>
        </main>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // --- Navbar Logic ---
            const profileBtn = document.getElementById('profile-btn');
            const profileDropdown = document.getElementById('profile-dropdown');
            const logoutBtn = document.getElementById('logout-btn');

            profileBtn.addEventListener('click', (e) => { e.stopPropagation(); profileDropdown.classList.toggle('hidden'); });
            window.addEventListener('click', () => { profileDropdown.classList.add('hidden'); });
            logoutBtn.addEventListener('click', () => { 
                console.log("Log out clicked"); 
                window.location.href = 'Login.html';
            });
            
            // --- Dashboard Population ---
            loadDashboard();
        });

        function loadDashboard() {
            // Populate user-specific elements with placeholder data
            document.getElementById('user-name').textContent = "Dr. Vance";
            document.getElementById('user-email-nav').textContent = "e.vance@goldfellows.lat";
            document.getElementById('nav-avatar-container').innerHTML = `<img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&q=80&w=400" class="w-8 h-8 rounded-full object-cover">`;
            
            // Fetch and render widgets (using mock data)
            fetchAndRenderFeedbackQueue();
            fetchAndRenderAppointments();
        }

        function fetchAndRenderFeedbackQueue() {
            const inboxContainer = document.getElementById('inbox-container');
            const feedbackCount = document.getElementById('feedback-count');
            
            const mockSubmissions = [
                { studentName: 'Alejandra V.', lessonTitle: 'A2 Speaking Task' },
                { studentName: 'Ben Carter', lessonTitle: 'B1 Writing Feedback' }
            ];

            if (mockSubmissions.length === 0) {
                inboxContainer.innerHTML = '<p class="text-center text-gray-500">Your feedback queue is empty. Great job!</p>';
                feedbackCount.classList.add('hidden');
                return;
            }

            feedbackCount.textContent = mockSubmissions.length;
            feedbackCount.classList.remove('hidden');
            
            inboxContainer.innerHTML = '';
            mockSubmissions.forEach(submission => {
                const itemEl = document.createElement('div');
                itemEl.className = 'flex justify-between items-center bg-stone-50 dark:bg-slate-900/50 p-4 rounded-lg';
                itemEl.innerHTML = `
                    <div>
                        <p class="font-bold">${submission.studentName}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">${submission.lessonTitle}</p>
                    </div>
                    <a href="#" class="bg-teal-600 text-white font-semibold px-4 py-2 text-sm rounded-lg hover:bg-teal-700">Review</a>
                `;
                inboxContainer.appendChild(itemEl);
            });
        }

        function fetchAndRenderAppointments() {
            const container = document.getElementById('appointments-container');

            const mockAppointments = [
                { studentName: 'Maria Garcia', time: '10:00 AM', lesson: 'B1 Conversation Practice' },
                { studentName: 'Chen Wei', time: '2:00 PM', lesson: 'B2 Writing Review' }
            ];

            if (mockAppointments.length === 0) {
                container.innerHTML = '<p class="text-center text-gray-500">No appointments scheduled for today.</p>';
                return;
            }

            container.innerHTML = mockAppointments.map(appt => `
                <div class.="bg-white/80 dark:bg-slate-800/80 p-4 rounded-xl border border-stone-200/50 dark:border-slate-700/50 flex items-center justify-between">
                    <div>
                        <p class="font-semibold">${appt.studentName}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">${appt.lesson}</p>
                    </div>
                    <span class="text-sm font-bold px-3 py-1 rounded-full bg-stone-100 dark:bg-slate-700">${appt.time}</span>
                </div>
            `).join('');
        }
    </script>
</body>
</html>