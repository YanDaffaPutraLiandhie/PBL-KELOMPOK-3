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