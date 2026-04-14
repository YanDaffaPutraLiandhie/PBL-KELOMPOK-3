import type { NextApiRequest, NextApiResponse } from "next";

// Simpan konfigurasi di memory (reset saat server restart)
let config = {
  soilMoistureMin: 30,
  soilMoistureMax: 70,
  temperatureMin: 20,
  temperatureMax: 35,
  alertThreshold: 80,
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // Ambil konfigurasi
    res.status(200).json(config);
  } else if (req.method === "POST" || req.method === "PUT") {
    // Simpan konfigurasi baru
    config = { ...config, ...req.body };
    res.status(200).json({ message: "Konfigurasi berhasil disimpan", config });
  } else {
    res.setHeader("Allow", ["GET", "POST", "PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
