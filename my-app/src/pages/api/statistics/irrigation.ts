import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Data dummy statistik penyiraman
  const data = {
    today: { total: 2, duration: 8 },
    week: { total: 7, duration: 28 },
    month: { total: 22, duration: 90 },
    byMode: {
      cepat: { count: 5, duration: 15 },
      intensif: { count: 2, duration: 13 },
      hemat: { count: 1, duration: 3 }
    }
  };
  res.status(200).json(data);
}
