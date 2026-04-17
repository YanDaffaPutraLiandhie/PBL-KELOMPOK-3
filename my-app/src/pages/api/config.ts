import type { NextApiRequest, NextApiResponse } from "next";
import { getThresholdConfig, setThresholdConfig } from "../../utils/db/servicefirebase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const config = await getThresholdConfig();
      res.status(200).json(config);
    } catch (err) {
      res.status(500).json({ error: "Gagal mengambil konfigurasi dari database." });
    }
  } else if (req.method === "POST" || req.method === "PUT") {
    try {
      await setThresholdConfig(req.body);
      res.status(200).json({ message: "Konfigurasi berhasil disimpan", config: req.body });
    } catch (err) {
      res.status(500).json({ error: "Gagal menyimpan konfigurasi ke database." });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
