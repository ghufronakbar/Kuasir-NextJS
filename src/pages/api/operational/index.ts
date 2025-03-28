import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/config/db";
import { Api } from "@/models/response";
import { initReport, Report } from "@/models/schema";
import AuthApi from "@/middleware/auth-api";

const GET = async (req: NextApiRequest, res: NextApiResponse<Api<Report>>) => {
  const finances = await db.finance.findMany({
    where: { isDeleted: false },
    select: { amount: true, transaction: true },
  });
  const report = { ...initReport };
  for (const finance of finances) {
    if (finance.transaction === "Expense") {
      report.minus += finance.amount;
    } else {
      report.plus += finance.amount;
    }
  }
  report.total = report.plus - report.minus;
  return res.status(200).json({ message: "OK", data: report });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") return GET(req, res);
};

export default AuthApi(handler, ["OWNER"]);
