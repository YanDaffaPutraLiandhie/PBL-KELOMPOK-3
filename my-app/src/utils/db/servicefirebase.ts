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
} from "firebase/firestore";
import app from "./firebase";
import bcrypt from "bcrypt";

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

// Fungsi Sign In untuk Next-Auth Credentials
export async function signIn(email: string) {
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
    return data.length > 0 ? data[0] : null;
}

// Fungsi Sign Up (Register Akun Baru)
export async function signUp(userData: any, callback: Function) {
    const q = query(collection(db, "users"), where("email", "==", userData.email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        return callback({ status: false, message: "Email sudah terdaftar" });
    }

    // Hash password & set default data
    userData.password = await bcrypt.hash(userData.password, 10);
    userData.role = "member";
    // Set default avatar for manual registrations
    if (!userData.image) {
        userData.image = "/avatar-head.svg";
    }
    userData.createdAt = new Date().toISOString();

    try {
        await addDoc(collection(db, "users"), userData);
        callback({ status: true, message: "Registrasi Berhasil" });
    } catch (error: any) {
        callback({ status: false, message: error.message });
    }
}

// Fungsi Login/Register otomatis via Google OAuth
export async function loginWithOAuth(userData: any, callback: any) {
    try {
        const q = query(collection(db, "users"), where("email", "==", userData.email));
        const querySnapshot = await getDocs(q);
        const data: any = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        if (data.length > 0) {
            // User lama: update data tanpa ganti role
            userData.role = data[0].role;
            await updateDoc(doc(db, "users", data[0].id), userData);
            callback({
                status: true,
                message: "Login Google Berhasil",
                data: userData,
            });
        } else {
            // User baru: simpan sebagai member
            userData.role = "member";
            userData.createdAt = new Date().toISOString();
            await addDoc(collection(db, "users"), userData);
            callback({
                status: true,
                message: "Register Google Berhasil",
                data: userData,
            });
        }
    } catch (error: any) {
        callback({
            status: false,
            message: "Gagal memproses data Google",
        });
    }
}