import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { db } from "@/config/db";
import { $Enums } from "@prisma/client";
import { sendEmail } from "@/utils/node-mailer/send-email";
import AuthApi from "@/middleware/auth-api";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const users = await db.user.findMany({
    where: {
      isDeleted: false,
    },
  });

  return res.status(200).json({ message: "OK", data: users });
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, decoded } = req;
  const { name, email, role } = body;

  if (!name || !email || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (Object.values($Enums.Role).includes(role) === false) {
    return res.status(400).json({ message: "Role is invalid" });
  }

  const checkEmail = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (checkEmail) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const randomPassword = Math.random().toString(36).slice(-8);
  const hashPass = await bcrypt.hash(randomPassword, 10);

  await sendEmail(email, "CREATE_ACCOUNT", name, randomPassword);

  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashPass,
      role,
      image: null,
      isDeleted: false,
    },
  });

  const userWhoLogin = await db.user.findUnique({
    where: {
      id: decoded?.id,
    },
  });

  await db.logActivity.create({
    data: {
      userId: decoded?.id,
      description: `User ${userWhoLogin?.name} create new user ${user.name} (${role})`,
      referenceId: user.id,
      referenceModel: "User",
      type: "CREATE",
      detail: user,
    },
  });

  return res
    .status(201)
    .json({ message: "Success create new user", data: user });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "GET") {
      return await AuthApi(GET, ["OWNER"])(req, res);
    } else if (req.method === "POST") {
      return await AuthApi(POST, ["OWNER"])(req, res);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default handler;
