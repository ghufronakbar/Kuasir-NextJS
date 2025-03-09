import { JWT_SECRET } from "@/pages/constants";
import { $Enums } from "@prisma/client";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";

export default function AuthApi(
  handler: (req: NextApiRequest, res: NextApiResponse) => void,
  roles: $Enums.Role[]
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized",
      });
    }

    try {
      const token = authorization.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        role: $Enums.Role;
      };

      if (!decoded) {
        return res.status(401).json({
          status: 401,
          message: "Unauthorized",
        });
      }
      if (!decoded.id) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }
      if (decoded && !roles.includes(decoded.role)) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      req.decoded = decoded;
      return handler(req, res);
    } catch (error) {
      console.log(error);
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
  };
}
