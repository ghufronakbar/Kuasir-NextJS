import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const recipes = await db.recipe.findUnique({
    include: {
      product: true,
      stock: true,
    },
    where: {
      id,
    },
  });

  if (!recipes) return res.status(404).json({ message: "Recipe not found" });
  if (recipes.isDeleted)
    return res.status(404).json({ message: "Recipe not found" });

  return res.status(200).json({ message: "OK", data: recipes });
};

const PUT = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const id = (req.query.id as string) || "";
    const { decoded, body } = req;
    const { amount, price, stockId, productId } = body;
    if (!amount || isNaN(Number(amount)) || !price || isNaN(Number(price)))
      return res.status(400).json({ message: "All fields are required" });

    const checkId = await db.recipe.findUnique({
      where: {
        id,
      },
    });

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

    if (!checkId)
      return res.status(400).json({ message: "Recipe already exist" });
    if (!checkStock)
      return res.status(400).json({ message: "Stock not found" });
    if (!checkProduct)
      return res.status(400).json({ message: "Product not found" });

    const recipe = await db.recipe.update({
      data: {
        amount: Number(amount),
        price: Number(price),
        stockId: stockId,
        productId: productId,
      },
      include: {
        product: true,
      },
      where: {
        id,
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
        type: "UPDATE",
        description: `${user?.name} edit recipe for ${recipe.product.name}`,
        detail: recipe,
        before: checkId,
      },
    });

    return res
      .status(200)
      .json({ message: "Successfull edit recipe", data: recipe });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    return AuthApi(GET, ["OWNER", "CASHIER", "MANAGER_OPERATIONAL"])(req, res);
  }

  if (req.method === "PUT") {
    return AuthApi(PUT, ["OWNER"])(req, res);
  }
};

export default handler;
