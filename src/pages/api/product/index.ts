import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
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
      isDeleted: false,
    },
  });

  return res.status(200).json({ message: "OK", data: products });
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { decoded, body } = req;
    const { name, price, description, image, productCategoryId } = body;
    if (
      !name ||
      typeof name !== "string" ||
      !price ||
      isNaN(Number(price)) ||
      !productCategoryId ||
      typeof productCategoryId !== "string"
    )
      return res.status(400).json({ message: "All fields are required" });

    const checkProductCategory = await db.productCategory.findUnique({
      where: {
        id: productCategoryId,
      },
    });

    if (!checkProductCategory) {
      return res.status(400).json({ message: "Product category not found" });
    }

    const product = await db.product.create({
      data: {
        name,
        price: Number(price),
        description: description || null,
        image: image || null,
        productCategoryId,
      },
    });

    const user = await db.user.findUnique({
      where: {
        id: decoded?.id || "",
      },
    });

    await db.logActivity.create({
      data: {
        referenceId: product.id,
        referenceModel: "Product",
        userId: decoded?.id || "",
        type: "CREATE",
        description: `${user?.name} create product ${product.name}`,
        detail: product,
      },
    });

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
