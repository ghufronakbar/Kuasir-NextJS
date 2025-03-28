import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/config/db";
import { Information, Product, Recipe, Stock } from "@prisma/client";

export interface SynchonizeData {
  stocks: Stock[];
  recipes: Recipe[];
  products: Product[];
  information: Information;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const response: SynchonizeData = {
      stocks: [],
      recipes: [],
      products: [],
      information: {
        createdAt: new Date(),
        id: "",
        isDeleted: false,
        orderBalance: 0,
        outcomeBalance: 0,
        totalBalance: 0,
        transactionBalance: 0,
        updatedAt: new Date(),
        disbursableBalance: 0,
      },
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

    // INFORMATON

    const informations = await db.information.findMany({});
    const information = informations[0];

    let orderBalance = 0;
    let outcomeBalance = 0;
    let transactionBalance = 0;
    let disbursableBalance = 0;

    const [orders, outcomes, transactions] = await Promise.all([
      db.order.findMany({
        where: {
          isDeleted: false,
        },
        select: {
          total: true,
        },
      }),
      db.outcome.findMany({
        where: {
          isDeleted: false,
        },
        select: {
          adminFee: true,
          price: true,
        },
      }),
      db.transaction.findMany({
        where: {
          isDeleted: false,
        },
        select: {
          amount: true,
          type: true,
          category: true,
        },
      }),
    ]);

    for (const order of orders) {
      orderBalance += order.total;
      disbursableBalance += order.total;
    }

    for (const outcome of outcomes) {
      outcomeBalance += outcome.price + outcome.adminFee;
      disbursableBalance -= outcome.price + outcome.adminFee;
    }

    for (const transaction of transactions) {
      if (transaction.type === "Income") {
        transactionBalance += transaction.amount;
      } else {
        transactionBalance -= transaction.amount;
      }

      if (transaction.category === "Financing_Dividend") {
        disbursableBalance -= transaction.amount;
      }
    }

    const totalBalance = orderBalance - outcomeBalance + transactionBalance;

    const updatedInformation = await db.information.update({
      where: {
        id: information.id,
      },
      data: {
        orderBalance,
        outcomeBalance,
        transactionBalance,
        totalBalance,
        disbursableBalance,
      },
    });

    response.information = updatedInformation;

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
