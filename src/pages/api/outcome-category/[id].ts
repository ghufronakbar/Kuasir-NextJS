import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const outcomeCategory = await db.outcomeCategory.findUnique({
    include: {
      outcomes: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    where: {
      id,
    },
  });

  return res.status(200).json({ message: "OK", data: outcomeCategory });
};

const PUT = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const id = (req.query.id as string) || "";
    const { decoded, body } = req;
    const { name } = body;
    if (!name || typeof name !== "string")
      return res.status(400).json({ message: "All fields are required" });

    const checkId = await db.outcomeCategory.findUnique({
      where: {
        id,
      },
    });

    const checkName = await db.outcomeCategory.findFirst({
      where: {
        AND: [
          {
            name: {
              equals: name,
              mode: "insensitive",
            },
          },
          {
            isDeleted: false,
          },
        ],
      },
      select: {
        name: true,
        id: true,
      },
    });

    if (checkName && checkName.id !== id)
      return res
        .status(400)
        .json({ message: "Outcome category name already exist" });

    if (!checkId) {
      return res.status(400).json({ message: "Outcome category not found" });
    }

    const outcomeCategory = await db.outcomeCategory.update({
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

    await db.logActivity.create({
      data: {
        referenceId: outcomeCategory.id,
        referenceModel: "OutcomeCategory",
        userId: decoded?.id || "",
        type: "UPDATE",
        description: `${user?.name} edit outcome category ${checkId.name} to ${outcomeCategory.name}`,
        detail: outcomeCategory,
        before: checkId,
      },
    });

    return res.status(200).json({
      message: "Successfull create outcome category",
      data: outcomeCategory,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { decoded } = req;
    const id = (req.query.id as string) || "";
    const check = await db.outcomeCategory.findUnique({
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
      return res.status(400).json({ message: "Outcome category not found" });
    }

    const outcomeCategory = await db.outcomeCategory.update({
      data: {
        isDeleted: true,
      },
      where: {
        id,
      },
    });

    await db.logActivity.create({
      data: {
        referenceId: outcomeCategory.id,
        referenceModel: "OutcomeCategory",
        userId: decoded?.id || "",
        type: "DELETE",
        description: `${user?.name} delete outcome category ${check.name}`,
        detail: outcomeCategory,        
      },
    });

    return res.status(200).json({
      message: "Successfull delete outcome category",
      data: outcomeCategory,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    return AuthApi(GET, ["OWNER"])(req, res);
  }

  if (req.method === "PUT") {
    return AuthApi(PUT, ["OWNER"])(req, res);
  }

  if (req.method === "DELETE") {
    return AuthApi(DELETE, ["OWNER"])(req, res);
  }
};

export default handler;
