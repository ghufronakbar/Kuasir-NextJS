import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { saveToLog } from "@/services/server/saveToLog";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const stocks = await db.stock.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      recipes: {
        include: {
          product: true,
        },
      },
    },
    where: {
      isDeleted: false,
    },
  });

  return res.status(200).json({ message: "OK", data: stocks });
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { body } = req;
    const { name, image, unit } = body;
    if (!name || typeof name !== "string" || !unit || typeof unit !== "string")
      return res.status(400).json({ message: "All fields are required" });

    const checkName = await db.stock.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (checkName) {
      return res.status(400).json({ message: "Stock already exist" });
    }

    const stock = await db.stock.create({
      data: {
        name,
        unit,
        quantity: 0,
        image: image || null,
      },
    });

    await saveToLog(req, "Stock", stock);

    return res
      .status(200)
      .json({ message: "Successfull create stock", data: stock });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    return AuthApi(GET, ["OWNER", "CASHIER", "MANAGER_OPERATIONAL"])(req, res);
  }

  if (req.method === "POST") {
    return AuthApi(POST, ["OWNER", "MANAGER_OPERATIONAL"])(req, res);
  }
};

export default handler;
