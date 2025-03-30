import { db } from "@/config/db";
import { Report } from "@/models/schema";
import { NextApiRequest, NextApiResponse } from "next/types";

export interface Wallet {
  report: {
    all: Report;
    order: Report;
    operational: Report;
    capital: Report;
    finance: Report;
  };
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const [reportCapital, reportFinance, reportOperational, reportOrder] =
    await Promise.all([
      getReportCapital(),
      getReportFinance(),
      getReportOperational(),
      getReportOrder(),
    ]);

  const all = {
    total:
      reportCapital.total +
      reportFinance.total +
      reportOperational.total +
      reportOrder.total,
    plus:
      reportCapital.plus +
      reportFinance.plus +
      reportOperational.plus +
      reportOrder.plus,
    minus:
      reportCapital.minus +
      reportFinance.minus +
      reportOperational.minus +
      reportOrder.minus,
  };

  const data: Wallet = {
    report: {
      all,
      capital: reportCapital,
      finance: reportFinance,
      operational: reportOperational,
      order: reportOrder,
    },
  };

  return res.status(200).json({ message: "OK", data });
};

export default handler;

const getReportCapital = async (): Promise<Report> => {
  const data = {
    total: 0,
    plus: 0,
    minus: 0,
  };
  const capitals = await db.transaction.findMany({
    where: {
      AND: [
        {
          isDeleted: false,
        },
        {
          category: "Capital",
        },
      ],
    },
    select: {
      transaction: true,
      amount: true,
    },
  });
  for (const capital of capitals) {
    if (capital.transaction === "Expense") {
      data.minus += capital.amount;
      data.total -= capital.amount;
    } else {
      data.plus += capital.amount;
      data.total += capital.amount;
    }
  }

  const transfers = await db.transaction.findMany({
    where: {
      AND: [
        {
          isDeleted: false,
        },
        {
          sender: "Capital",
        },
      ],
    },
    select: {
      amount: true,
    },
  });

  for (const transfer of transfers) {
    data.minus += transfer.amount;
    data.total -= transfer.amount;
  }
  return data;
};

const getReportFinance = async (): Promise<Report> => {
  const data = {
    total: 0,
    plus: 0,
    minus: 0,
  };
  const finances = await db.transaction.findMany({
    where: {
      AND: [
        {
          isDeleted: false,
        },
        {
          category: "Finance",
        },
      ],
    },
    select: {
      transaction: true,
      amount: true,
    },
  });
  for (const finance of finances) {
    if (finance.transaction === "Expense") {
      data.minus += finance.amount;
      data.total -= finance.amount;
    } else {
      data.plus += finance.amount;
      data.total += finance.amount;
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
    data.minus += transfer.amount;
    data.total -= transfer.amount;
  }
  return data;
};

const getReportOperational = async (): Promise<Report> => {
  const data = {
    total: 0,
    plus: 0,
    minus: 0,
  };
  const operationals = await db.transaction.findMany({
    where: {
      AND: [
        {
          isDeleted: false,
        },
        {
          category: "Operational",
        },
      ],
    },
    select: {
      transaction: true,
      amount: true,
    },
  });
  for (const operational of operationals) {
    if (operational.transaction === "Expense") {
      data.minus += operational.amount;
      data.total -= operational.amount;
    } else {
      data.plus += operational.amount;
      data.total += operational.amount;
    }
  }

  const transfers = await db.transaction.findMany({
    where: {
      AND: [
        {
          isDeleted: false,
        },
        {
          sender: "Operational",
        },
      ],
    },
    select: {
      amount: true,
    },
  });

  for (const transfer of transfers) {
    data.minus += transfer.amount;
    data.total -= transfer.amount;
  }
  return data;
};

const getReportOrder = async (): Promise<Report> => {
  const data = {
    total: 0,
    plus: 0,
    minus: 0,
  };
  const operationals = await db.transaction.findMany({
    where: {
      AND: [
        {
          isDeleted: false,
        },
        {
          category: "Product",
        },
      ],
    },
    select: {
      transaction: true,
      amount: true,
    },
  });
  for (const operational of operationals) {
    if (operational.transaction === "Expense") {
      data.minus += operational.amount;
      data.total -= operational.amount;
    } else {
      data.plus += operational.amount;
      data.total += operational.amount;
    }
  }

  const transfers = await db.transaction.findMany({
    where: {
      AND: [
        {
          isDeleted: false,
        },
        {
          sender: "Product",
        },
      ],
    },
    select: {
      amount: true,
    },
  });

  for (const transfer of transfers) {
    data.minus += transfer.amount;
    data.total -= transfer.amount;
  }
  return data;
};
