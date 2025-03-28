import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { saveToLog } from "@/services/server/saveToLog";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const productCategories = await db.productCategory.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      products: true,
    },
    where: {
      isDeleted: false,
    },
  });

  return res.status(200).json({ message: "OK", data: productCategories });
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { body } = req;
    const { name } = body;
    if (!name || typeof name !== "string")
      return res.status(400).json({ message: "All fields are required" });

    const category = await db.productCategory.create({
      data: {
        name,
      },
    });

    const checkName = await db.productCategory.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
      select: {
        isDeleted: true,
      },
    });

    if (checkName && !checkName.isDeleted) {
      return res
        .status(400)
        .json({ message: "Product category name already exist" });
    }

    await saveToLog(req, "ProductCategory", category.id);

    return res
      .status(200)
      .json({ message: "Successfull create product category", data: category });
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
    return AuthApi(POST, ["OWNER"])(req, res);
  }
};

export default handler;
