// In: /js/firebase-config.js

// 🚨 CRITICAL FIX: Changed bare module specifiers to full CDN paths for browser compatibility.

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC69QGNtjrpJYAh9gmPYugU0094l9WCWtc",
  authDomain: "goldfellows.firebaseapp.com",
  projectId: "goldfellows",
  storageBucket: "goldfellows.firebasestorage.app",
  messagingSenderId: "967946291913",
  appId: "1:967946291913:web:c334bc48a6a4da5f385b18",
  measurementId: "G-PQ35XPY4YJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export all the Firebase services your app will use
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage, analytics };
