import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Data dummy status aktuator
  const data = {
    status: 'ON',
    mode: 'otomatis',
    lastChanged: '2026-04-14T12:00:00Z',
    availableModes: ['otomatis', 'manual', 'cepat', 'intensif', 'hemat'],
    currentDuration: 5 // menit
  };
  res.status(200).json(data);
}
