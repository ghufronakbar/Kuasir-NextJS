import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { saveToLog } from "@/services/server/saveToLog";
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
    const { body } = req;
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
      include: {
        businesses: {
          where: {
            isDeleted: false,
          },
        },
      },
    });

    await saveToLog(req, "ParentBusiness", pb);

    return res
      .status(200)
      .json({ message: "Successfull edit parent business", data: pb });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const id = (req.query.id as string) || "";
    const check = await db.parentBusiness.findUnique({
      where: {
        id,
      },
    });

    if (!check) {
      return res.status(400).json({ message: "Parent business not found" });
    }

    const business = await db.parentBusiness.update({
      where: {
        id: (req.query.id as string) || "",
      },
      data: {
        isDeleted: true,
      },
      include: {
        businesses: {
          where: {
            isDeleted: false,
          },
        },
      },
    });

    await saveToLog(req, "ParentBusiness", business);

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
