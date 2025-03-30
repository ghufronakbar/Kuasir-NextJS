import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/config/db";
import { Api } from "@/models/response";
import { initReport, Report } from "@/models/schema";
import AuthApi from "@/middleware/auth-api";

const GET = async (req: NextApiRequest, res: NextApiResponse<Api<Report>>) => {
  const transactions = await db.transaction.findMany({
    where: { AND: [{ category: "Finance" }, { isDeleted: false }] },
    select: { amount: true, transaction: true },
  });
  const report = { ...initReport };
  for (const transaction of transactions) {
    if (transaction.transaction === "Expense") {
      report.minus += transaction.amount;
    } else {
      report.plus += transaction.amount;
    }
  }
  const transfers = await db.transaction.findMany({
    where: {
      AND: [
        {
          isDeleted: false,
        },
        {
          sender: "Finance",
        },
      ],
    },
    select: {
      amount: true,
    },
  });

  for (const transfer of transfers) {
    report.minus += transfer.amount;
    report.total -= transfer.amount;
  }
  report.total = report.plus - report.minus;
  return res.status(200).json({ message: "OK", data: report });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") return GET(req, res);
};

export default AuthApi(handler, ["OWNER"]);
