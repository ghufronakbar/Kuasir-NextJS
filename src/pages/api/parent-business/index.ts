import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { saveToLog } from "@/services/server/saveToLog";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const pbs = await db.parentBusiness.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      businesses: true,
    },
    where: {
      isDeleted: false,
    },
  });

  return res.status(200).json({ message: "OK", data: pbs });
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { body } = req;
    const { name } = body;
    if (!name || typeof name !== "string")
      return res.status(400).json({ message: "All fields are required" });
    const checkName = await db.parentBusiness.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (checkName && !checkName.isDeleted)
      return res
        .status(400)
        .json({ message: "Parent business name already exist" });

    const pb = await db.parentBusiness.create({
      data: {
        name,
      },
    });

    await saveToLog(req, "ParentBusiness", pb.id);

    return res
      .status(200)
      .json({ message: "Successfull create parent business", data: pb });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    return AuthApi(GET, ["OWNER", "CASHIER", "MANAGER_OPERATIONAL"])(req, res);
  }

  if (req.method === "POST") {
    return AuthApi(POST, ["OWNER"])(req, res);
  }
};

export default handler;
