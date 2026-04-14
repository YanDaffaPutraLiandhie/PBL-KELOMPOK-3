import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Data dummy ketersediaan air
  const data = {
    percentage: 90,
    status: 'cukup',
    lastUpdate: '2026-04-14T12:00:00Z',
    minThreshold: 20,
    maxThreshold: 100
  };
  res.status(200).json(data);
}
