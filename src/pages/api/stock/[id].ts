import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { saveToLog } from "@/services/server/saveToLog";
import { sync } from "@/services/server/sync";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const stock = await db.stock.findUnique({
    include: {
      recipes: {
        include: {
          product: true,
        },
      },
    },
    where: {
      id,
    },
  });

  if (!stock) return res.status(404).json({ message: "Stock not found" });
  if (stock.isDeleted)
    return res.status(404).json({ message: "Stock not found" });

  return res.status(200).json({ message: "OK", data: stock });
};

const PUT = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const id = (req.query.id as string) || "";
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
      select: {
        id: true,
      },
    });

    const checkId = await db.stock.findUnique({
      where: {
        id,
      },
    });

    if (!checkId) return res.status(404).json({ message: "Stock not found" });

    if (checkName && checkName.id !== id) {
      return res.status(400).json({ message: "Stock already exist" });
    }

    const stock = await db.stock.update({
      data: {
        name,
        unit,
        image: image || checkId.image,
      },
      where: {
        id,
      },
    });
    await sync();
    await saveToLog(req, "Stock", stock);

    return res
      .status(200)
      .json({ message: "Successfull edit stock", data: stock });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";

  const stock = await db.stock.findUnique({
    where: {
      id,
    },
  });

  if (!stock) return res.status(404).json({ message: "Stock not found" });
  if (stock.isDeleted)
    return res.status(404).json({ message: "Stock not found" });

  const ress = await db.stock.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
  });

  await sync();
  await saveToLog(req, "Stock", ress);

  return res
    .status(200)
    .json({ message: "Successfull delete stock", data: ress });
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    return AuthApi(GET, ["OWNER", "CASHIER", "MANAGER_OPERATIONAL"])(req, res);
  }

  if (req.method === "PUT") {
    return AuthApi(PUT, ["OWNER", "MANAGER_OPERATIONAL"])(req, res);
  }

  if (req.method === "DELETE") {
    return AuthApi(DELETE, ["OWNER"])(req, res);
  }
};

export default handler;
