import { db } from "@/config/db";
import { NextApiRequest, NextApiResponse } from "next/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const check = await db.stock.findMany({});
  if (check.length > 0)
    return res.status(400).json({ message: "Stock already exist" });
  const stock = await db.stock.createMany({
    data: [
      { name: "Daging Sapi", unit: "Kg" },
      { name: "Air Kelapa", unit: "Bungkus" },
      { name: "Bawang Merah", unit: "Kg" },
      { name: "Bawang Putih", unit: "Kg" },
      { name: "Cabai Kriting", unit: "Kg" },
      { name: "Kentang", unit: "Kg" },
      { name: "Asam Jawa", unit: "Bungkus" },
      { name: "Selada", unit: "Bungkus" },
      { name: "Masako Sapi 100gr", unit: "Bungkus" },
      { name: "Garam 500gr", unit: "Bungkus" },
      { name: "Ajinomoto 250gr", unit: "Bungkus" },
      { name: "Teh Tjatoet", unit: "Bungkus" },
      { name: "Teh Ekonomis", unit: "Bungkus" },
      { name: "Minyak Goreng(1L)", unit: "Liter" },
      { name: "Gula", unit: "Kg" },
      { name: "Beras", unit: "Kg" },
      { name: "Kemasan", unit: "Bungkus" },
      { name: "Sendok Plastik", unit: "Pcs" },
      { name: "Kresek", unit: "Pcs" },
      { name: "Sedotan", unit: "Pcs" },
      { name: "Plastik Teh", unit: "Pcs" },
      { name: "Gas LPG", unit: "Tabung" },
    ],
  });

  return res.status(200).json({ data: stock });
}
