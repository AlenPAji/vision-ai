import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth, getReactNativePersistence } from '@firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCT1jdLzzlApN4P3hcIedDnW2XaobWUmlk",
    authDomain: "hand-sign-6fbe1.firebaseapp.com",
    projectId: "hand-sign-6fbe1",
    storageBucket: "hand-sign-6fbe1.firebasestorage.app",
    messagingSenderId: "784531435657",
    appId: "1:784531435657:web:9d48b8f42f938eabe85658",
    measurementId: "G-KVSZJY8CBD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };