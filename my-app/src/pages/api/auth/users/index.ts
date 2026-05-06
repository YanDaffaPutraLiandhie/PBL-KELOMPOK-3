import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { getToken } from "next-auth/jwt";
import {
    addDoc,
    collection,
    getDocs,
    getFirestore,
    query,
    where,
} from "firebase/firestore";
import app from "@/utils/db/firebase";

type ApiResponse = {
    status: boolean;
    message: string;
    data?: any;
};

type RoleValue = "Operator" | "Viewer";

const db = getFirestore(app);
const USERS_COLLECTION = "users";

function normalizeRole(role?: string): RoleValue {
    return role === "Operator" ? "Operator" : "Viewer";
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse>,
) {
    if (req.method !== "POST" && req.method !== "GET") {
        return res
            .status(405)
            .json({ status: false, message: "Method not allowed" });
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
        return res
            .status(401)
            .json({ status: false, message: "Unauthorized" });
    }

    // GET: Semua user yang sudah login bisa melihat daftar user
    if (req.method === "GET") {
        try {
            const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
            const users = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                password: undefined // Jangan kirim password ke frontend
            }));

            return res.status(200).json({
                status: true,
                message: "Berhasil mengambil data pengguna",
                data: users,
            });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: "Terjadi kesalahan saat mengambil data pengguna.",
            });
        }
    }

    // POST: Hanya Admin yang bisa membuat user baru
    if (String(token.role || "").toLowerCase() !== "admin") {
        return res
            .status(403)
            .json({ status: false, message: "Forbidden: Hanya Admin yang bisa menambah user" });
    }



    const { fullname, email, password, role, status } = req.body as {
        fullname?: string;
        email?: string;
        password?: string;
        role?: string;
        status?: string;
    };

    const preparedName = String(fullname || "").trim();
    const preparedEmail = String(email || "").trim().toLowerCase();
    const preparedPassword = String(password || "");

    if (!preparedName || !preparedEmail || !preparedPassword) {
        return res.status(400).json({
            status: false,
            message: "Nama, email, dan password wajib diisi.",
        });
    }

    if (preparedPassword.length < 6) {
        return res.status(400).json({
            status: false,
            message: "Password minimal 6 karakter.",
        });
    }

    try {
        const duplicateQuery = query(
            collection(db, USERS_COLLECTION),
            where("email", "==", preparedEmail),
        );
        const duplicateSnapshot = await getDocs(duplicateQuery);

        if (!duplicateSnapshot.empty) {
            return res
                .status(400)
                .json({ status: false, message: "Email sudah terdaftar." });
        }

        const hashedPassword = await bcrypt.hash(preparedPassword, 10);
        const docRef = await addDoc(collection(db, USERS_COLLECTION), {
            fullname: preparedName,
            email: preparedEmail,
            password: hashedPassword,
            role: normalizeRole(role),
            status: status === "Nonaktif" ? "Nonaktif" : "Aktif",
            createdAt: new Date().toISOString(),
            source: "management",
        });

        return res.status(201).json({
            status: true,
            message: "Pengguna berhasil ditambahkan.",
            data: { id: docRef.id },
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan saat menambahkan pengguna.",
        });
    }
}
