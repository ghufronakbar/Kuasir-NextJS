import { db } from "@/config/db";
import type { NextApiRequest, NextApiResponse } from "next";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const businesses = await db.business.findMany();
    const businessId = businesses[0].id;
    const product = await db.product.updateMany({
      where: {
        id: {
          contains: "",
        },
      },
      data: {
        businessId,
      },
    });
    const outcome = await db.outcome.updateMany({
      where: {
        id: {
          contains: "",
        },
      },
      data: {
        businessId,
      },
    });
    const order = await db.order.updateMany({
      where: {
        id: {
          contains: "",
        },
      },
      data: {
        businessId,
      },
    });
    return res
      .status(200)
      .json({ message: "Seeded", data: { product, outcome, order } });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
