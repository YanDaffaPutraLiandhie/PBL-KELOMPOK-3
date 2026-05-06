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
    data?:
    | {
        id: string;
        fullname: string;
        email: string;
        role: RoleValue;
        status: StatusValue;
        createdAt: string;
    }
    | {
        id: string;
    }[]
    | {
        id: string;
    };
};

type RoleValue = "Operator" | "Viewer" | "Admin";
type StatusValue = "Aktif" | "Nonaktif";

const db = getFirestore(app);
const USERS_COLLECTION = "users";

function normalizeRole(role?: string): RoleValue {
    const normalizedRole = String(role || "").trim().toLowerCase();

    if (normalizedRole === "admin") return "Admin";
    if (normalizedRole === "operator") return "Operator";
    return "Viewer";
}

function normalizeStatus(status?: string): StatusValue {
    return status === "Nonaktif" ? "Nonaktif" : "Aktif";
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse>,
) {
    if (req.method !== "GET" && req.method !== "POST") {
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

    if (String(token.role || "").toLowerCase() !== "admin") {
        return res
            .status(403)
            .json({ status: false, message: "Forbidden" });
    }

    if (req.method === "GET") {
        try {
            const snapshot = await getDocs(collection(db, USERS_COLLECTION));
            const data = snapshot.docs.map((entry) => {
                const user = entry.data() as {
                    fullname?: string;
                    email?: string;
                    role?: string;
                    status?: string;
                    createdAt?: string;
                };

                return {
                    id: entry.id,
                    fullname: String(user.fullname || ""),
                    email: String(user.email || ""),
                    role: normalizeRole(user.role),
                    status: normalizeStatus(user.status),
                    createdAt: String(user.createdAt || ""),
                };
            });

            return res.status(200).json({
                status: true,
                message: "Daftar pengguna berhasil dimuat.",
                data,
            });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: "Terjadi kesalahan saat memuat pengguna.",
            });
        }
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
            status: normalizeStatus(status),
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
