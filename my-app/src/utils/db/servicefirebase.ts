import {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    doc,
    query,
    addDoc,
    where,
    updateDoc,
    setDoc,
    orderBy,
    limit,
} from "firebase/firestore";
import app from "./firebase";

const db = getFirestore(app);

// Ambil semua produk
export async function retrieveProducts(collectionName: string) {
    const snapshot = await getDocs(collection(db, collectionName));
    const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
    return data;
}

// Ambil data berdasarkan ID
export async function retrieveDataByID(collectionName: string, id: string) {
    const snapshot = await getDoc(doc(db, collectionName, id));
    return snapshot.data();
}

// Fungsi untuk menyimpan log aktivitas
export async function saveLog(logData: { message: string; type: string; timestamp?: Date }) {
    try {
        const logEntry = {
            ...logData,
            timestamp: logData.timestamp || new Date(),
            createdAt: new Date().toISOString(),
        };
        await addDoc(collection(db, "logs"), logEntry);
        return { status: true, message: "Log berhasil disimpan" };
    } catch (error: any) {
        console.error("Error saving log:", error);
        return { status: false, message: error.message };
    }
}

// Fungsi untuk mengambil log aktivitas
export async function getLogs(limitCount: number = 100) {
    try {
        const q = query(collection(db, "logs"), orderBy("timestamp", "desc"), limit(limitCount));
        const querySnapshot = await getDocs(q);
        const logs = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date(doc.data().createdAt),
        }));
        return logs;
    } catch (error: any) {
        console.error("Error getting logs:", error);
        return [];
    }
}

// Ambil konfigurasi threshold (simpan di collection 'config', doc 'thresholds')
export async function getThresholdConfig() {
    try {
        const docRef = doc(db, "config", "thresholds");
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
            // Return sensible defaults if not set
            return {
                soilMoistureMin: 30,
                soilMoistureMax: 70,
                temperatureMin: 18,
                temperatureMax: 30,
                alertThreshold: 85,
            };
        }
        return snap.data();
    } catch (error: any) {
        console.error("Error getting threshold config:", error);
        return null;
    }
}

// Simpan atau perbarui konfigurasi threshold
export async function setThresholdConfig(data: any) {
    try {
        const docRef = doc(db, "config", "thresholds");
        await setDoc(docRef, data, { merge: true });
        return { status: true };
    } catch (error: any) {
        console.error("Error setting threshold config:", error);
        return { status: false, message: error.message };
    }
}