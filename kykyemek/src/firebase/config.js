import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyAhUbawosMOzB9e1p3JohYM8plHHqNT9R0",
    authDomain: "kykyemek-8cdbb.firebaseapp.com",
    databaseURL: "https://kykyemek-8cdbb-default-rtdb.firebaseio.com",
    projectId: "kykyemek-8cdbb",
    storageBucket: "kykyemek-8cdbb.firebasestorage.app",
    messagingSenderId: "615722362350",
    appId: "1:615722362350:web:95a43ec773bc6be88e1aff",
    measurementId: "G-TC5XDQVF49"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database }; 