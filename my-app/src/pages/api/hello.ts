import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  message: string;
  status: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  res.status(200).json({ message: "Smart Irrigation API aktif", status: "online" });
}
