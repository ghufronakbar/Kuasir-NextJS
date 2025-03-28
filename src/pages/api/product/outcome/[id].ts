import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { saveToLog } from "@/services/server/saveToLog";
import { sync } from "@/services/server/sync";
import { $Enums } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const outcome = await db.outcome.findUnique({
    include: {
      stock: true,
    },
    where: {
      id,
    },
  });

  return res.status(200).json({ message: "OK", data: outcome });
};

const PUT = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const id = (req.query.id as string) || "";
    const { body } = req;
    const { amount, price, method, stockId, category, adminFee } = body;
    if (
      !amount ||
      isNaN(Number(amount)) ||
      !price ||
      isNaN(Number(price)) ||
      !method ||
      !stockId ||
      !category
    )
      return res.status(400).json({ message: "All fields are required" });

    if (!$Enums.PaymentMethod[method as keyof typeof $Enums.PaymentMethod]) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    const checkId = await db.outcome.findUnique({
      where: {
        id,
      },
      include: {
        stock: true,
      },
    });

    const checkStock = await db.stock.findUnique({
      where: {
        id: stockId,
      },
      include: {
        outcomes: true,
      },
    });

    if (!checkId) {
      return res.status(400).json({ message: "Outcome not found" });
    }

    if (!checkStock) {
      return res.status(400).json({ message: "Stock not found" });
    }

    const outcome = await db.outcome.update({
      data: {
        amount: Number(amount),
        price: Number(price),
        method: method as $Enums.PaymentMethod,
        stockId: stockId,
        category: category,
        adminFee: Number(adminFee),
      },
      where: {
        id,
      },
      include: {
        stock: true,
      },
    });

    await sync();
    await saveToLog(req, "Outcome", outcome);

    return res
      .status(200)
      .json({ message: "Successfull edit outcome", data: outcome });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const id = (req.query.id as string) || "";
    const check = await db.outcome.findUnique({
      where: {
        id,
      },
    });

    if (!check) {
      return res.status(400).json({ message: "Outcome not found" });
    }

    const updated = await db.outcome.update({
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
    await saveToLog(req, "Outcome", updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    return AuthApi(GET, ["OWNER", "MANAGER_OPERATIONAL"])(req, res);
  }

  if (req.method === "PUT") {
    return AuthApi(PUT, ["OWNER"])(req, res);
  }

  if (req.method === "DELETE") {
    return AuthApi(DELETE, ["OWNER"])(req, res);
  }
};

export default handler;
