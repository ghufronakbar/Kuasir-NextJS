import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/config/db";
import { sendBulkWhatsapp } from "@/utils/whatsapp/send-bulk-whatsapp";
import { $Enums } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { method } = req;
    switch (method) {
      case "POST":
        return POST(req, res);
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { title, message, business } = req.body;
  if (!title || !message || !business) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  if (!Object.values($Enums.Business).includes(business)) {
    return res.status(400).json({ message: "Invalid business" });
  }

  const customers = await db.customer.findMany({
    where: {
      isDeleted: false,
    },
    select: {
      orders: {
        select: {
          business: true,
        },
        where: {
          AND: [
            {
              business: {
                equals: business,
              },
            },
            {
              isDeleted: false,
            },
          ],
        },
      },
      type: true,
      id: true,
      name: true,
    },
  });

  const customerWithPhones = customers.filter(
    (item) => item.type === "Phone" && item.orders.length > 0
  );
  const phones = customerWithPhones.map((item) => item.id);
  const names = customerWithPhones.map((item) => item.name);
  const success = await sendBulkWhatsapp(
    phones,
    names,
    business,
    title,
    message
  );
  return res.status(200).json({
    message: `Success to broadcast message to ${success} customer`,
    data: null,
  });
};
