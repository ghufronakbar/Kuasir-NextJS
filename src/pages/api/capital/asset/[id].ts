import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { saveToLog } from "@/services/server/saveToLog";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const capital = await db.capital.findUnique({
    where: {
      id,
    },
  });

  if (!capital || capital.isDeleted)
    return res.status(404).json({ message: "Capital not found" });

  return res.status(200).json({ message: "OK", data: capital });
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

  const capital = await db.capital.update({
    data: {
      description,
      type: "Asset",
      amount: Number(amount),
      transaction: "Expense",
      note,
    },
    where: {
      id,
    },
  });

  await saveToLog(req, "Capital", capital);

  return res
    .status(200)
    .json({ message: "Successfull update capital", data: capital });
};

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";

  const capital = await db.capital.update({
    data: {
      isDeleted: true,
    },
    where: {
      id,
    },
  });

  await saveToLog(req, "Capital", capital);

  return res
    .status(200)
    .json({ message: "Successfull delete capital", data: capital });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") return GET(req, res);
  if (req.method === "PUT") return PUT(req, res);
  if (req.method === "DELETE") return DELETE(req, res);
};

export default AuthApi(handler, ["OWNER"]);
