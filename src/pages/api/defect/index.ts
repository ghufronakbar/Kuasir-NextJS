import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import type { NextApiRequest, NextApiResponse } from "next";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const defects = await db.defect.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      stock: true,
    },
    where: {
      isDeleted: false,
    },
  });

  return res.status(200).json({ message: "OK", data: defects });
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { decoded, body } = req;
  const { amount, reason, stockId } = body;  

  if (!amount || !reason || !stockId || isNaN(Number(amount)))
    return res.status(400).json({ message: "All fields are required" });

  const stock = await db.stock.findUnique({
    where: {
      id: stockId,
    },
  });

  if (!stock || stock?.isDeleted)
    return res.status(404).json({ message: "Stock not found" });

  if (stock.quantity - Number(amount) < 0)
    return res.status(400).json({ message: "Stock quantity is not enough" });

  const defect = await db.defect.create({
    data: {
      amount: Number(amount),
      reason,
      stockId,
    },
  });

  const newAmount = stock.quantity - Number(amount);

  await db.stock.update({
    where: {
      id: stockId,
    },
    data: {
      quantity: newAmount,
    },
  });

  const user = await db.user.findUnique({
    where: {
      id: decoded?.id || "",
    },
  });

  await db.logActivity.create({
    data: {
      referenceId: defect?.id,
      type: "CREATE",
      description: `${user?.name} create a new defect with amount ${defect?.amount} and reason ${defect?.reason} for stock ${stock.name} with id ${stock.id}.`,
      referenceModel: "Defect",
      detail: defect,
      userId: user?.id || "",
    },
  });

  return res.status(200).json({ message: "Success to create", data: defect });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  switch (method) {
    case "GET":
      return AuthApi(GET, ["OWNER", "MANAGER_OPERATIONAL"])(req, res);
    case "POST":
      return AuthApi(POST, ["OWNER", "MANAGER_OPERATIONAL"])(req, res);
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
};

export default handler;
