// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD4Kwc2eJfCUYonwyVVOnJM98lrStJrcUo",
  authDomain: "doyouremember-pi.firebaseapp.com",
  projectId: "doyouremember-pi",
  storageBucket: "doyouremember-pi.firebasestorage.app",
  messagingSenderId: "35980860791",
  appId: "1:35980860791:web:0b473d58f1b154c6c9d572",
  measurementId: "G-LSHQT8Y1JT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);