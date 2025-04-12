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
    await Promise.all([syncPrice(), syncStock(), syncTransaction()]);
    // await syncPrice();
    // await syncStock();
    // await syncTransaction();
    return res.status(200).json({ message: "Hello World" });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

const syncPrice = async () => {
  const stocks = await db.stock.findMany({
    select: {
      id: true,
      outcomes: {
        where: {
          isDeleted: false,
        },
        select: {
          amount: true,
          price: true,
          stock: {
            select: {
              id: true,
            },
          },
        },
      },
    },
    where: {
      isDeleted: false,
    },
  });

  // Menghitung totalAmountBuy dan totalPrice secara paralel
  const stockUpdates = stocks.map((stock) => {
    const totalAmountBuy = stock.outcomes.reduce(
      (prev, curr) => prev + curr.amount,
      0
    );

    const totalPrice = stock.outcomes.reduce(
      (prev, curr) => prev + curr.price,
      0
    );
    const averagePrice = totalPrice / totalAmountBuy;

    return db.stock.update({
      where: {
        id: stock.id,
      },
      data: {
        averagePrice: averagePrice || 0,
        quantity: totalAmountBuy || 0,
      },
    });
  });

  // Menunggu semua update stock selesai
  await Promise.all(stockUpdates);

  // Mengambil data resep dan menghitung harga resep secara paralel
  const recipes = await db.recipe.findMany({
    where: {
      isDeleted: false,
    },
    select: {
      id: true,
      amount: true,
      stock: {
        select: {
          averagePrice: true,
        },
      },
    },
  });

  const recipeUpdates = recipes.map((recipe) => {
    return db.recipe.update({
      where: {
        id: recipe.id,
      },
      data: {
        price: recipe.stock.averagePrice * recipe.amount || 0,
      },
    });
  });

  // Menunggu semua update resep selesai
  await Promise.all(recipeUpdates);

  // Mengambil data produk dan menghitung cogs secara paralel
  const products = await db.product.findMany({
    where: {
      isDeleted: false,
    },
    select: {
      id: true,
      recipes: {
        where: {
          isDeleted: false,
        },
        select: {
          price: true,
        },
      },
    },
  });

  const productUpdates = products.map((product) => {
    const cogs = product.recipes.reduce((prev, curr) => prev + curr.price, 0);

    return db.product.update({
      where: {
        id: product.id,
      },
      data: {
        cogs,
      },
    });
  });

  // Menunggu semua update produk selesai
  await Promise.all(productUpdates);
};

const syncStock = async () => {
  const [orderItems, outcomes, stocks, defects] = await Promise.all([
    db.orderItem.findMany({
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
        product: {
          select: {
            recipes: {
              where: {
                isDeleted: false,
              },
              select: {
                amount: true,
                stock: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    }),

    db.outcome.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        amount: true,
        stock: {
          select: {
            id: true,
          },
        },
      },
    }),

    db.stock.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
      },
    }),

    db.defect.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        amount: true,
        stock: {
          select: {
            id: true,
          },
        },
      },
    }),
  ]);

  // Memproses data dan mengumpulkan semua update untuk stock
  const stockUpdates = stocks.map((stock) => {
    let totalUsed = 0;
    let totalBuy = 0;
    let totalBroken = 0;

    for (const orderItem of orderItems) {
      for (const recipe of orderItem.product.recipes) {
        if (recipe.stock.id === stock.id) {
          totalUsed += orderItem.amount * recipe.amount;
        }
      }
    }

    for (const outcome of outcomes) {
      if (outcome.stock.id === stock.id) {
        totalBuy += outcome.amount;
      }
    }

    for (const defect of defects) {
      if (defect.stock.id === stock.id) {
        totalBroken += defect.amount;
      }
    }

    const totalQuantity = totalBuy - totalUsed - totalBroken;

    return db.stock.update({
      where: {
        id: stock.id,
      },
      data: {
        quantity: totalQuantity,
      },
    });
  });

  // Menunggu semua update stock selesai
  await Promise.all(stockUpdates);
};

const syncTransaction = async () => {
  const [orders, outcomes] = await Promise.all([
    db.order.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        total: true,
      },
    }),
    db.outcome.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        price: true,
        adminFee: true,
      },
    }),
  ]);

  const [checkTransOrders, checkTransOutcomes] = await Promise.all([
    db.transaction.findMany({
      where: {
        orderId: {
          in: orders.map((order) => order.id),
        },
      },
    }),
    db.transaction.findMany({
      where: {
        outcomeId: {
          in: outcomes.map((o) => o.id),
        },
      },
    }),
  ]);

  const orderWithNoTrans = orders.filter(
    (order) => !checkTransOrders.find((trans) => trans.orderId === order.id)
  );
  const outcomeWithNoTrans = outcomes.filter(
    (o) => !checkTransOutcomes.find((trans) => trans.outcomeId === o.id)
  );

  await Promise.all([
    db.transaction.createMany({
      data: orderWithNoTrans.map((order) => ({
        orderId: order.id,
        amount: order.total,
        category: "Product",
        subCategory: "Sell",
        transaction: "Income",
      })),
    }),
    db.transaction.createMany({
      data: outcomeWithNoTrans.map((out) => ({
        outcomeId: out.id,
        amount: out.price + out.adminFee,
        category: "Product",
        subCategory: "Expenditure",
        transaction: "Expense",
      })),
    }),
  ]);
};

export default handler;
