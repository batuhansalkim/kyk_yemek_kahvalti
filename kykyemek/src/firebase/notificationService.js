import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { ref, set, get } from 'firebase/database';
import { database } from './config';

class NotificationService {
    constructor() {
        this.messaging = getMessaging();
        this.vapidKey = 'BIH7jnBIIOCHsqC0bsDN4zaec0gjMRD0h7TjGChizo_cOvImxk0rShAVA01qqadYx06gQI3LB-HOcTLsCxJd-S0';

        // Service Worker'ı kaydet
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/firebase-messaging-sw.js')
                .then((registration) => {
                    console.log('Service Worker başarıyla kaydedildi:', registration);
                })
                .catch((err) => {
                    console.error('Service Worker kaydedilemedi:', err);
                });
        }
    }

    // Bildirim izni iste ve token kaydet
    async requestPermission() {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const token = await getToken(this.messaging, {
                    vapidKey: this.vapidKey,
                    serviceWorkerRegistration: await navigator.serviceWorker.getRegistration()
                });
                await this.saveToken(token);
                await this.setupScheduledNotifications(token);
                console.log('Bildirim izni alındı ve token kaydedildi');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Bildirim izni alınamadı:', error);
            return false;
        }
    }

    // Zamanlanmış bildirimleri ayarla
    async setupScheduledNotifications(token) {
        try {
            const scheduledRef = ref(database, `scheduled_notifications/${token}`);
            await set(scheduledRef, {
                breakfast: {
                    hour: 7,
                    minute: 0,
                    enabled: true
                },
                dinner: {
                    hour: 16,
                    minute: 0,
                    enabled: true
                },
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            console.error('Zamanlanmış bildirimler ayarlanamadı:', error);
        }
    }

    // Token'ı veritabanına kaydet
    async saveToken(token) {
        try {
            const tokensRef = ref(database, 'notification_tokens');
            const snapshot = await get(tokensRef);
            const tokens = snapshot.val() || {};
            tokens[token] = {
                timestamp: new Date().toISOString(),
                preferences: {
                    breakfast: true,
                    dinner: true
                }
            };
            await set(tokensRef, tokens);
            console.log('Token başarıyla kaydedildi');
        } catch (error) {
            console.error('Token kaydedilemedi:', error);
        }
    }

    // Bildirim tercihlerini güncelle
    async updatePreferences(token, preferences) {
        try {
            const tokenRef = ref(database, `notification_tokens/${token}/preferences`);
            await set(tokenRef, preferences);
        } catch (error) {
            console.error('Tercihler güncellenemedi:', error);
        }
    }

    // Ön planda bildirim alma
    onForegroundMessage(callback) {
        onMessage(this.messaging, (payload) => {
            callback(payload);
        });
    }
}

export const notificationService = new NotificationService(); 