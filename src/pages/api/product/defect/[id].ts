import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { saveToLog } from "@/services/server/saveToLog";
import { sync } from "@/services/server/sync";
import type { NextApiRequest, NextApiResponse } from "next";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const defects = await db.defect.findUnique({
    include: {
      stock: true,
    },
    where: {
      id,
    },
  });

  if (!defects) return res.status(404).json({ message: "Defect not found" });

  return res.status(200).json({ message: "OK", data: defects });
};

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";

  const check = await db.defect.findUnique({
    where: {
      id,
    },
    include: {
      stock: true,
    },
  });

  if (!check || check?.isDeleted)
    return res.status(404).json({ message: "Defect not found" });

  const defect = await db.defect.update({
    data: {
      isDeleted: true,
    },
    where: {
      id,
    },
    include: {
      stock: true,
    },
  });

  await sync();
  await saveToLog(req, "Defect", defect);

  return res.status(200).json({ message: "Success to delete", data: defect });
};

const PUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const { body } = req;
  const { amount, reason } = body;

  if (!amount || !reason || isNaN(Number(amount)))
    return res.status(400).json({ message: "All fields are required" });

  const check = await db.defect.findUnique({
    where: {
      id,
    },
    include: {
      stock: true,
    },
  });
  if (!check || check?.isDeleted)
    return res.status(404).json({ message: "Defect not found" });

  if (check.stock.quantity - Number(amount) < 0)
    return res.status(400).json({ message: "Stock quantity is not enough" });

  const gap = Number(check.amount) - Number(amount);

  const newAmount = check.stock.quantity + Number(gap);

  if (newAmount < 0)
    return res.status(400).json({ message: "Stock quantity is not enough" });

  const defect = await db.defect.update({
    data: {
      amount: Number(amount),
      reason,
    },
    where: {
      id,
    },
  });

  await sync();
  await saveToLog(req, "Defect", defect);

  return res.status(200).json({ message: "Success to edit", data: defect });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  switch (method) {
    case "GET":
      return AuthApi(GET, ["OWNER", "MANAGER_OPERATIONAL"])(req, res);
    case "PUT":
      return AuthApi(PUT, ["OWNER", "MANAGER_OPERATIONAL"])(req, res);
    case "DELETE":
      return AuthApi(DELETE, ["OWNER", "MANAGER_OPERATIONAL"])(req, res);
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
};

export default handler;
