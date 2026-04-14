import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Data dummy log aktivitas penyiraman
  const data = [
    { id: 1, time: '2026-04-14T09:00:00Z', mode: 'cepat', duration: 3, status: 'berhasil', user: 'admin' },
    { id: 2, time: '2026-04-13T15:00:00Z', mode: 'intensif', duration: 5, status: 'berhasil', user: 'admin' },
    { id: 3, time: '2026-04-13T10:00:00Z', mode: 'hemat', duration: 2, status: 'gagal', user: 'operator' },
    { id: 4, time: '2026-04-12T18:00:00Z', mode: 'otomatis', duration: 4, status: 'berhasil', user: 'system' }
  ];
  res.status(200).json(data);
}
