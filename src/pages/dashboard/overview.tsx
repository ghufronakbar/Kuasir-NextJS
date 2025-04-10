import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PLACEHOLDER } from "@/constants/image";
import formatRupiah from "@/helper/formatRupiah";
import { cn } from "@/utils/cn";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BestProduct, ChartData, Overview, ReportOrder } from "../api/overview";
import { api } from "@/config/api";
import { Api } from "@/models/response";
import { FaChartLine } from "react-icons/fa";
import { LoadingPage } from "@/components/material/loading-page";
import { Wallet } from "../api/wallet";
import { $Enums } from "@prisma/client";
import { makeToast } from "@/helper/makeToast";
import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { MdTransferWithinAStation } from "react-icons/md";
import { Label } from "@/components/ui/label";

const OverviewPage = () => {
  const { data } = useOverview();
  const { data: wallet, fetchData } = useWallet();
  const { form, onChange, onClose, onSubmit, open, setOpen, WALLETS } =
    useTransfer(wallet?.report, fetchData);

  return (
    <DashboardLayout
      title="Overview"
      childrenHeader={
        <Dialog.Root
          size="sm"
          placement="center"
          motionPreset="slide-in-bottom"
          lazyMount
          open={open}
          onOpenChange={(e) => setOpen(e.open)}
          onExitComplete={onClose}
        >
          <Dialog.Trigger asChild>
            <Button className="bg-teal-500 px-2 text-white">
              <MdTransferWithinAStation /> Transfer
            </Button>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title className="font-semibold">
                    Transfer to wallet
                  </Dialog.Title>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Dialog.Header>
                <Dialog.Body>
                  <form
                    className="flex flex-col gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      onSubmit();
                    }}
                  >
                    <Label className="mt-2 font-medium">From</Label>
                    <select
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                      value={form.from}
                      onChange={(e) => onChange(e, "from")}
                    >
                      <option value="">Select wallet</option>
                      {WALLETS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <Label className="mt-2 font-medium">To</Label>
                    <select
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                      value={form.to}
                      onChange={(e) => onChange(e, "to")}
                    >
                      <option value="">Select receipient</option>
                      {WALLETS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>

                    <Label className="mt-2 font-medium">Amount</Label>
                    <input
                      value={form.amount}
                      onChange={(e) => onChange(e, "amount")}
                      placeholder="170000"
                      type="number"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                    />

                    <Label className="mt-2 font-medium">Note</Label>
                    <textarea
                      value={form.note}
                      onChange={(e) => onChange(e, "note")}
                      placeholder="200"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                    />

                    <Button
                      type="submit"
                      className="bg-teal-500 font-semibold text-white mt-4"
                    >
                      Save
                    </Button>
                  </form>
                </Dialog.Body>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      }
    >
      {data && wallet ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          <GridFinance
            title="Total Balance"
            balance={wallet?.report?.order?.total}
            className="w-full h-full col-span-1 lg:col-span-2 xl:col-span-2"
          />
          <GridItemOrder items={data?.order} />
          <GridFinance
            title="Product Balance"
            balance={wallet?.report?.order?.total}
            className="w-full h-full col-span-1"
          />
          <GridFinance
            title="Operational Balance"
            balance={wallet?.report?.operational?.total}
            className="w-full h-full col-span-1"
          />
          <GridFinance
            title="Capital Balance"
            balance={wallet?.report?.capital?.total}
            className="w-full h-full col-span-1"
          />
          <GridFinance
            title="Finance Balance"
            balance={wallet?.report?.finance?.total}
            className="w-full h-full col-span-1"
          />
          <GridChart items={data.chart.chartAnnualy} />
          <GridProduct items={data.chart.topProduct} />
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
    <div className="w-full h-full bg-white rounded-lg border border-gray-300 flex flex-col px-4 py-2 gap-2 col-span-1 lg:col-span-2 xl:col-span-2">
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
  items: BestProduct[];
}
const GridProduct: React.FC<ProductProps> = ({ items }) => {
  return (
    <div className="w-full bg-white rounded-lg border border-gray-300 flex flex-col px-4 py-2 gap-2 overflow-hidden overflow-x-auto h-full col-span-1">
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
              <div className="flex flex-col">
                <p className="text-sm text-neutral-600 font-normal">
                  {item.name}
                </p>
                <p className="text-xs text-neutral-600 font-semibold">
                  {item.merchant}
                </p>
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-neutral-800 text-right">
                {formatRupiah(item.price)}
              </p>
              <p className="text-sm text-neutral-700 font-semibold text-right">
                Total Sold: {item.sold}
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
    <div className="w-full bg-white rounded-lg border border-gray-300 flex flex-col px-4 py-2 gap-2 overflow-hidden col-span-1 lg:col-span-2 xl:col-span-3">
      <h4 className="text-md text-neutral-700 flex items-center font-semibold">
        <FaChartLine className="mr-2" />
        Sales Chart Report
      </h4>
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={items}
            margin={{ top: 10, right: 20, left: 0, bottom: 30 }}
          >
            <defs>
              <linearGradient id="omzetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient
                id="netProfitGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

            <XAxis
              dataKey="date"
              angle={-35}
              textAnchor="end"
              interval={0}
              height={60}
              tick={{ fontSize: 12 }}
              label={{
                value: "Date",
                position: "insideBottom",
                offset: -20,
                fontSize: 12,
              }}
            />

            <YAxis
              tickFormatter={formatNumber}
              width={80}
              tick={{ fontSize: 12 }}
              label={{
                value: "Jumlah (Rp)",
                angle: -90,
                position: "insideLeft",
                fontSize: 12,
              }}
            />

            <Tooltip
              formatter={(value: number, name: string) => [
                `Rp ${formatRupiah(value)}`,
                name,
              ]}
            />

            <Legend iconType="circle" verticalAlign="top" height={36} />

            <Area
              type="monotone"
              dataKey="omzet"
              name="Omzet"
              stroke="#4f46e5"
              fill="url(#omzetGradient)"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="netProfit"
              name="Net Profit"
              stroke="#f59e0b"
              fill="url(#netProfitGradient)"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="expense"
              name="Expense"
              stroke="#ef4444"
              fill="url(#expenseGradient)"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default OverviewPage;

const useWallet = () => {
  const [data, setData] = useState<Wallet>();

  const fetchData = async () => {
    const res = await api.get<Api<Wallet>>("/wallet");
    setData(res.data.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, fetchData };
};

interface FinanceProps {
  balance: number;
  title: string;
  className?: string;
}

const GridFinance: React.FC<FinanceProps> = ({ balance, title, className }) => {
  return (
    <div
      className={cn(
        "w-fit h-60 bg-white rounded-lg border border-gray-300 flex flex-col px-4 py-2 gap-2 overflow-hidden",
        className
      )}
    >
      <h4 className="text-md text-neutral-700">{title}</h4>
      <div>
        <p className="text-sm text-neutral-600 font-normal">Balance</p>
        <p
          className={cn(
            "text-3xl font-semibold",
            balance >= 0 ? "text-neutral-800" : "text-red-500"
          )}
        >
          {formatRupiah(balance)}{" "}
        </p>
      </div>
    </div>
  );
};

interface Transfer {
  amount: number;
  from: $Enums.TransactionCategoryType;
  to: $Enums.TransactionCategoryType;
  note: string;
}

const initTransfer: Transfer = {
  amount: 0,
  from: $Enums.TransactionCategoryType.Product,
  to: $Enums.TransactionCategoryType.Finance,
  note: "",
};

const useTransfer = (
  wallet?: Wallet["report"],
  refetch?: () => Promise<void>
) => {
  const [form, setForm] = useState<Transfer>(initTransfer);
  const [open, setOpen] = useState<boolean>(false);

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    key: keyof Transfer
  ) => {
    setForm({ ...form, [key]: e.target.value });
  };

  const onClose = () => {
    setForm(initTransfer);
    setOpen(false);
  };

  const onSubmit = async () => {
    try {
      makeToast("info");
      const res = await api.post<Api>("/transfer", form);
      await refetch?.();
      onClose();
      makeToast("success", res?.data?.message);
    } catch (error) {
      makeToast("error", error);
    }
  };

  const WALLETS = Object.values($Enums.TransactionCategoryType).map((item) => {
    let total = 0;

    switch (item) {
      case "Product":
        total = wallet?.order.total || 0;
        break;
      case "Operational":
        total = wallet?.operational.total || 0;
        break;
      case "Capital":
        total = wallet?.capital.total || 0;
        break;
      case "Finance":
        total = wallet?.finance.total || 0;
        break;
    }
    return {
      value: item,
      label: `${item} (${formatRupiah(total)})`,
    };
  });

  return { form, open, setOpen, onChange, onClose, onSubmit, WALLETS };
};
