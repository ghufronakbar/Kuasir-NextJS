import { db } from "@/config/db";
import formatDate from "@/helper/formatDate";
import { DetailOrder, DetailProduct } from "@/models/schema";
import { Outcome, Product } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next/types";

/**
 Expected Output
 */

export interface DataOrder {
  current: DetailDataOrder;
  previous: DetailDataOrder;
  gap: DetailDataOrder;
}

interface DetailDataOrder {
  omzet: number;
  cogs: number;
  netProfit: number;
  order: number;
  orderItem: number;
}

const getDataOrderDaily = async (orders: DetailOrder[]): Promise<DataOrder> => {
  const previousDate = new Date(new Date().setDate(new Date().getDate() - 1));
  const currDate = new Date();

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
  const previousDate = new Date(new Date().setDate(new Date().getDate() - 7));
  const fourteenDate = new Date(new Date().setDate(new Date().getDate() - 14));
  const currDate = new Date();

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
  const previousMonth = new Date(
    new Date().setMonth(new Date().getMonth() - 1)
  );
  const currDate = new Date();

  const previousOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
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

export interface ReportOrderDetail {
  omzet: number;
  cogs: number;
  netProfit: number;
  order: number;
  orderItem: number;
}

export interface ReportOrder {
  name: string;
  current: ReportOrderDetail;
  previous: ReportOrderDetail;
  gap: ReportOrderDetail;
}

export interface Overview {
  master: {
    product: number;
  };
  order: ReportOrder[];
  analyticOrder: {
    bestSeller: Product;
    worstSeller: Product;
  };
  chart: {
    chartAnnualy: ChartData[];
    chartMonthly: ChartData[];
    chartWeekly: ChartData[];
    topProduct: Product[]; //top 5
  };

  financeByTransaction: {
    totalIncome: number;
    totalExpense: number;
    total: number;
  };
  financeByOrder: {
    totalIncome: number;
    totalExpense: number;
    total: number;
  };
}

export interface ChartData {
  date: string;
  omzet: number;
  cogs: number;
  netProfit: number;
  cash: number;
  transfer: number;
  qris: number;
  expense: number;
}

const getChartData = async (
  orders: DetailOrder[],
  outcomes: Outcome[]
): Promise<ChartData[]> => {
  const data: ChartData[] = [];
  for (const order of orders) {
    const formattedDate = formatDate(order.createdAt, true);
    const existingData = data.find((d) => d.date === formattedDate);
    if (existingData) {
      existingData.omzet += order.total;
      existingData.cogs += order.orderItems.reduce(
        (acc, item) => acc + item.product.cogs,
        0
      );
      existingData.netProfit +=
        order.total -
        order.orderItems.reduce((acc, item) => acc + item.product.cogs, 0);
      existingData.cash += order.method === "Cash" ? order.total : 0;
      existingData.transfer += order.method === "Transfer" ? order.total : 0;
      existingData.qris += order.method === "QRIS" ? order.total : 0;
      existingData.expense += 0;
    } else {
      data.push({
        date: formattedDate,
        omzet: order.total,
        cogs: order.orderItems.reduce(
          (acc, item) => acc + item.product.cogs,
          0
        ),
        netProfit:
          order.total -
          order.orderItems.reduce((acc, item) => acc + item.product.cogs, 0),
        cash: order.method === "Cash" ? order.total : 0,
        transfer: order.method === "Transfer" ? order.total : 0,
        qris: order.method === "QRIS" ? order.total : 0,
        expense: 0,
      });
    }
  }

  for (const outcome of outcomes) {
    const formattedDate = formatDate(outcome.createdAt, true);
    const existingData = data.find((d) => d.date === formattedDate);
    if (existingData) {
      existingData.expense += outcome.amount;
    } else {
      data.push({
        date: formattedDate,
        omzet: 0,
        cogs: 0,
        netProfit: 0,
        cash: 0,
        transfer: 0,
        qris: 0,
        expense: outcome.amount,
      });
    }
  }
  return data;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const businessId = (req.query.businessId as string) || "";
  const isAll = req.query.businessId === "-";
  console.log("businessId", businessId, isAll);
  const totalProduct = await db.product.count({
    where: {
      AND: [
        {
          isDeleted: false,
        },
        { businessId: isAll ? undefined : businessId },
      ],
    },
  });
  const bestProduct = await db.product.findMany({
    where: {
      AND: [
        {
          isDeleted: false,
        },
        { businessId: isAll ? undefined : businessId },
      ],
    },
    orderBy: {
      orderItems: {
        _count: "desc",
      },
    },
    select: {
      id: true,
      image: true,
      name: true,
      price: true,
      _count: {
        select: {
          orderItems: true,
        },
      },
    },
    take: 5,
  });

  const idProducts = bestProduct.map((p) => p.id);

  const orderItems = await db.orderItem.findMany({
    where: {
      AND: [
        {
          product: {
            id: {
              in: idProducts,
            },
          },
        },
        {
          isDeleted: false,
        },
        {
          order: isAll
            ? undefined
            : {
                businessId,
              },
        },
      ],
    },
  });

  for (const product of bestProduct) {
    product._count.orderItems = orderItems
      .filter((oi) => oi.productId === product.id)
      .reduce((acc, cur) => acc + cur.amount, 0);
  }

  const worstProduct = await db.product.findFirst({
    where: {
      AND: [
        {
          isDeleted: false,
        },
        { businessId: isAll ? undefined : businessId },
      ],
    },
    orderBy: {
      orderItems: {
        _count: "asc",
      },
    },
    select: {
      id: true,
      image: true,
      name: true,
      price: true,
      _count: {
        select: {
          orderItems: true,
        },
      },
    },
  });

  const orders = await db.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      orderItems: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          product: {
            select: {
              price: true,
            }
          }
        },
      },
    },
    where: {
      AND: [
        { businessId: isAll ? undefined : businessId },
        {
          isDeleted: false,
        },
      ],
    },
  });

  const dailyData = await getDataOrderDaily(orders as DetailOrder[]);
  const monthlyData = await getDataOrderMonthly(orders as DetailOrder[]);
  const weeklyData = await getDataOrderWeekly(orders as DetailOrder[]);

  const transactions = await db.transaction.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      AND: [
        { businessId: isAll ? undefined : businessId },
        {
          isDeleted: false,
        },
      ],
    },
  });

  let totalIncomeByTrans = 0;
  let totalExpenseByTrans = 0;

  for (const t of transactions) {
    if (t.type === "Expense") {
      totalExpenseByTrans += t.amount;
    } else {
      totalIncomeByTrans += t.amount;
    }
  }

  const outcomes = await db.outcome.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      AND: [
        { businessId: isAll ? undefined : businessId },
        {
          isDeleted: false,
        },
      ],
    },
  });

  const totalByTrans = totalIncomeByTrans - totalExpenseByTrans;

  let totalIncomeByOrder = 0;
  let totalExpenseByOrder = 0;

  for (const order of orders) {
    for (const orderItem of order.orderItems) {
      totalIncomeByOrder += orderItem.product.price;
    }
  }

  for (const outcome of outcomes) {
    totalExpenseByOrder += outcome.price;
  }

  const totalByOrder = totalIncomeByOrder - totalExpenseByOrder;

  const chartData = await getChartData(orders as DetailOrder[], outcomes);

  const year = new Date().getFullYear().toString();
  const sevenDaysAgo = new Date().getDate() - 7;

  const monthName = formatDate(new Date(), true).slice(3);

  const annualChart = chartData.filter((d) => d.date.includes(year));
  const monthlyChart = chartData.filter((d) => d.date.includes(monthName));
  const weeklyChart = chartData.filter(
    (d) => Number(d.date.slice(-2)) <= sevenDaysAgo
  );

  const data: Overview = {
    master: {
      product: totalProduct,
    },
    order: [
      { ...dailyData, name: "Daily" },
      { ...monthlyData, name: "Monthly" },
      { ...weeklyData, name: "Weekly" },
    ],
    analyticOrder: {
      bestSeller: bestProduct[0] as DetailProduct,
      worstSeller: worstProduct! as DetailProduct,
    },
    financeByTransaction: {
      totalIncome: totalIncomeByTrans,
      totalExpense: totalExpenseByTrans,
      total: totalByTrans,
    },
    financeByOrder: {
      totalIncome: totalIncomeByOrder,
      totalExpense: totalExpenseByOrder,
      total: totalByOrder,
    },
    chart: {
      chartMonthly: monthlyChart,
      chartAnnualy: annualChart,
      chartWeekly: weeklyChart,
      topProduct: bestProduct as DetailProduct[],
    },
  };

  return res.status(200).json({ message: "OK", data });
};

export default handler;
