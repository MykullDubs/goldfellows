// In: /js/firebase-config.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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
