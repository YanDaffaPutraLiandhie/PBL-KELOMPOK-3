import type { NextApiRequest, NextApiResponse } from "next";
import { deleteDoc, doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import app from "@/utils/db/firebase";
import { getToken } from "next-auth/jwt";

type ApiResponse = {
    status: boolean;
    message: string;
    data?: {
        id: string;
        fullname: string;
        role: "Operator" | "Viewer";
        status: "Aktif" | "Nonaktif";
    };
};

const db = getFirestore(app);
const USERS_COLLECTION = "users";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse>,
) {
    if (req.method !== "DELETE" && req.method !== "PUT") {
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

    const { id } = req.query;

    if (!id || Array.isArray(id)) {
        return res.status(400).json({ status: false, message: "ID user tidak valid." });
    }

    try {
        const userRef = doc(db, USERS_COLLECTION, id);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
            return res
                .status(404)
                .json({ status: false, message: "Pengguna tidak ditemukan." });
        }

        const userData = userSnapshot.data() as { role?: string };
        if (String(userData.role || "").toLowerCase() === "admin") {
            return res
                .status(403)
                .json({
                    status: false,
                    message:
                        req.method === "DELETE"
                            ? "User Admin tidak boleh dihapus."
                            : "User Admin tidak boleh diubah.",
                });
        }

        if (req.method === "PUT") {
            const { fullname, role, status } = req.body as {
                fullname?: string;
                role?: string;
                status?: string;
            };

            const preparedName = String(fullname || "").trim();
            const preparedRole = role === "Operator" ? "Operator" : "Viewer";
            const preparedStatus = status === "Nonaktif" ? "Nonaktif" : "Aktif";

            if (!preparedName) {
                return res
                    .status(400)
                    .json({ status: false, message: "Nama user wajib diisi." });
            }

            await updateDoc(userRef, {
                fullname: preparedName,
                role: preparedRole,
                status: preparedStatus,
                updatedAt: new Date().toISOString(),
            });

            return res.status(200).json({
                status: true,
                message: "Pengguna berhasil diperbarui.",
                data: {
                    id,
                    fullname: preparedName,
                    role: preparedRole,
                    status: preparedStatus,
                },
            });
        }

        await deleteDoc(userRef);

        return res
            .status(200)
            .json({ status: true, message: "Pengguna berhasil dihapus." });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan saat menghapus pengguna.",
        });
    }
}
