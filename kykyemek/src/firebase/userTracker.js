import { ref, onValue, set, get } from 'firebase/database';
import { database } from './config';

class UserTracker {
    constructor() {
        this.database = database;
        // Başlangıçta stats düğümünü oluştur
        this.initializeStats();
    }

    // Stats düğümünü başlat
    async initializeStats() {
        try {
            const statsRef = ref(this.database, 'stats');
            const snapshot = await get(statsRef);
            if (!snapshot.exists()) {
                await set(statsRef, {
                    activeUsers: 0,
                    totalVisits: 0
                });
            }
        } catch (error) {
            console.error('Stats başlatılamadı:', error);
        }
    }

    // Aktif kullanıcı sayısını artır
    async incrementActiveUsers() {
        try {
            const activeUsersRef = ref(this.database, 'stats/activeUsers');
            const snapshot = await get(activeUsersRef);
            const currentCount = snapshot.val() || 0;
            await set(activeUsersRef, currentCount + 1);
            console.log('Aktif kullanıcı artırıldı:', currentCount + 1);
        } catch (error) {
            console.error('Aktif kullanıcı sayısı artırılamadı:', error);
        }
    }

    // Aktif kullanıcı sayısını azalt
    async decrementActiveUsers() {
        try {
            const activeUsersRef = ref(this.database, 'stats/activeUsers');
            const snapshot = await get(activeUsersRef);
            const currentCount = snapshot.val() || 0;
            const newCount = Math.max(0, currentCount - 1);
            await set(activeUsersRef, newCount);
            console.log('Aktif kullanıcı azaltıldı:', newCount);
        } catch (error) {
            console.error('Aktif kullanıcı sayısı azaltılamadı:', error);
        }
    }

    // Toplam ziyaret sayısını artır
    async incrementTotalVisits() {
        try {
            const totalVisitsRef = ref(this.database, 'stats/totalVisits');
            const snapshot = await get(totalVisitsRef);
            const currentCount = snapshot.val() || 0;
            await set(totalVisitsRef, currentCount + 1);
            console.log('Toplam ziyaret artırıldı:', currentCount + 1);
        } catch (error) {
            console.error('Toplam ziyaret sayısı artırılamadı:', error);
        }
    }

    // İstatistikleri dinle
    listenToStats(callback) {
        const statsRef = ref(this.database, 'stats');
        onValue(statsRef, (snapshot) => {
            const stats = snapshot.val() || { activeUsers: 0, totalVisits: 0 };
            callback(stats);
        });
    }
}

export const userTracker = new UserTracker(); 