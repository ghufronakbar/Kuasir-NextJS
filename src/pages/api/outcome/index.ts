import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { $Enums } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const outcomes = await db.outcome.findMany({
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

  return res.status(200).json({ message: "OK", data: outcomes });
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { decoded, body } = req;
    const { amount, price, method, stockId, category, description } = body;
    if (
      !amount ||
      isNaN(Number(amount)) ||
      !price ||
      isNaN(Number(price)) ||
      !method ||
      !stockId ||
      !category
    ) {
      console.log({ amount, price, method, stockId, category });
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!$Enums.PaymentMethod[method as keyof typeof $Enums.PaymentMethod]) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    const checkStock = await db.stock.findUnique({
      where: {
        id: stockId,
      },
    });

    if (!checkStock) {
      return res.status(400).json({ message: "Stock not found" });
    }

    const outcome = await db.outcome.create({
      data: {
        amount: Number(amount),
        price: Number(price),
        method: method as $Enums.PaymentMethod,
        stockId: stockId,
        category,
        description,
      },
    });

    await db.stock.update({
      where: {
        id: stockId,
      },
      data: {
        quantity: checkStock.quantity + Number(amount),
      },
    });

    const user = await db.user.findUnique({
      where: {
        id: decoded?.id || "",
      },
    });

    await db.logActivity.create({
      data: {
        referenceId: outcome.id,
        referenceModel: "Outcome",
        userId: decoded?.id || "",
        type: "CREATE",
        description: `${user?.name} create outcome Rp. ${outcome.price} for ${outcome.amount} ${checkStock.name}`,
        detail: outcome,
      },
    });

    return res
      .status(200)
      .json({ message: "Successfull create outcome", data: outcome });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    return AuthApi(GET, ["OWNER", "MANAGER_OPERATIONAL"])(req, res);
  }

  if (req.method === "POST") {
    return AuthApi(POST, ["OWNER", "MANAGER_OPERATIONAL"])(req, res);
  }
};

export default handler;
