// Firebase Configuration for PROJECT WALA
// To use this, create a project at https://console.firebase.google.com/
// Then copy your web app's config here.

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

// We will use a flag to switch between Firebase and LocalStorage for development
const USE_FIREBASE = false; // Set to true once you've added your config above

// Initialize Firebase (only if USE_FIREBASE is true)
let db;
if (USE_FIREBASE) {
    // These scripts should be included in your HTML files:
    // <script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js"></script>
    // <script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js"></script>

    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
}
