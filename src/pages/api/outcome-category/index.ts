import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const outcomeCategory = await db.outcomeCategory.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      outcomes: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    where: {
      isDeleted: false,
    },
  });

  return res.status(200).json({ message: "OK", data: outcomeCategory });
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { decoded, body } = req;
    const { name } = body;
    if (!name || typeof name !== "string")
      return res.status(400).json({ message: "All fields are required" });
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
      },
    });

    if (checkName)
      return res
        .status(400)
        .json({ message: "Outcome category name already exist" });

    const outcomeCategory = await db.outcomeCategory.create({
      data: {
        name,
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
        type: "CREATE",
        description: `${user?.name} create outcome category ${outcomeCategory.name}`,
        detail: outcomeCategory,
      },
    });

    return res
      .status(200)
      .json({
        message: "Successfull create outcome category",
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

  if (req.method === "POST") {
    return AuthApi(POST, ["OWNER"])(req, res);
  }
};

export default handler;
