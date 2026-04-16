import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { db } from "@/utils/db/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc 
} from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { name } = req.body;
    const userEmail = session.user.email;

    // 1. CARI dokumen yang field 'email'-nya sama dengan email user sekarang
    const q = query(collection(db, "users"), where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ message: "User tidak ditemukan di database" });
    }

    // 2. Ambil ID dokumen yang ditemukan (si kode random itu)
    const userDoc = querySnapshot.docs[0];
    const userRef = doc(db, "users", userDoc.id);

    // 3. UPDATE dokumen tersebut
    await updateDoc(userRef, {
      fullname: name,
      updatedAt: new Date().toISOString(),
    });

    return res.status(200).json({ message: "Berhasil update!" });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}