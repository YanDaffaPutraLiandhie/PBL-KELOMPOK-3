import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const data = [
    { id: 1, type: 'soilMoisture', value: 48, unit: '%' },
    { id: 2, type: 'temperature', value: 24.1, unit: '°C' },
    { id: 3, type: 'humidity', value: 70, unit: '%' },
    { id: 4, type: 'ph', value: 6.5, unit: '' },
    { id: 5, type: 'light', value: 1200, unit: 'lux' }
  ];
  res.status(200).json(data);
}
