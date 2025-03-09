import { NextApiRequest, NextApiResponse } from "next";
import AuthApi from "@/middleware/auth-api";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { decoded } = req;

    return res.status(200).json({ message: "HELLO", decoded });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return GET(req, res);
  }
}

export default AuthApi(handler, ["OWNER"]);
