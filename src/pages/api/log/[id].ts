import { db } from "@/config/db";
import { NextApiRequest, NextApiResponse } from "next/types";

export const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const log = await db.logActivity.findUnique({
    where: {
      id,
    },
  });

  if (!log) return res.status(404).json({ message: "Log not found" });

  return res.status(200).json({ message: "OK", data: log });
};
