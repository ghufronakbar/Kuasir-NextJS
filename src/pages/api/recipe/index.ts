import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { sync } from "@/services/server/sync";
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
    const { amount, stockId, productId } = body;
    if (!amount || isNaN(Number(amount)))
      return res.status(400).json({ message: "All fields are required" });

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
          where: {
            isDeleted: false,
          },
        },
      },
    });

    const checkProduct = await db.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        recipes: {
          include: {
            stock: true,
          },
          where: {
            isDeleted: false,
          },
        },
      },
    });

    if (!checkStock)
      return res.status(400).json({ message: "Stock not found" });
    if (!checkProduct)
      return res.status(400).json({ message: "Product not found" });

    if (checkProduct.recipes.includes(stockId))
      return res
        .status(400)
        .json({ message: "Product already has this stock" });

    let totalPrice = 0;
    let totalProduct = 0;

    for (const outcome of checkStock.outcomes) {
      totalPrice += outcome.price;
      totalProduct += outcome.amount;
    }

    const averagePrice = totalPrice / totalProduct || 0;
    const finalPrice = Number(averagePrice) * Number(amount);

    const recipe = await db.recipe.create({
      data: {
        amount: Number(amount),
        price: Number(finalPrice),
        stockId: stockId,
        productId: productId,
      },
      include: {
        product: true,
      },
    });

    await sync();

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
