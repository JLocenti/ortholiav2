import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyAinUtEWeYx8eAZtcHFDcPSvaH0wHbxbX0",
    authDomain: "ortholia-144f3.firebaseapp.com",
    projectId: "ortholia-144f3",
    storageBucket: "ortholia-144f3.firebasestorage.app",
    messagingSenderId: "911841482671",
    appId: "1:911841482671:web:c9b7625d4d56a39665415a",
    measurementId: "G-BNG4WDH4RP"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings
export const db = getFirestore(app);
enableIndexedDbPersistence(db).catch(function (err) {
    if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    }
    else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support persistence.');
    }
});

// Initialize other services
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
