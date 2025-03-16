import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
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
    const { decoded, body } = req;
    const { amount, price, method, stockId, category } = body;
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
      },
      where: {
        id,
      },
    });

    const gapQuantity = checkId.amount - Number(amount);
    const newQuantity = checkStock.quantity - gapQuantity;

    let totalPrice = 0;
    let totalAmount = 0;

    for (const outcome of checkStock.outcomes) {
      totalPrice += outcome.price;
      totalAmount += outcome.amount;
    }

    const averagePrice = totalPrice / totalAmount || 0;

    await db.stock.update({
      where: {
        id: stockId,
      },
      data: {
        quantity: newQuantity,
        averagePrice,
      },
      include: {
        outcomes: true,
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
        type: "UPDATE",
        description: `${user?.name} edit outcome Rp. ${checkId.price} for ${checkId.amount} ${checkId?.stock.name} to Rp. ${outcome.price} for ${outcome.amount} ${checkStock.name}`,
        detail: outcome,
        before: checkId,
      },
    });

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
    const { decoded } = req;
    const id = (req.query.id as string) || "";
    const check = await db.outcome.findUnique({
      where: {
        id,
      },
    });
    const user = await db.user.findUnique({
      where: {
        id: decoded?.id || "",
      },
    });

    if (!check) {
      return res.status(400).json({ message: "Outcome not found" });
    }

    const outcome = await db.outcome.update({
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

    await db.logActivity.create({
      data: {
        referenceId: outcome.id,
        referenceModel: "Outcome",
        userId: decoded?.id || "",
        type: "DELETE",
        description: `${user?.name} delete outcome Rp. ${check.price} for ${check.amount} ${outcome.stock.name}`,
        detail: outcome,
      },
    });
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
