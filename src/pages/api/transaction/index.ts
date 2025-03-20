import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { $Enums } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const businessId = (req.query.businessId as string) || "";
  const transactions = await db.transaction.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      AND: [
        {
          businessId,
        },
        {
          isDeleted: false,
        },
      ],
    },
  });

  return res.status(200).json({ message: "OK", data: transactions });
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { decoded, body } = req;
    const { title, amount, description, type, businessId, category } = body;
    if (
      !title ||
      typeof title !== "string" ||
      !amount ||
      isNaN(Number(amount)) ||
      !type ||
      typeof type !== "string" ||
      !businessId ||
      typeof businessId !== "string" ||
      !category
    )
      return res.status(400).json({ message: "All fields are required" });

    if (type !== "Income" && type !== "Expense") {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    if (Object.keys($Enums.TransactionCategory).includes(category) === false) {
      return res.status(400).json({ message: "Invalid transaction category" });
    }

    const checkBusiness = await db.business.findUnique({
      where: {
        id: businessId,
      },
    });
    if (!checkBusiness) {
      return res.status(400).json({ message: "Business not found" });
    }

    const transaction = await db.transaction.create({
      data: {
        amount: Number(amount),
        title,
        description,
        type,
        businessId,
        category,
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
