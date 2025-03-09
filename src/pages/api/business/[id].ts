import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const business = await db.business.findUnique({
    where: {
      id,
    },
    include: {
      orders: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          orderItems: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
  });

  if (!business) {
    return res.status(404).json({ message: "Business not found" });
  }

  if (business?.isDeleted) {
    return res.status(404).json({ message: "Business not found" });
  }

  return res.status(200).json({ message: "OK", data: business });
};

const PUT = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const id = (req.query.id as string) || "";
    const { decoded, body } = req;
    const { name } = body;
    if (!name || typeof name !== "string")
      return res.status(400).json({ message: "All fields are required" });
    const checkId = await db.business.findUnique({
      where: {
        id,
      },
    });

    const checkName = await db.business.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
      select: {
        name: true,
        id: true,
      },
    });

    if (!checkId) {
      return res.status(400).json({ message: "Business not found" });
    }

    if (checkId && checkName && checkName.id !== checkId.id) {
      return res.status(400).json({ message: "Business name already exist" });
    }

    const business = await db.business.update({
      data: {
        name,
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

    const create = await db.logActivity.create({
      data: {
        referenceId: business.id,
        referenceModel: "Business",
        userId: decoded?.id || "",
        type: "UPDATE",
        description: `${user?.name} edit business ${checkId.name} to ${business.name}`,
        detail: business,
        before: checkId,
      },
    });

    return res
      .status(200)
      .json({ message: "Successfull create business", data: create });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { decoded } = req;
    const id = (req.query.id as string) || "";
    const check = await db.business.findUnique({
      where: {
        id,
      },
    });
    const user = await db.user.findUnique({
      where: {
        id: decoded?.id || "",
      },
    });

    if (!check || !user) {
      return res.status(400).json({ message: "Business not found" });
    }

    const business = await db.business.update({
      where: {
        id: (req.query.id as string) || "",
      },
      data: {
        isDeleted: true,
      },
    });

    await db.logActivity.create({
      data: {
        referenceId: business.id,
        referenceModel: "Business",
        userId: (req.query.id as string) || "",
        type: "DELETE",
        description: `${user.name} delete business ${check.name}`,
        detail: business,        
      },
    });

    return res.status(200).json({
      message: "Successfull delete business",
      data: business,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    return await AuthApi(GET, ["OWNER"])(req, res);
  }

  if (req.method === "PUT") {
    return await AuthApi(PUT, ["OWNER"])(req, res);
  }

  if (req.method === "DELETE") {
    return await AuthApi(DELETE, ["OWNER"])(req, res);
  }
};

export default handler;
