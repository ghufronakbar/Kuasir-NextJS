import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { saveToLog } from "@/services/server/saveToLog";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const transaction = await db.transaction.findUnique({
    where: {
      id,
    },
  });

  if (!transaction || transaction.isDeleted)
    return res.status(404).json({ message: "Transaction not found" });

  return res.status(200).json({ message: "OK", data: transaction });
};

const PUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const { description, amount, note } = req.body;

  if (!description || !amount)
    return res.status(400).json({ message: "All fields are required" });

  if (isNaN(Number(amount)))
    return res.status(400).json({ message: "Invalid amount" });

  if (Number(amount) < 0)
    return res.status(400).json({ message: "Invalid amount" });

  const transaction = await db.transaction.update({
    data: {
      description,
      subCategory: "Asset",
      category: "Capital",
      amount: Number(amount),
      transaction: "Expense",
      note,
    },
    where: {
      id,
    },
  });

  await saveToLog(req, "Transaction", transaction);

  return res
    .status(200)
    .json({ message: "Successfull update transaction", data: transaction });
};

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";

  const transaction = await db.transaction.update({
    data: {
      isDeleted: true,
    },
    where: {
      id,
    },
  });

  await saveToLog(req, "Transaction", transaction);

  return res
    .status(200)
    .json({ message: "Successfull delete transaction", data: transaction });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") return GET(req, res);
  if (req.method === "PUT") return PUT(req, res);
  if (req.method === "DELETE") return DELETE(req, res);
};

export default AuthApi(handler, ["OWNER"]);
