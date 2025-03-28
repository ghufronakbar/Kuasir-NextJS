import { db } from "@/config/db";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const informations = await db.information.findMany({
    where: {
      isDeleted: false,
    },
  });

  return res.status(200).json({ message: "OK", data: informations[0] });
};


export default handler;