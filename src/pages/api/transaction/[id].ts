import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { $Enums } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const transaction = await db.transaction.findUnique({
    where: {
      id,
    },
  });

  if (!transaction)
    return res.status(404).json({ message: "Transaction not found" });
  if (transaction.isDeleted)
    return res.status(404).json({ message: "Transaction not found" });

  return res.status(200).json({ message: "OK", data: transaction });
};

const PUT = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const id = (req.query.id as string) || "";
    const { decoded, body } = req;
    const { title, amount, description, category } = body;
    if (!title || typeof title !== "string" || !amount || isNaN(Number(amount)))
      return res.status(400).json({ message: "All fields are required" });

    if (Object.keys($Enums.TransactionCategory).includes(category) === false) {
      return res.status(400).json({ message: "Invalid transaction category" });
    }

    const check = await db.transaction.findUnique({
      where: {
        id,
      },
    });
    if (!check)
      return res.status(400).json({ message: "Transaction not found" });
    if (check.isDeleted)
      return res.status(400).json({ message: "Transaction not found" });

    const transaction = await db.transaction.update({
      data: {
        amount: Number(amount),
        title,
        description,
        category,
      },
      where: {
        id,
      },
    });

    const user = await db.user.findUnique({
      where: {
        id: decoded?.id || "",
      },
    });

    await db.logActivity.create({
      data: {
        referenceId: transaction.id,
        referenceModel: "Transaction",
        userId: decoded?.id || "",
        type: "UPDATE",
        description: `${user?.name} update ${check.type} transaction ${check.title} with amount ${check.amount} to ${transaction.title} with amount ${transaction.amount}`,
        detail: transaction,
      },
    });

    return res.status(200).json({
      message: "Successfull edit transaction",
      data: transaction,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { decoded } = req;
    const id = (req.query.id as string) || "";
    const check = await db.transaction.findUnique({
      where: {
        id,
      },
    });
    const user = await db.user.findUnique({
      where: {
        id: decoded?.id || "",
      },
    });

    if (!check || !user)
      return res.status(400).json({ message: "Transaction not found" });

    const transaction = await db.transaction.update({
      data: {
        isDeleted: true,
      },
      where: {
        id,
      },
    });

    await db.logActivity.create({
      data: {
        referenceId: transaction.id,
        referenceModel: "Transaction",
        userId: decoded?.id || "",
        type: "DELETE",
        description: `${user?.name} delete ${check.type} transaction ${check.title} with amount ${check.amount}`,
        detail: transaction,
        before: check,
      },
    });

    return res.status(200).json({
      message: "Successfull delete transaction",
      data: transaction,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    return AuthApi(GET, ["OWNER"])(req, res);
  }

  if (req.method === "PUT") {
    return AuthApi(PUT, ["OWNER"])(req, res);
  }

  if (req.method === "DELETE") {
    return AuthApi(DELETE, ["OWNER"])(req, res);
  }
};

export default handler;
