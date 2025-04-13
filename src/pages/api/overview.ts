import { db } from "@/config/db";
import formatDate from "@/helper/formatDate";
import { $Enums, Transaction } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next/types";

export interface DataOrder {
  current: Sales;
  previous: Sales;
  gap: Sales;
}

interface Sales {
  omzet: number;
  expense: number;
  operational: number;
  netProfit: number;
}

export interface ReportOrder extends DataOrder {
  name: string;
}

export interface Overview {
  order: ReportOrder[];
  chart: {
    chartAnnualy: ChartData[];
    chartMonthly: ChartData[];
    chartWeekly: ChartData[];
    topProduct: BestProduct[];
  };
}

export interface BestProduct {
  image: string | null;
  name: string;
  merchant: string;
  sold: number;
  price: number;
}

export interface ChartData {
  date: string;
  omzet: number;
  netProfit: number;
  expense: number;
}

// Filter data berdasarkan waktu untuk Daily, Weekly, dan Monthly

interface TransactionInput {
  createdAt: Date;
  category: $Enums.TransactionCategoryType;
  transaction: $Enums.TransactionType;
  amount: number;
}

const getDataOrder = async (
  currs: TransactionInput[],
  prevs: TransactionInput[]
): Promise<DataOrder> => {
  const current = {
    expense:
      currs
        .filter(
          (trans) =>
            trans.category === "Product" && trans.transaction === "Expense"
        )
        .reduce((acc, trans) => acc + trans.amount, 0) || 0,
    omzet:
      currs
        .filter(
          (trans) =>
            trans.category === "Product" && trans.transaction === "Income"
        )
        .reduce((acc, trans) => acc + trans.amount, 0) || 0,
    operational:
      currs
        .filter(
          (trans) =>
            trans.category === "Operational" && trans.transaction === "Expense"
        )
        .reduce((acc, trans) => acc + trans.amount, 0) || 0,
    netProfit: 0,
  };

  current.netProfit = current.omzet - current.expense - current.operational;

  const previous = {
    expense:
      prevs
        .filter(
          (trans) =>
            trans.category === "Product" && trans.transaction === "Expense"
        )
        .reduce((acc, order) => acc + order.amount, 0) || 0,
    omzet:
      prevs
        .filter(
          (trans) =>
            trans.category === "Product" && trans.transaction === "Income"
        )
        .reduce((acc, order) => acc + order.amount, 0) || 0,
    operational:
      prevs
        .filter(
          (trans) =>
            trans.category === "Operational" && trans.transaction === "Expense"
        )
        .reduce((acc, order) => acc + order.amount, 0) || 0,
    netProfit: 0,
  };

  previous.netProfit = previous.omzet - previous.expense - previous.operational;

  const gap = {
    expense:
      ((current.expense - previous.expense) / previous.expense) * 100 || 0,
    omzet: ((current.omzet - previous.omzet) / previous.omzet) * 100 || 0,
    operational:
      ((current.operational - previous.operational) / previous.operational) *
        100 || 0,
    netProfit:
      ((current.netProfit - previous.netProfit) / previous.netProfit) * 100 ||
      0,
  };

  return {
    current,
    previous,
    gap,
  };
};

const getDataOrderDaily = async (
  orders: TransactionInput[]
): Promise<DataOrder> => {
  const currDate = new Date();
  const previousDate = new Date(currDate);
  previousDate.setDate(currDate.getDate() - 1); // Mengurangi satu hari

  const prevs = orders.filter((order) => {
    const date = new Date(order.createdAt);
    return (
      date.getFullYear() === previousDate.getFullYear() &&
      date.getMonth() === previousDate.getMonth() &&
      date.getDate() === previousDate.getDate()
    );
  });

  const currs = orders.filter((order) => {
    const date = new Date(order.createdAt);
    return (
      date.getFullYear() === currDate.getFullYear() &&
      date.getMonth() === currDate.getMonth() &&
      date.getDate() === currDate.getDate()
    );
  });

  return await getDataOrder(currs, prevs);
};

const getDataOrderWeekly = async (
  orders: TransactionInput[]
): Promise<DataOrder> => {
  const currDate = new Date();
  const previousDate = new Date(currDate);
  previousDate.setDate(currDate.getDate() - 7); // Mengurangi tujuh hari untuk minggu lalu

  const fourteenDate = new Date(currDate);
  fourteenDate.setDate(currDate.getDate() - 14); // Empat belas hari yang lalu untuk rentang minggu lalu

  const currs = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return (
      orderDate.getFullYear() === previousDate.getFullYear() &&
      orderDate.getMonth() === previousDate.getMonth() &&
      orderDate.getDate() >= fourteenDate.getDate() &&
      orderDate.getDate() <= previousDate.getDate()
    );
  });

  const prevs = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return (
      orderDate.getFullYear() === currDate.getFullYear() &&
      orderDate.getMonth() === currDate.getMonth() &&
      orderDate.getDate() >= previousDate.getDate() &&
      orderDate.getDate() <= currDate.getDate()
    );
  });

  return await getDataOrder(currs, prevs);
};

const getDataOrderMonthly = async (
  orders: TransactionInput[]
): Promise<DataOrder> => {
  const currDate = new Date();
  const previousMonth = new Date(currDate);
  previousMonth.setMonth(currDate.getMonth() - 1); // Mengurangi satu bulan

  const prevs = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return (
      orderDate.getFullYear() === previousMonth.getFullYear() &&
      orderDate.getMonth() === previousMonth.getMonth()
    );
  });

  const currs = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return (
      orderDate.getFullYear() === currDate.getFullYear() &&
      orderDate.getMonth() === currDate.getMonth()
    );
  });

  return await getDataOrder(currs, prevs);
};

const getAllDataOrder = async (
  currs: TransactionInput[]
): Promise<DataOrder> => {
  return await getDataOrder(currs, currs);
};

const getChartData = async (
  transaction: Transaction[]
): Promise<ChartData[]> => {
  const data: ChartData[] = [];

  const expenses = transaction.filter(
    (item) => item.category === "Product" && item.transaction === "Expense"
  );
  const incomes = transaction.filter(
    (item) => item.category === "Product" && item.transaction === "Income"
  );

  for (const item of expenses) {
    const onlyDate = item?.createdAt?.toISOString()?.split("T")[0];

    const findData = data.find((data) => data.date === onlyDate);

    if (findData) {
      findData.expense += item.amount;
      findData.netProfit -= item.amount;
    } else {
      data.push({
        date: onlyDate,
        expense: -item.amount,
        omzet: 0,
        netProfit: -item.amount,
      });
    }
  }
  for (const item of incomes) {
    const onlyDate = item?.createdAt?.toISOString()?.split("T")[0];

    const findData = data.find((data) => data.date === onlyDate);

    if (findData) {
      findData.netProfit += item.amount;
      findData.omzet += item.amount;
    } else {
      data.push({
        date: onlyDate,
        expense: 0,
        omzet: item.amount,
        netProfit: item.amount,
      });
    }
  }  
  return data;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const bestProduct: BestProduct[] = [];

  const orderItems = await db.orderItem.findMany({
    where: {
      isDeleted: false,
    },
    select: {
      product: {
        select: {
          image: true,
          price: true,
          name: true,
        },
      },
      amount: true,
      order: {
        select: {
          merchant: true,
        },
      },
    },
  });

  for (const orderItem of orderItems) {
    const findProduct = bestProduct.find(
      (item) =>
        item.name === orderItem.product.name &&
        item.merchant === orderItem.order.merchant
    );
    if (findProduct) {
      findProduct.sold += orderItem.amount;
    } else {
      bestProduct.push({
        name: orderItem.product.name,
        image: orderItem.product.image,
        merchant: orderItem.order.merchant,
        sold: orderItem.amount,
        price: orderItem.product.price,
      });
    }
  }

  bestProduct.sort((a, b) => b.sold - a.sold);

  const transactions = await db.transaction.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      AND: {
        isDeleted: false,
      },
    },
  });

  const [dailyData, monthlyData, weeklyData, allData, chartData] =
    await Promise.all([
      getDataOrderDaily(transactions),
      getDataOrderMonthly(transactions),
      getDataOrderWeekly(transactions),
      getAllDataOrder(transactions),
      getChartData(transactions),
    ]);

  const year = new Date().getFullYear().toString();
  const sevenDaysAgo = new Date().getDate() - 7;

  const monthName = formatDate(new Date(), true).slice(3);

  const annualChart = chartData.filter((d) => d.date.includes(year));
  const monthlyChart = chartData.filter((d) => d.date.includes(monthName));
  const weeklyChart = chartData.filter(
    (d) => Number(d.date.slice(-2)) <= sevenDaysAgo
  );

  const data: Overview = {
    order: [
      { ...allData, name: "All" },
      { ...dailyData, name: "Daily" },
      { ...monthlyData, name: "Monthly" },
      { ...weeklyData, name: "Weekly" },
    ],
    chart: {
      chartMonthly: monthlyChart.reverse(),
      chartAnnualy: annualChart.reverse(),
      chartWeekly: weeklyChart.reverse(),
      topProduct: bestProduct,
    },
  };

  return res.status(200).json({ message: "OK", data });
};

export default handler;
