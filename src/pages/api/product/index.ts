import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { saveToLog } from "@/services/server/saveToLog";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const products = await db.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      productCategory: true,
    },
    where: {
      AND: { isDeleted: false },
    },
  });

  return res.status(200).json({ message: "OK", data: products });
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { body } = req;
    const { name, price, description, image, productCategory } = body;
    if (
      !name ||
      typeof name !== "string" ||
      !price ||
      isNaN(Number(price)) ||
      !productCategory ||
      typeof productCategory !== "string"
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const checkProductCategory = await db.productCategory.findFirst({
      where: {
        name: productCategory,
      },
    });

    let productCategoryId = checkProductCategory?.id;
    if (!checkProductCategory) {
      const pc = await db.productCategory.create({
        data: {
          name: productCategory,
        },
      });
      productCategoryId = pc.id;
    } else if (checkProductCategory && checkProductCategory.isDeleted) {
      const pc = await db.productCategory.update({
        where: {
          id: checkProductCategory.id,
        },
        data: {
          isDeleted: false,
        },
      });
      productCategoryId = pc.id;
    }

    const product = await db.product.create({
      data: {
        name,
        price: Number(price),
        description: description || null,
        image: image || null,
        productCategoryId: productCategoryId || "",
      },
      include: {
        productCategory: true,
      },
    });
    await saveToLog(req, "Product", product);

    return res
      .status(200)
      .json({ message: "Successfull create product", data: product });
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
