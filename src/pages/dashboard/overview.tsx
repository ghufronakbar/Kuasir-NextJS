import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PLACEHOLDER } from "@/constants/image";
import formatRupiah from "@/helper/formatRupiah";
import { cn } from "@/utils/cn";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ChartData, Overview, ReportOrder } from "../api/overview";
import { api } from "@/config/api";
import { Api } from "@/models/response";
import { DetailProduct } from "@/models/schema";
import { FaChartLine } from "react-icons/fa";
import { LoadingPage } from "@/components/material/loading-page";

const OverviewPage = () => {
  const { data } = useOverview();

  return (
    <DashboardLayout title="Overview">
      {data ? (
        <div className="w-full flex flex-row flex-wrap gap-4 justify-between">
          <GridProduct items={data.chart.topProduct as DetailProduct[]} />
          <GridItemOrder items={data?.order} />
          <GridChart items={data.chart.chartAnnualy} />
        </div>
      ) : (
        <LoadingPage />
      )}
    </DashboardLayout>
  );
};

const useOverview = () => {
  const [data, setData] = useState<Overview>();

  const fetchData = async () => {
    const res = await api.get<Api<Overview>>("/overview");
    setData(res.data.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data };
};

interface PropsOrder {
  items: ReportOrder[];
}

const GridItemOrder: React.FC<PropsOrder> = ({ items }) => {
  const [item, setItem] = useState<ReportOrder>(items[0] || {});
  const { current, gap } = item;
  const isPositiveProfit = gap?.netProfit > 0;
  const isPositiveOmzet = gap?.omzet > 0;
  const isPositiveOrder = gap?.order > 0;
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedItem = items.find((item) => item.name === e.target.value);
    if (selectedItem) setItem(selectedItem);
  };

  const isAll = item?.name === "All";
  return (
    <div className="w-full md:w-[48%] h-60 bg-white rounded-lg border border-gray-300 flex flex-col px-4 py-2 gap-2">
      <div className="flex flex-row items-center justify-between">
        <h2 className="text-md text-neutral-700">Sales</h2>
        <select
          className="text-md text-neutral-700 font-semibold px-2 py-1 w-fit border border-gray-300 self-end rounded-md"
          onChange={onChange}
        >
          {items.map((item, index) => (
            <option key={index}>{item.name}</option>
          ))}
        </select>
      </div>
      <div>
        <p className="text-sm text-neutral-600 font-normal">Omzet</p>
        <p className="text-3xl text-neutral-800 font-semibold">
          {formatRupiah(current?.omzet)}{" "}
          {!isAll && (
            <span
              className={cn(
                "text-base",
                isPositiveOmzet ? "text-green-500" : "text-red-500"
              )}
            >
              {isPositiveOmzet ? "+" : ""}
              {Number(gap?.omzet)?.toFixed(1)}%
            </span>
          )}
        </p>
      </div>
      <div>
        <p className="text-sm text-neutral-600 font-normal">Net Profit</p>
        <p className="text-xl text-neutral-800 font-semibold">
          {formatRupiah(current?.netProfit)}{" "}
          {!isAll && (
            <span
              className={cn(
                "text-sm",
                isPositiveProfit ? "text-green-500" : "text-red-500"
              )}
            >
              {isPositiveProfit ? "+" : ""}
              {Number(gap?.netProfit)?.toFixed(1)}%
            </span>
          )}
        </p>
      </div>
      <div>
        <p className="text-sm text-neutral-600 font-normal">Order</p>
        <p className="text-xl text-neutral-800 font-semibold">
          {current?.order}{" "}
          <span className="text-neutral-600 text-sm">
            ({current?.orderItem} products)
          </span>{" "}
          {!isAll && (
            <span
              className={cn(
                "text-sm",
                isPositiveOrder ? "text-green-500" : "text-red-500"
              )}
            >
              {isPositiveOrder ? "+" : ""}
              {Number(gap?.orderItem)?.toFixed(1)}%
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

interface ProductProps {
  items: DetailProduct[];
}
const GridProduct: React.FC<ProductProps> = ({ items }) => {
  return (
    <div className="w-full md:w-[48%] bg-white rounded-lg border border-gray-300 flex flex-col px-4 py-2 gap-2 overflow-hidden overflow-x-auto h-60">
      <h4 className="text-md text-neutral-700">Best Seller</h4>
      <div className="w-full flex flex-col gap-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="w-full flex flex-row items-center justify-between border-b border-gray-300 py-2"
          >
            <div className="flex flex-row items-center gap-2">
              <Image
                src={item.image || PLACEHOLDER}
                alt={item.name}
                width={60}
                height={60}
                className="w-10 h-10 rounded-lg object-cover min-w-10 min-h-10"
              />
              <p className="text-sm text-neutral-600 font-normal">
                {item.name}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-neutral-800 text-right">
                {formatRupiah(item.price)}
              </p>
              <p className="text-sm text-neutral-700 font-semibold text-right">
                Total Sold: {item._count.orderItems}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
interface ChartProps {
  items: ChartData[];
}

// Format angka menjadi lebih mudah dibaca
const formatNumber = (num: number) => {
  return num.toLocaleString();
};

const GridChart: React.FC<ChartProps> = ({ items }) => {
  return (
    <div className="w-full bg-white rounded-lg border border-gray-300 flex flex-col px-4 py-2 gap-2 overflow-hidden col-span-3">
      <h4 className="text-md text-neutral-700 flex items-center">
        <FaChartLine className="mr-2" />
        Some Chart
      </h4>
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={items}>
            {/* Defining the gradient fills */}
            <defs>
              <linearGradient
                id="omzetGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#8884d8" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#8884d8" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient
                id="cogsGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#82ca9d" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#82ca9d" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient
                id="netProfitGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#ff7300" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#ff7300" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient
                id="expenseGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#f4a261" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#f4a261" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            {/* Grid */}
            <CartesianGrid strokeDasharray="3 3" />

            {/* X-Axis */}
            <XAxis dataKey="date" />

            {/* Y-Axis */}
            <YAxis tickFormatter={formatNumber} />

            {/* Tooltip */}
            <Tooltip formatter={(value: number) => formatNumber(value)} />

            {/* Legend */}
            <Legend iconType="circle" />

            {/* Area for Omzet */}
            <Area
              type="monotone"
              dataKey="omzet"
              stroke="url(#omzetGradient)"
              fill="url(#omzetGradient)"
              activeDot={{ r: 8 }}
            />

            {/* Area for COGS */}
            <Area
              type="monotone"
              dataKey="cogs"
              stroke="url(#cogsGradient)"
              fill="url(#cogsGradient)"
            />

            {/* Area for Net Profit */}
            <Area
              type="monotone"
              dataKey="netProfit"
              stroke="url(#netProfitGradient)"
              fill="url(#netProfitGradient)"
            />

            {/* Area for Expense */}
            <Area
              type="monotone"
              dataKey="expense"
              stroke="url(#expenseGradient)"
              fill="url(#expenseGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OverviewPage;
