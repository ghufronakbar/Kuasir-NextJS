import { db } from "@/config/db";
import formatDate from "@/helper/formatDate";
import { DetailOrder } from "@/models/schema";
import { Transaction } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next/types";

export interface DataOrder {
  current: Sales;
  previous: Sales;
  gap: Sales;
}

interface Sales {
  omzet: number;
  cogs: number;
  netProfit: number;
  order: number;
  orderItem: number;
}

export interface SalesDetail {
  omzet: number;
  cogs: number;
  netProfit: number;
  order: number;
  orderItem: number;
}

export interface ReportOrder {
  name: string;
  current: SalesDetail;
  previous: SalesDetail;
  gap: SalesDetail;
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
const getDataOrderDaily = async (orders: DetailOrder[]): Promise<DataOrder> => {
  const currDate = new Date();
  const previousDate = new Date(currDate);
  previousDate.setDate(currDate.getDate() - 1); // Mengurangi satu hari

  const previousOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return (
      orderDate.getFullYear() === previousDate.getFullYear() &&
      orderDate.getMonth() === previousDate.getMonth() &&
      orderDate.getDate() === previousDate.getDate()
    );
  });

  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return (
      orderDate.getFullYear() === currDate.getFullYear() &&
      orderDate.getMonth() === currDate.getMonth() &&
      orderDate.getDate() === currDate.getDate()
    );
  });

  const currOmzet = filteredOrders.reduce((acc, order) => acc + order.total, 0);
  const currCogs =
    filteredOrders.reduce(
      (acc, order) =>
        acc +
        order.orderItems.reduce((acc, item) => acc + item.product.cogs, 0),
      0
    ) || 0;
  const currNetProfit = currOmzet - currCogs;

  const prevOmzet = previousOrders.reduce((acc, order) => acc + order.total, 0);
  const prevCogs = previousOrders.reduce(
    (acc, order) =>
      acc + order.orderItems.reduce((acc, item) => acc + item.product.cogs, 0),
    0
  );
  const prevNetProfit = prevOmzet - prevCogs;

  const currOrderItem = filteredOrders.reduce(
    (acc, order) =>
      acc + order.orderItems.reduce((acc, item) => acc + (item.amount || 0), 0),
    0
  );
  const prevOrderItem = previousOrders.reduce(
    (acc, order) =>
      acc + order.orderItems.reduce((acc, item) => acc + (item.amount || 0), 0),
    0
  );

  const data: DataOrder = {
    current: {
      omzet: currOmzet,
      cogs: currCogs,
      netProfit: currNetProfit,
      order: filteredOrders.length,
      orderItem: currOrderItem,
    },
    previous: {
      omzet: prevOmzet,
      cogs: prevCogs,
      netProfit: prevNetProfit,
      order: previousOrders.length,
      orderItem: prevOrderItem,
    },
    gap: {
      omzet: ((currOmzet - prevOmzet) / prevOmzet) * 100 || 0,
      cogs: ((currCogs - prevCogs) / prevCogs) * 100 || 0,
      netProfit: ((currNetProfit - prevNetProfit) / prevNetProfit) * 100 || 0,
      order:
        ((filteredOrders.length - previousOrders.length) /
          previousOrders.length) *
          100 || 0,
      orderItem: ((currOrderItem - prevOrderItem) / prevOrderItem) * 100 || 0,
    },
  };
  return data;
};

const getDataOrderWeekly = async (
  orders: DetailOrder[]
): Promise<DataOrder> => {
  const currDate = new Date();
  const previousDate = new Date(currDate);
  previousDate.setDate(currDate.getDate() - 7); // Mengurangi tujuh hari untuk minggu lalu

  const fourteenDate = new Date(currDate);
  fourteenDate.setDate(currDate.getDate() - 14); // Empat belas hari yang lalu untuk rentang minggu lalu

  const previousOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return (
      orderDate.getFullYear() === previousDate.getFullYear() &&
      orderDate.getMonth() === previousDate.getMonth() &&
      orderDate.getDate() >= fourteenDate.getDate() &&
      orderDate.getDate() <= previousDate.getDate()
    );
  });

  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return (
      orderDate.getFullYear() === currDate.getFullYear() &&
      orderDate.getMonth() === currDate.getMonth() &&
      orderDate.getDate() >= previousDate.getDate() &&
      orderDate.getDate() <= currDate.getDate()
    );
  });

  const currOmzet = filteredOrders.reduce((acc, order) => acc + order.total, 0);
  const currCogs =
    filteredOrders.reduce(
      (acc, order) =>
        acc +
        order.orderItems.reduce((acc, item) => acc + item.product.cogs, 0),
      0
    ) || 0;
  const currNetProfit = currOmzet - currCogs;

  const prevOmzet = previousOrders.reduce((acc, order) => acc + order.total, 0);
  const prevCogs = previousOrders.reduce(
    (acc, order) =>
      acc + order.orderItems.reduce((acc, item) => acc + item.product.cogs, 0),
    0
  );
  const prevNetProfit = prevOmzet - prevCogs;

  const currOrderItem = filteredOrders.reduce(
    (acc, order) =>
      acc + order.orderItems.reduce((acc, item) => acc + (item.amount || 0), 0),
    0
  );
  const prevOrderItem = previousOrders.reduce(
    (acc, order) =>
      acc + order.orderItems.reduce((acc, item) => acc + (item.amount || 0), 0),
    0
  );

  const data: DataOrder = {
    current: {
      omzet: currOmzet,
      cogs: currCogs,
      netProfit: currNetProfit,
      order: filteredOrders.length,
      orderItem: currOrderItem,
    },
    previous: {
      omzet: prevOmzet,
      cogs: prevCogs,
      netProfit: prevNetProfit,
      order: previousOrders.length,
      orderItem: prevOrderItem,
    },
    gap: {
      omzet: ((currOmzet - prevOmzet) / prevOmzet) * 100 || 0,
      cogs: ((currCogs - prevCogs) / prevCogs) * 100 || 0,
      netProfit: ((currNetProfit - prevNetProfit) / prevNetProfit) * 100 || 0,
      order:
        ((filteredOrders.length - previousOrders.length) /
          previousOrders.length) *
          100 || 0,
      orderItem: ((currOrderItem - prevOrderItem) / prevOrderItem) * 100 || 0,
    },
  };
  return data;
};

const getDataOrderMonthly = async (
  orders: DetailOrder[]
): Promise<DataOrder> => {
  const currDate = new Date();
  const previousMonth = new Date(currDate);
  previousMonth.setMonth(currDate.getMonth() - 1); // Mengurangi satu bulan

  const previousOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    console.log({ previousMonth, orderDate });
    return (
      orderDate.getFullYear() === previousMonth.getFullYear() &&
      orderDate.getMonth() === previousMonth.getMonth()
    );
  });

  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return (
      orderDate.getFullYear() === currDate.getFullYear() &&
      orderDate.getMonth() === currDate.getMonth()
    );
  });

  const currOmzet = filteredOrders.reduce((acc, order) => acc + order.total, 0);
  const currCogs =
    filteredOrders.reduce(
      (acc, order) =>
        acc +
        order.orderItems.reduce((acc, item) => acc + item.product.cogs, 0),
      0
    ) || 0;
  const currNetProfit = currOmzet - currCogs;

  const prevOmzet = previousOrders.reduce((acc, order) => acc + order.total, 0);
  const prevCogs = previousOrders.reduce(
    (acc, order) =>
      acc + order.orderItems.reduce((acc, item) => acc + item.product.cogs, 0),
    0
  );
  const prevNetProfit = prevOmzet - prevCogs;

  const currOrderItem = filteredOrders.reduce(
    (acc, order) =>
      acc + order.orderItems.reduce((acc, item) => acc + (item.amount || 0), 0),
    0
  );
  const prevOrderItem = previousOrders.reduce(
    (acc, order) =>
      acc + order.orderItems.reduce((acc, item) => acc + (item.amount || 0), 0),
    0
  );

  const data: DataOrder = {
    current: {
      omzet: currOmzet,
      cogs: currCogs,
      netProfit: currNetProfit,
      order: filteredOrders.length,
      orderItem: currOrderItem,
    },
    previous: {
      omzet: prevOmzet,
      cogs: prevCogs,
      netProfit: prevNetProfit,
      order: previousOrders.length,
      orderItem: prevOrderItem,
    },
    gap: {
      omzet: ((currOmzet - prevOmzet) / prevOmzet) * 100 || 0,
      cogs: ((currCogs - prevCogs) / prevCogs) * 100 || 0,
      netProfit: ((currNetProfit - prevNetProfit) / prevNetProfit) * 100 || 0,
      order:
        ((filteredOrders.length - previousOrders.length) /
          previousOrders.length) *
          100 || 0,
      orderItem: ((currOrderItem - prevOrderItem) / prevOrderItem) * 100 || 0,
    },
  };

  return data;
};

const getAllDataOrder = async (orders: DetailOrder[]): Promise<DataOrder> => {
  let omzet = 0;
  let cogs = 0;
  let netProfit = 0;
  let orderItem = 0;

  for (const order of orders) {
    omzet += order.total;
    netProfit += order.total;
    for (const item of order.orderItems) {
      cogs += item.product.cogs;
      netProfit -= item.product.cogs;
      orderItem += item.amount;
    }
  }

  const current = {
    omzet,
    cogs,
    netProfit,
    order: orders.length,
    orderItem,
  };

  const data: DataOrder = {
    current,
    previous: {
      omzet: 0,
      cogs: 0,
      netProfit: 0,
      order: 0,
      orderItem: 0,
    },
    gap: {
      omzet: 0,
      cogs: 0,
      netProfit: 0,
      order: 0,
      orderItem: 0,
    },
  };
  return data;
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
      findData.omzet -= item.amount;
    } else {
      data.push({
        date: onlyDate,
        expense: -item.amount,
        omzet: 0,
        netProfit: 0,
      });
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

  const orders = await db.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      total: true,
      createdAt: true,
      orderItems: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          product: {
            select: {
              price: true,
              cogs: true,
            },
          },
          amount: true,
        },
      },
    },
    where: {
      AND: {
        isDeleted: false,
      },
    },
  });

  const dailyData = await getDataOrderDaily(orders as DetailOrder[]);
  const monthlyData = await getDataOrderMonthly(orders as DetailOrder[]);
  const weeklyData = await getDataOrderWeekly(orders as DetailOrder[]);
  const allData = await getAllDataOrder(orders as DetailOrder[]);

  const trans = await db.transaction.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      isDeleted: false,
    },
    select: {
      category: true,
      createdAt: true,
      amount: true,
      subCategory: true,
      transaction: true,
    },
  });

  const chartData = await getChartData(trans as Transaction[]);

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
