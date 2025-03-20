import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/config/db";
import { $Enums } from "@prisma/client";
import { sendEmail } from "@/utils/node-mailer/send-email";
import AuthApi from "@/middleware/auth-api";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";

  const user = await db.user.findUnique({
    where: {
      id,
    },
    include: {
      logActivities: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return res.status(200).json({ message: "OK", data: user });
};

const PATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, decoded } = req;
  const { role } = body;

  const id = (req.query.id as string) || "";

  if (!role || !id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (Object.values($Enums.Role).includes(role) === false) {
    return res.status(400).json({ message: "Role is invalid" });
  }

  const user = await db.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const userWhoLogin = await db.user.findUnique({
    where: {
      id: decoded?.id,
    },
  });

  const updateUser = await db.user.update({
    where: {
      id: id,
    },
    data: {
      role,
    },
  });

  await sendEmail(
    user.email,
    "ANNOUNCEMENT",
    user.name,
    `Your role has been updated to ${role}`
  );

  await db.logActivity.create({
    data: {
      userId: decoded?.id,
      description: `User ${userWhoLogin?.name} update user ${user.name} from role ${user.role} to role ${role}`,
      referenceId: user.id,
      referenceModel: "User",
      type: "UPDATE",
      detail: user,
    },
  });

  return res
    .status(200)
    .json({ message: "Success update user", data: updateUser });
};

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = (req.query.id as string) || "";
  const { decoded } = req;

  const user = await db.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const userWhoLogin = await db.user.findUnique({
    where: {
      id: decoded?.id,
    },
  });

  const updateUser = await db.user.update({
    where: {
      id: id,
    },
    data: {
      isDeleted: true,
    },
  });

  await sendEmail(
    user.email,
    "DELETE_ACCOUNT",
    user.name,
    `Your account has been deleted`
  );

  await db.logActivity.create({
    data: {
      userId: decoded?.id,
      description: `User ${userWhoLogin?.name} delete user ${user.name}`,
      referenceId: user.id,
      referenceModel: "User",
      type: "DELETE",
      detail: user,
    },
  });

  return res
    .status(200)
    .json({ message: "Success delete user", data: updateUser });
};
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "GET") {
      return await AuthApi(GET, ["OWNER"])(req, res);
    }
    if (req.method === "PATCH") {
      return await AuthApi(PATCH, ["OWNER"])(req, res);
    }
    if (req.method === "DELETE") {
      return await AuthApi(DELETE, ["OWNER"])(req, res);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default handler;
