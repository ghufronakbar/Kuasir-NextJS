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
    const { amount, stockId, productId } = body;
    if (!amount || isNaN(Number(amount))) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const checkId = await db.recipe.findUnique({
      where: {
        id,
      },
    });

    const checkStock = await db.stock.findUnique({
      where: {
        id: stockId,
      },
      include: {
        outcomes: {
          select: {
            amount: true,
            price: true,
          },
        },
      },
    });

    const checkProduct = await db.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!checkId) return res.status(400).json({ message: "Recipe not found" });
    if (!checkStock)
      return res.status(400).json({ message: "Stock not found" });
    if (!checkProduct)
      return res.status(400).json({ message: "Product not found" });

    let totalPrice = 0;
    let totalProduct = 0;

    for (const outcome of checkStock.outcomes) {
      totalPrice += outcome.price;
      totalProduct += outcome.amount;
    }

    const averagePrice = totalPrice / totalProduct || 0;
    const finalPrice = Number(averagePrice) * Number(amount);

    const recipe = await db.recipe.update({
      data: {
        amount: Number(amount),
        price: Number(finalPrice),
        stockId: checkStock.id,
        productId: checkProduct.id,
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

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const id = (req.query.id as string) || "";
    const { decoded } = req;
    const recipe = await db.recipe.findUnique({
      where: {
        id,
      },
      include: {
        product: true,
        stock: true,
      },
    });

    if (!recipe) return res.status(400).json({ message: "Recipe not found" });

    await db.recipe.update({
      data: {
        isDeleted: true,
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
        type: "DELETE",
        description: `${user?.name} delete recipe ${recipe.stock.name} for ${recipe.product.name}`,
        detail: recipe,
      },
    });

    return res
      .status(200)
      .json({ message: "Successfull delete recipe", data: recipe });
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

  if (req.method === "DELETE") {
    return AuthApi(DELETE, ["OWNER"])(req, res);
  }
};

export default handler;
