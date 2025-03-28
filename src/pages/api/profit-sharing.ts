import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/config/db";
import { sync } from "@/services/server/sync";
import { saveToLog } from "@/services/server/saveToLog";
import AuthApi from "@/middleware/auth-api";
import { $Enums } from "@prisma/client";
import formatRupiah from "@/helper/formatRupiah";

interface CreateProfitSharing {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactions: any[];
}

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body } = req;
  const { percentage, person } = body;

  if (isNaN(Number(percentage)) || isNaN(Number(person)))
    return res.status(400).json({ message: "Invalid fields" });

  if (Number(percentage) < 0 || Number(percentage) > 100)
    return res.status(400).json({ message: "Invalid percentage" });

  if (Number(person) < 0)
    return res.status(400).json({ message: "Invalid person" });

  await sync();

  const businesses = await db.business.findMany({
    where: {
      isDeleted: false,
    },
    select: {
      id: true,
      name: true,
      orders: {
        select: {
          total: true,
        },
        where: {
          isDeleted: false,
        },
      },
    },
  });

  const data: CreateProfitSharing = {
    transactions: [],
  };

  const transactions = await db.transaction.findMany({
    where: {
      AND: [
        {
          isDeleted: false,
        },
        {
          category: {
            equals: $Enums.TransactionCategory.Financing_Dividend,
          },
        },
      ],
    },
    select: {
      id: true,
      amount: true,
      businessId: true,
    },
  });

  const outcomes = await db.outcome.findMany({
    where: {
      isDeleted: false,
    },
    select: {
      price: true,
      businessId: true,
    },
  });

  for (const business of businesses) {
    const totalOrder = business.orders.reduce(
      (total, order) => total + order.total,
      0
    );
    const trans = transactions.filter(
      (transaction) => transaction.businessId === business.id
    );
    const totalTrans = trans.reduce(
      (total, transaction) => total + transaction.amount,
      0
    );

    const outc = outcomes.filter(
      (outcome) => outcome.businessId === business.id
    );

    const totalOutcome = outc.reduce(
      (total, outcome) => total + outcome.price,
      0
    );
    const maxDisbursableBalance = totalOrder - totalTrans - totalOutcome;
    const disbursed = maxDisbursableBalance * (Number(percentage) / 100);
    const perPerson = disbursed / Number(person);

    const transaction = await db.transaction.create({
      data: {
        amount: disbursed,
        category: "Financing_Dividend",
        title: "Profit Sharing",
        type: "Expense",
        businessId: business.id,
        description: `Profit Sharing to ${person} person (${
          Number(percentage) / Number(person)
        }% ≈ ${formatRupiah(perPerson)} per person)`,
      },
    });

    data.transactions.push(transaction);
  }

  await sync();
  await saveToLog(req, "Transaction", data);

  return res
    .status(200)
    .json({ message: "Success to create profit sharing", data: data });
};

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const percentage = (req.query.percentage as string) || "0";
  const person = (req.query.person as string) || "0";

  if (isNaN(Number(percentage)) || isNaN(Number(person)))
    return res.status(400).json({ message: "Invalid fields" });

  if (Number(percentage) < 0 || Number(percentage) > 100)
    return res.status(400).json({ message: "Invalid percentage" });

  if (Number(person) < 0)
    return res.status(400).json({ message: "Invalid person" });

  const synced = await sync();

  const information = synced.information;

  if (information.disbursableBalance <= 0) {
    return res.status(400).json({ message: "Not enough disbursable balance" });
  }

  const data: CalculateProfit = {
    percentage: Number(percentage),
    person: Number(person),
    percentagePerPerson: Number(percentage) / Number(person),
    totalPerPerson: 0,
    total: 0,
    remaining: 0,
  };

  data.total = (information.disbursableBalance * Number(percentage)) / 100;

  data.totalPerPerson =
    (information.disbursableBalance * Number(percentage)) /
    100 /
    Number(person);

  data.remaining =
    information.disbursableBalance - data.totalPerPerson * Number(person);

  return res
    .status(200)
    .json({ message: "Success to calculate profit sharing", data: data });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      return await GET(req, res);
    case "POST":
      return await POST(req, res);
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
};

export default AuthApi(handler, ["OWNER"]);

export interface CalculateProfit {
  percentage: number;
  person: number;
  percentagePerPerson: number;
  totalPerPerson: number;
  total: number;
  remaining: number;
}
