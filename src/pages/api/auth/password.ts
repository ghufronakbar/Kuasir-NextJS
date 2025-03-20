import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import bcrypt from "bcryptjs";
import type { NextApiRequest, NextApiResponse } from "next";

const PUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const { decoded, body } = req;
  const { oldPass, newPass, confirmPass } = body;
  if (!oldPass || !newPass || !confirmPass) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (newPass !== confirmPass) {
    return res.status(400).json({ message: "Confirm password not match" });
  }

  const user = await db.user.findUnique({
    where: {
      id: decoded?.id || "",
    },
    select: {
      password: true,
    },
  });

  const checkPass = await bcrypt.compare(oldPass, user?.password || "");

  if (!checkPass) {
    return res.status(400).json({ message: "Old password not match" });
  }
  const hashPass = await bcrypt.hash(newPass, 10);

  await db.user.update({
    where: {
      id: decoded?.id || "",
    },
    data: {
      password: hashPass,
    },
  });

  return res.status(200).json({ message: "Success edit password", data: user });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { method } = req;
    switch (method) {
      case "PUT":
        return PUT(req, res);
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default AuthApi(handler, ["CASHIER", "OWNER", "MANAGER_OPERATIONAL"]);
