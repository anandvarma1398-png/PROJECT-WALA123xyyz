/**
 * PROJECT WALA - Firebase Configuration
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

// GLOBAL SETTINGS
window.USE_FIREBASE = true;
window.db = null;

if (window.USE_FIREBASE) {
    try {
        firebase.initializeApp(firebaseConfig);
        window.db = firebase.firestore();
        console.log("✅ Firebase Connected Successfully");
    } catch (error) {
        console.error("❌ Firebase Init Error:", error);
        alert("Firebase failed to load. Check your internet or API keys.");
    }
}
