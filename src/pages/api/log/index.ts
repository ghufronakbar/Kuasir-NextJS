import { db } from "@/config/db";
import AuthApi from "@/middleware/auth-api";
import { NextApiRequest, NextApiResponse } from "next/types";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { decoded } = req;
  const user = await db.user.findUnique({
    where: { id: decoded?.id || "" },
    select: { role: true },
  });
  const logs = await db.logActivity.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
    },

    where:
      user?.role !== "OWNER"
        ? {
            user: {
              id: decoded?.id || "",
            },
          }
        : undefined,
  });
  return res.status(200).json({ message: "OK", data: logs });
};

export default AuthApi(GET, ["OWNER", "MANAGER_OPERATIONAL", "CASHIER"]);
