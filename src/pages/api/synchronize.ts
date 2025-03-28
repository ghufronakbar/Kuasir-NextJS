import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/config/db";
import { Product, Recipe, Stock } from "@prisma/client";

export interface SynchonizeData {
  stocks: Stock[];
  recipes: Recipe[];
  products: Product[];
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const response: SynchonizeData = {
      stocks: [],
      recipes: [],
      products: [],
    };

    const stocks = await db.stock.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        averagePrice: true,
        quantity: true,
        name: true,
        defects: {
          select: {
            amount: true,
          },
          where: {
            isDeleted: false,
          },
        },
        recipes: {
          where: {
            isDeleted: false,
          },
          select: {
            amount: true,
            price: true,
            id: true,
            product: {
              select: {
                id: true,
                orderItems: {
                  where: {
                    AND: [
                      {
                        isDeleted: false,
                      },
                      {
                        order: {
                          isDeleted: false,
                        },
                      },
                    ],
                  },
                  select: {
                    amount: true,
                  },
                },
              },
            },
          },
        },
        outcomes: {
          where: {
            isDeleted: false,
          },
          select: {
            amount: true,
            price: true,
          },
        },
      },
    });

    let cogs = 0;
    for (const stock of stocks) {
      const { outcomes, defects, recipes } = stock;
      let tempAmount = 0;
      let totalDefect = 0;
      let totalPrice = 0;
      let totalAmountSold = 0;
      for (const outcome of outcomes) {
        tempAmount += outcome.amount;
        totalPrice += outcome.price;
      }
      for (const defect of defects) {
        totalDefect += defect.amount;
      }
      const finalPrice = totalPrice / tempAmount;

      for (let i = 0; i < recipes.length; i++) {
        const recipe = recipes[i];
        const price = recipe.amount * finalPrice;
        cogs += price;
        const resss = await db.recipe.update({
          where: {
            id: recipe.id,
          },
          data: {
            price,
          },
        });
        response.recipes.push(resss);

        for (const orderItem of recipe.product.orderItems) {
          totalAmountSold += orderItem.amount * recipe.amount;
        }

        if (i === recipes.length - 1) {
          const ressss = await db.product.update({
            where: {
              id: recipe.product.id,
            },
            data: {
              cogs,
            },
          });
          response.products.push(ressss);
        }
      }

      const FINAL_AMOUNT = tempAmount - totalDefect - totalAmountSold;

      const ress = await db.stock.update({
        where: {
          id: stock.id,
        },
        data: {
          averagePrice: finalPrice,
          quantity: FINAL_AMOUNT,
        },
      });
      response.stocks.push(ress);
    }

    return res.status(200).json({
      message:
        "Success to synchronize (stock(amount, average price by defect & sold), recipe(price per portion), product(cogs)), information(total balance)",
      data: response,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default handler;
