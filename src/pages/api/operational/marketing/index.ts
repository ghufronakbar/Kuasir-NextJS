import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { saveToLog } from "@/services/server/saveToLog";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const operationals = await db.operational.findMany({
    where: {
      AND: [
        {
          isDeleted: false,
        },
        {
          type: "Marketing",
        },
      ],
    },
  });

  return res.status(200).json({ message: "OK", data: operationals });
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { description, amount, note } = req.body;

  if (!description || !amount)
    return res.status(400).json({ message: "All fields are required" });

  if (isNaN(Number(amount)))
    return res.status(400).json({ message: "Invalid amount" });

  if (Number(amount) < 0)
    return res.status(400).json({ message: "Invalid amount" });

  const operational = await db.operational.create({
    data: {
      description,
      type: "Marketing",
      amount: Number(amount),
      transaction: "Expense",
      note
    },
  });

  await saveToLog(req, "Operational", operational);

  return res
    .status(200)
    .json({ message: "Successfull create operational", data: operational });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") return GET(req, res);
  if (req.method === "POST") return POST(req, res);
};

export default AuthApi(handler, ["OWNER"]);
