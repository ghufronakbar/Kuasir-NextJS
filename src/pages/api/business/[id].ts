import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { saveToLog } from "@/services/server/saveToLog";
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
    const { body } = req;
    const { name, parentBusiness } = body;
    if (
      !name ||
      typeof name !== "string" ||
      !parentBusiness ||
      typeof parentBusiness !== "string"
    )
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

    const checkParentBusiness = await db.parentBusiness.findFirst({
      where: {
        name: parentBusiness,
      },
    });

    let parentBusinessId = checkParentBusiness?.id;

    if (!checkParentBusiness) {
      const pb = await db.parentBusiness.create({
        data: {
          name: parentBusiness,
        },
      });
      parentBusinessId = pb.id;
    } else if (checkParentBusiness.isDeleted) {
      const pb = await db.parentBusiness.update({
        where: {
          id: checkParentBusiness.id,
        },
        data: {
          isDeleted: false,
        },
      });
      parentBusinessId = pb.id;
    }

    const business = await db.business.update({
      data: {
        name,
        parentBusinessId,
      },
      where: {
        id,
      },
      include: {
        parentBusiness: true,
      },
    });

    await saveToLog(req, "Business", business);

    return res
      .status(200)
      .json({ message: "Successfull edit business", data: business });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const id = (req.query.id as string) || "";
    const check = await db.business.findUnique({
      where: {
        id,
      },
    });

    if (!check) {
      return res.status(400).json({ message: "Business not found" });
    }

    const business = await db.business.update({
      where: {
        id: (req.query.id as string) || "",
      },
      data: {
        isDeleted: true,
      },
      include: {
        parentBusiness: true,
      },
    });

    await saveToLog(req, "Business", business);

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
