/**
 * PROJECT WALA - Firebase Initializer
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

// GLOBAL DB ACCESS
window.USE_FIREBASE = true;
window.db = null;

try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        window.db = firebase.firestore();
        console.log("🔥 Firebase Ready");
    } else {
        console.error("Firebase scripts not loaded!");
    }
} catch (e) {
    console.error("Firebase Init Error:", e);
}
