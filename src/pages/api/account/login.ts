import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "@/config/db";
import { JWT_SECRET } from "@/constants";

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { email, password } = req.body;
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email ||
      !password
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await db.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { id, role, name } = user;
    const data = {
      id,
      role,
      name,
      email,
    };

    const accessToken = jwt.sign(data, JWT_SECRET, {
      expiresIn: "1d",
    });

    // res.setHeader("Set-Cookie", []);

    return res
      .status(200)
      .json({ message: "Login successful", data: { ...data, accessToken } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    return await POST(req, res);
  }
}
