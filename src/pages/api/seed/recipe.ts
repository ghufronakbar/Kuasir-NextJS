import { db } from "@/config/db";
import { NextApiRequest, NextApiResponse } from "next/types";

const RECIPES = [
  // { name: "Daging Sapi", price: 135, quantity: 1 },
  // { name: "Air Kelapa", price: 2, quantity: 1.5 },
  // { name: "Bawang Putih", price: 44, quantity: 0.03 },
  // { name: "Asam Jawa", price: 5, quantity: 0.25 },
  // { name: "Masako Sapi 100gr", price: 4.5, quantity: 0.18 },
  // { name: "Garam 500gr", price: 7.6, quantity: 0.03 },

  // { name: "Cabe Keriting", price: 72, quantity: 1 },
  // { name: "Bawang Putih", price: 44, quantity: 0.5 },
  // { name: "Bawang Merah", price: 40, quantity: 0.5 },
  // { name: "Gula", price: 17.2, quantity: 15 },
  // { name: "Ajinomoto 250gr", price: 13.6, quantity: 0.01 },
  // { name: "Garam 500gr", price: 7.6, quantity: 0.03 },
  // { name: "Minyak Goreng(1L)", price: 14, quantity: 0.5 },

  { name: "Kentang", price: 18, quantity: 1 },
  // { name: "Selada", price: 3, quantity: 1 },

  // { name: "Beras", price: 13.9, quantity: 1 },

  // { name: "Beras", price: 13.9, quantity: 1 },
  // { name: "ES Batu", price: 200, quantity: 1 },
  // { name: "Plastik Teh", price: 90, quantity: 1 },
  // { name: "Gula", price: 17.2, quantity: 0.015 },
  // { name: "Teh Tjatoet", price: 7.6, quantity: 0.02 },
  // { name: "Teh Ekonomis", price: 1.9, quantity: 0.03 },
  // { name: "Sedotan", price: 57, quantity: 1 },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(200).json({ message: "OK" });
  const stocks = await db.stock.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
    include: {
      recipes: true,
    },
  });

  const productId = "extra-kentang";

  const data = [];

  for (const recipe of RECIPES) {
    const stock = stocks.find(
      (s) => s.name.toLowerCase() === recipe.name.toLowerCase()
    );
    if (!stock) continue;
    const result = await db.recipe.create({
      data: {
        amount: recipe.quantity,
        price: recipe.price,
        stockId: stock?.id || "",
        productId,
      },
      include: {
        stock: true,
      },
    });
    data.push(result);
  }

  return res.status(200).json({ message: "OK", data });
}
