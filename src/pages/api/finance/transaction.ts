import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const finances = await db.finance.findMany({
    where: {
      AND: [
        {
          isDeleted: false,
        },
        {
          type: "Transaction",
        },
      ],
    },
  });

  return res.status(200).json({ message: "OK", data: finances });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") return GET(req, res);
};

export default AuthApi(handler, ["OWNER"]);
