import { signUp } from '@/utils/db/servicefirebase-server';
import type { NextApiRequest, NextApiResponse } from 'next';

// Definisikan tipe respons agar tidak error di TypeScript
type Data = {
    status: boolean;
    message: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method === "POST") {
        const { email, fullname, password } = req.body;

        // Validasi input
        if (!email || !fullname || !password || password.length < 6) {
            return res.status(400).json({ 
                status: false,
                message: "Data tidak lengkap atau password kurang dari 6 karakter" 
            });
        }
        
        // Panggil fungsi signUp di servicefirebase
        await signUp(req.body, (result: { status: boolean, message: string }) => {
            if (result.status) {
                res.status(200).json({ status: true, message: result.message });
            } else {
                res.status(400).json({ status: false, message: result.message });
            }
        });
    } else {
        res.status(405).json({ status: false, message: "Method not allowed" });
    }
}
