import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const recipes = await db.recipe.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      product: true,
      stock: true,
    },
    where: {
      isDeleted: false,
    },
  });

  return res.status(200).json({ message: "OK", data: recipes });
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { decoded, body } = req;
    const { amount, price, stockId, productId } = body;
    if (!amount || isNaN(Number(amount)) || !price || isNaN(Number(price)))
      return res.status(400).json({ message: "All fields are required" });

    const checkStock = await db.stock.findUnique({
      where: {
        id: stockId,
      },
    });

    const checkProduct = await db.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!checkStock)
      return res.status(400).json({ message: "Stock not found" });
    if (!checkProduct)
      return res.status(400).json({ message: "Product not found" });

    const recipe = await db.recipe.create({
      data: {
        amount: Number(amount),
        price: Number(price),
        stockId: stockId,
        productId: productId,
      },
      include: {
        product: true,
      },
    });

    const user = await db.user.findUnique({
      where: {
        id: decoded?.id || "",
      },
    });

    await db.logActivity.create({
      data: {
        referenceId: recipe.id,
        referenceModel: "Recipe",
        userId: decoded?.id || "",
        type: "CREATE",
        description: `${user?.name} create recipe for ${recipe.product.name}`,
        detail: recipe,
      },
    });

    return res
      .status(200)
      .json({ message: "Successfull create recipe", data: recipe });
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
