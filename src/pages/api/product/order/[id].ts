import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { saveToLog } from "@/services/server/saveToLog";
import { sync } from "@/services/server/sync";
import { $Enums } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const order = await db.order.findUnique({
    include: {
      orderItems: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          product: true,
        },
      },
    },
    where: {
      id,
    },
  });

  return res.status(200).json({
    message: "OK",
    data: order,
  });
};

const PUT = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const id = (req.query.id as string) || "";
    const { body } = req;
    const { merchant, method, business, orderItems } = body;

    if (!merchant || !method || !business)
      return res.status(400).json({ message: "Please fill all fields" });
    if (
      typeof merchant !== "string" ||
      typeof method !== "string" ||
      typeof business !== "string"
    )
      return res.status(400).json({ message: "Invalid data type" });

    if (!$Enums.PaymentMethod[method as keyof typeof $Enums.PaymentMethod])
      return res.status(400).json({ message: "Invalid payment method" });

    if (!$Enums.Merchant[merchant as keyof typeof $Enums.Merchant])
      return res.status(400).json({ message: "Invalid merchant" });

    if (!$Enums.Business[business as keyof typeof $Enums.Business])
      return res.status(400).json({ message: "Invalid business" });

    if (typeof orderItems !== "object")
      return res.status(400).json({ message: "Invalid order items" });

    if (!Array.isArray(orderItems))
      return res.status(400).json({ message: "Invalid order items" });

    const orderIds: string[] = [];
    const productIds: string[] = [];

    for (const item of orderItems) {
      orderIds.push(item.orderId as string);
      productIds.push(item.productId as string);

      if (
        !item.name ||
        !item.amount ||
        !item.price ||
        !item.description ||
        !item.orderId ||
        !item.productId
      ) {
        return res.status(400).json({ message: "Please fill all fields" });
      }

      const validKeys: (keyof typeof item)[] = [
        "name",
        "amount",
        "price",
        "description",
        "orderId",
        "productId",
      ];
      for (const key in item) {
        if (!validKeys.includes(key as keyof typeof item)) {
          delete item[key as keyof typeof item];
        }
      }
    }

    const uniqueOrderIds = Array.from(new Set(orderIds));
    const uniqueProductIds = Array.from(new Set(productIds));

    const checkOrderId = await db.order.findMany({
      where: {
        id: {
          in: uniqueOrderIds,
        },
      },
    });

    const checkProductId = await db.product.findMany({
      where: {
        id: {
          in: uniqueProductIds,
        },
      },
    });

    const checkId = await db.order.findUnique({
      where: {
        id,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!checkId) return res.status(404).json({ message: "Order not found" });

    if (checkOrderId.length !== uniqueOrderIds.length) {
      return res.status(400).json({ message: "Invalid order ids" });
    }

    if (checkProductId.length !== uniqueProductIds.length) {
      return res.status(400).json({ message: "Invalid product ids" });
    }

    const order = await db.order.update({
      where: {
        id,
      },
      data: {
        merchant: $Enums.Merchant[merchant as keyof typeof $Enums.Merchant],
        method:
          $Enums.PaymentMethod[method as keyof typeof $Enums.PaymentMethod],
        business: business as $Enums.Business,
        orderItems: {
          createMany: {
            data: orderItems,
          },
        },
      },

      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    const checkTrans = await db.transaction.findFirst({
      where: {
        orderId: order.id,
      },
      select: {
        id: true,
      },
    });
    if (checkTrans) {
      await Promise.all([
        db.transaction.update({
          data: {
            amount: order.total,
          },
          where: {
            id: checkTrans.id,
          },
        }),
        saveToLog(req, "Order", order),
      ]);
    } else {
      await Promise.all([
        saveToLog(req, "Order", order),
        db.transaction.create({
          data: {
            amount: order.total,
            orderId: order.id,
            category: "Product",
            subCategory: "Sell",
            transaction: "Income",
          },
        }),
      ]);
    }

    return res
      .status(200)
      .json({ message: "Success to edit order", data: order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const id = (req.query.id as string) || "";
    const order = await db.order.findUnique({
      where: {
        id,
      },
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    const updatedOrder = await db.order.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    const checkTrans = await db.transaction.findFirst({
      where: {
        orderId: order.id,
      },
      select: {
        id: true,
      },
    });
    if (checkTrans) {
      await Promise.all([
        db.transaction.update({
          data: {
            isDeleted: true,
          },
          where: {
            id: checkTrans.id,
          },
        }),
        sync(),
        saveToLog(req, "Order", order),
      ]);
    } else {
      await Promise.all([sync(), saveToLog(req, "Order", order)]);
    }

    return res
      .status(200)
      .json({ message: "Success to delete order", data: updatedOrder });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET")
    return AuthApi(GET, ["OWNER", "CASHIER", "MANAGER_OPERATIONAL"])(req, res);

  if (req.method === "PUT") return AuthApi(PUT, ["OWNER"])(req, res);

  if (req.method === "DELETE") return AuthApi(DELETE, ["OWNER"])(req, res);

  return res.status(400).json({ message: "Invalid request method" });
};

export default handler;
