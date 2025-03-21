import { db } from "@/config/db";
import formatDate from "@/helper/formatDate";
import AuthApi from "@/middleware/auth-api";
import { DetailOrder, DetailOrderByDate } from "@/models/schema";
import { $Enums } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const decoded = req?.decoded;
  const businessId = (req.query?.businessId as string) || "";
  const isAll = req.query.businessId === "-";

  const user = await db.user.findUnique({
    where: {
      id: decoded?.id,
    },
    select: {
      role: true,
    },
  });

  const orders = (await db.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      orderItems: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          product: true,
        },
      },
      business: true,
    },
    where: {
      AND: [
        {
          isDeleted: false,
        },
        user?.role !== "OWNER"
          ? {
              createdAt: {
                gte: new Date(new Date().setDate(new Date().getDate() - 7)),
              },
            }
          : {},
        { businessId: isAll ? undefined : businessId },
      ],
    },
  })) as DetailOrder[];

  const filteredOrders: DetailOrderByDate[] = [];

  for (const order of orders) {
    const dateKey = formatDate(order.createdAt, true);

    if (!filteredOrders.find((o) => o.date === dateKey)) {
      filteredOrders.push({
        date: dateKey,
        orders: [order],
      });
    } else {
      filteredOrders.find((o) => o.date === dateKey)?.orders.push(order);
    }
  }

  return res.status(200).json({
    message: "OK",
    data: filteredOrders,
  });
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { body, decoded } = req;
    const { merchant, method, businessId, orderItems } = body;

    if (!merchant || !method || !businessId)
      return res.status(400).json({ message: "Please fill all fields" });
    if (
      typeof merchant !== "string" ||
      typeof method !== "string" ||
      typeof businessId !== "string"
    )
      return res.status(400).json({ message: "Invalid data type" });

    if (!$Enums.PaymentMethod[method as keyof typeof $Enums.PaymentMethod])
      return res.status(400).json({ message: "Invalid payment method" });

    if (!$Enums.Merchant[merchant as keyof typeof $Enums.Merchant])
      return res.status(400).json({ message: "Invalid merchant" });

    if (typeof orderItems !== "object")
      return res.status(400).json({ message: "Invalid order items" });

    if (!Array.isArray(orderItems))
      return res.status(400).json({ message: "Invalid order items" });

    const orderIds: string[] = [];
    const productIds: string[] = [];

    for (const item of orderItems) {
      orderIds.push(item.orderId as string);
      productIds.push(item.productId as string);

      if (!item.name || !item.amount || !item.productId) {
        console.log(item);
        return res.status(400).json({ message: "Please fill all fields" });
      }

      const validKeys: (keyof typeof item)[] = [
        "name",
        "amount",
        "description",
        "productId",
      ];
      for (const key in item) {
        if (!validKeys.includes(key as keyof typeof item)) {
          delete item[key as keyof typeof item];
        }
      }
    }

    const uniqueProductIds = Array.from(new Set(productIds));

    const checkProductId = await db.product.findMany({
      where: {
        id: {
          in: uniqueProductIds,
        },
      },
    });

    if (checkProductId.length !== uniqueProductIds.length) {
      return res.status(400).json({ message: "Invalid product ids" });
    }
    let total = 0;
    for (const item of orderItems) {
      item.price =
        checkProductId.find((product) => product.id === item.productId)
          ?.price || 0 * item.amount;

      total += item.price;
    }

    const order = await db.order.create({
      data: {
        merchant: $Enums.Merchant[merchant as keyof typeof $Enums.Merchant],
        method:
          $Enums.PaymentMethod[method as keyof typeof $Enums.PaymentMethod],
        businessId,
        total,
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
        business: true,
      },
    });

    const user = await db.user.findUnique({
      where: {
        id: decoded?.id || "",
      },
    });

    await db.logActivity.create({
      data: {
        referenceId: order.id,
        referenceModel: "Order",
        userId: user?.id || "",
        description: `${user?.name} update order ${order.id}`,
        type: "CREATE",
        detail: order,
      },
    });

    return res
      .status(200)
      .json({ message: "Success to create order", data: order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET")
    return AuthApi(GET, ["OWNER", "CASHIER", "MANAGER_OPERATIONAL"])(req, res);
  if (req.method === "POST")
    return AuthApi(POST, ["OWNER", "CASHIER"])(req, res);
  return res.status(400).json({ message: "Invalid request method" });
};

export default handler;
