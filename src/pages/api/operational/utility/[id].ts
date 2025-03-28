import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { saveToLog } from "@/services/server/saveToLog";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const operational = await db.operational.findUnique({
    where: {
      id,
    },
  });

  if (!operational || operational.isDeleted)
    return res.status(404).json({ message: "Operational not found" });

  return res.status(200).json({ message: "OK", data: operational });
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

  const operational = await db.operational.update({
    data: {
      description,
      type: "Utility",
      amount: Number(amount),
      transaction: "Expense",
      note
    },
    where: {
      id,
    },
  });

  await saveToLog(req, "Operational", operational);

  return res
    .status(200)
    .json({ message: "Successfull update operational", data: operational });
};

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";

  const operational = await db.operational.update({
    data: {
      isDeleted: true,
    },
    where: {
      id,
    },
  });

  await saveToLog(req, "Operational", operational);

  return res
    .status(200)
    .json({ message: "Successfull delete operational", data: operational });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") return GET(req, res);
  if (req.method === "PUT") return PUT(req, res);
  if (req.method === "DELETE") return DELETE(req, res);
};

export default AuthApi(handler, ["OWNER"]);
