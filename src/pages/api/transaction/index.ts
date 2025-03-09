import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const transactions = await db.transaction.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      isDeleted: false,
    },
  });

  return res.status(200).json({ message: "OK", data: transactions });
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { decoded, body } = req;
    const { title, amount, description, type } = body;
    if (
      !title ||
      typeof title !== "string" ||
      !amount ||
      isNaN(Number(amount)) ||
      !type ||
      typeof type !== "string"
    )
      return res.status(400).json({ message: "All fields are required" });

    if (type !== "Income" && type !== "Expense") {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    const transaction = await db.transaction.create({
      data: {
        amount: Number(amount),
        title,
        description,
        type,
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
        type: "CREATE",
        description: `${user?.name} create ${transaction.type} transaction ${transaction.title} with amount ${transaction.amount}`,
        detail: transaction,
      },
    });

    return res.status(200).json({
      message: "Successfull create transaction",
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

  if (req.method === "POST") {
    return AuthApi(POST, ["OWNER"])(req, res);
  }
};

export default handler;
