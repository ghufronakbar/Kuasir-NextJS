import { db } from "@/config/db";
import { NextApiRequest, NextApiResponse } from "next/types";

export const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const logs = await db.logActivity.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return res.status(200).json({ message: "OK", data: logs });
};
