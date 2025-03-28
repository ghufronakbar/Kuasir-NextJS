import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { saveToLog } from "@/services/server/saveToLog";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const finances = await db.finance.findMany({
    where: {
      AND: [
        {
          isDeleted: false,
        },
        {
          type: "Loan",
        },
      ],
    },
  });

  return res.status(200).json({ message: "OK", data: finances });
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { description, amount, note } = req.body;

  if (!description || !amount)
    return res.status(400).json({ message: "All fields are required" });

  if (isNaN(Number(amount)))
    return res.status(400).json({ message: "Invalid amount" });

  if (Number(amount) < 0)
    return res.status(400).json({ message: "Invalid amount" });

  const finance = await db.finance.create({
    data: {
      description,
      type: "Loan",
      amount: Number(amount),
      transaction: "Expense",
      note,
    },
  });

  await saveToLog(req, "Finance", finance);

  return res
    .status(200)
    .json({ message: "Successfull create finance", data: finance });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") return GET(req, res);
  if (req.method === "POST") return POST(req, res);
};

export default AuthApi(handler, ["OWNER"]);
