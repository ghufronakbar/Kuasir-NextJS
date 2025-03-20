import { db } from "@/config/db";
import { JWT_SECRET } from "@/constants";
import AuthApi from "@/middleware/auth-api";
import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { decoded } = req;

  const user = await db.user.findUnique({
    where: {
      id: decoded?.id || "",
    },
  });

  return res.status(200).json({ message: "Success", data: user });
};

const PUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const { decoded, body } = req;
  const { name, email } = body;
  if (!name || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const checkEmail = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (checkEmail && checkEmail.id !== decoded?.id) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const user = await db.user.update({
    where: {
      id: decoded?.id || "",
    },
    data: {
      name,
      email,
    },
  });

  const { id, role, image } = user;
  const data = {
    id,
    role,
    name,
    email,
    image,
  };

  const accessToken = jwt.sign(data, JWT_SECRET, {
    expiresIn: "1d",
  });

  return res
    .status(200)
    .json({ message: "Success edit profile", data: { ...user, accessToken } });
};

const PATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  const { decoded, body } = req;
  const { image } = body;

  const user = await db.user.update({
    where: {
      id: decoded?.id || "",
    },
    data: {
      image: image || null,
    },
  });

  const { id, role, name, email } = user;
  const data = {
    id,
    role,
    name,
    email,
    image,
  };

  const accessToken = jwt.sign(data, JWT_SECRET, {
    expiresIn: "1d",
  });

  return res.status(200).json({
    message: image
      ? "Success edit profile picture"
      : "Success delete profile picture",
    data: { ...user, accessToken },
  });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { method } = req;
    switch (method) {
      case "GET":
        return GET(req, res);
      case "PUT":
        return PUT(req, res);
      case "PATCH":
        return PATCH(req, res);
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default AuthApi(handler, ["CASHIER", "OWNER", "MANAGER_OPERATIONAL"]);
