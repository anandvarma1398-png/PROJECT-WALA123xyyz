/**
 * PROJECT WALA - Firebase Configuration
 * CONNECTED TO GOOGLE CLOUD CONSOLE
 */

const firebaseConfig = {
    apiKey: "AIzaSyDU12lWas9YK-_MrwN1AePN0vUPCZawhLs",
    authDomain: "project-wala-92d4c.firebaseapp.com",
    projectId: "project-wala-92d4c",
    storageBucket: "project-wala-92d4c.firebasestorage.app",
    messagingSenderId: "991130415999",
    appId: "1:991130415999:web:cda18359a1a7ea14fbe04a",
    measurementId: "G-EHP4P8RBV4"
};

// Toggle to TRUE to use the Google Firebase Database
const USE_FIREBASE = true;

let db;
if (USE_FIREBASE) {
    try {
        // Initializing using the compat layer for easy HTML integration
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        console.log("✅ Project Wala is now connected to Google Firebase Console!");
    } catch (error) {
        console.error("❌ Firebase Initialization Error:", error);
    }
} else {
    console.log("Using LocalStorage Database (Offline Mode)");
}
