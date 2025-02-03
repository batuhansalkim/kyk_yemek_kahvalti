// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAhUbawosMOzB9e1p3JohYM8plHHqNT9R0",
    authDomain: "kykyemek-8cdbb.firebaseapp.com",
    projectId: "kykyemek-8cdbb",
    storageBucket: "kykyemek-8cdbb.appspot.com",
    messagingSenderId: "615722362350",
    appId: "1:615722362350:web:95a43ec773bc6be88e1aff",
    measurementId: "G-TC5XDQVF49",
    databaseURL: "https://kykyemek-8cdbb-default-rtdb.europe-west1.firebasedatabase.app"
});

const messaging = firebase.messaging();

// Arka planda bildirim alma
messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
}); 