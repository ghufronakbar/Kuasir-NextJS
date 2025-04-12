import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/config/db";
import { $Enums } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { method } = req;
    switch (method) {
      case "GET":
        return GET(req, res);
      case "POST":
        return POST(req, res);
      case "DELETE":
        return DELETE(req, res);
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const customers = await db.customer.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
    include: {
      orders: {
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
        include: {
          orderItems: {
            orderBy: { amount: "desc" },
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  return res.status(200).json({ message: "OK", data: customers });
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id, code, name } = req.body;
  if (!code || !name) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  if (typeof code !== "string" || !/^62\d{11,12}@?.*$/.test(code)) {
    return res
      .status(400)
      .json({ message: "Code must be a valid email or phone start with 62" });
  }

  let codeType = "Email";
  if (code && /^62\d{11,12}@?.*$/.test(code)) {
    codeType = "Phone";
  } else {
    codeType = "Email";
  }

  if (id !== code) {
    await Promise.all([
      db.customer.update({
        where: { id },
        data: {
          isDeleted: true,
        },
      }),
      db.customer.upsert({
        where: { id: code },
        create: {
          isDeleted: false,
          name,
          type: codeType as $Enums.CustomerType,
          id: code,
        },
        update: { name, type: codeType as $Enums.CustomerType },
      }),
    ]);
  } else {
    await db.customer.update({
      where: { id },
      data: {
        name,
        type: codeType as $Enums.CustomerType,
      },
    });
  }

  const isEdit = id !== code;

  return res
    .status(200)
    .json({
      message: `Success to ${isEdit ? "edit" : "create"} customer`,
      data: null,
    });
};

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  const customer = await db.customer.update({
    where: { id },
    data: { isDeleted: true },
  });

  return res
    .status(200)
    .json({ message: "Success to delete customer", data: customer });
};
