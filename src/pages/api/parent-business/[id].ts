import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const pb = await db.parentBusiness.findUnique({
    where: {
      id,
    },
    include: {
      businesses: {
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
      },
    },
  });

  if (!pb) {
    return res.status(404).json({ message: "Parent business not found" });
  }

  if (pb?.isDeleted) {
    return res.status(404).json({ message: "Parent business not found" });
  }

  return res.status(200).json({ message: "OK", data: pb });
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

    const checkName = await db.parentBusiness.findFirst({
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
      return res.status(400).json({ message: "Parent business not found" });
    }

    if (checkId && checkName && checkName.id !== checkId.id) {
      return res
        .status(400)
        .json({ message: "Parent business name already exist" });
    }

    const pb = await db.parentBusiness.update({
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
        referenceId: pb.id,
        referenceModel: "ParentBusiness",
        userId: decoded?.id || "",
        type: "UPDATE",
        description: `${user?.name} edit parent business ${checkId.name} to ${pb.name}`,
        detail: pb,
        before: checkId,
      },
    });

    return res
      .status(200)
      .json({ message: "Successfull edit parent business", data: create });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { decoded } = req;
    const id = (req.query.id as string) || "";
    const check = await db.parentBusiness.findUnique({
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
      return res.status(400).json({ message: "Parent business not found" });
    }

    const business = await db.parentBusiness.update({
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
        referenceModel: "ParentBusiness",
        userId: (req.query.id as string) || "",
        type: "DELETE",
        description: `${user.name} delete parent business ${check.name}`,
        detail: business,
      },
    });

    return res.status(200).json({
      message: "Successfull delete parent business",
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
