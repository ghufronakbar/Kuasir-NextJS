import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PLACEHOLDER } from "@/constants/image";
import formatRupiah from "@/helper/formatRupiah";
import { cn } from "@/utils/cn";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ChartData, Overview, ReportOrder } from "./api/overview";
import { api } from "@/config/api";
import { Api } from "@/models/response";
import { DetailProduct } from "@/models/schema";
import { FaChartLine } from "react-icons/fa";
import { MdBusiness, MdCalculate, MdSync } from "react-icons/md";
import { LoadingPage } from "@/components/material/loading-page";
import { useBusiness } from "@/hooks/useBusiness";

const OverviewPage = () => {
  const { data: business, onChange, selectedBusiness, Loading } = useBusiness();
  const { data } = useOverview(selectedBusiness);
  const {
    calc,
    fetching,
    form,
    onChange: onChangePS,
    open,
    setOpen,
    onClose,
    handleSubmit,
    information,
    loading,
  } = useProfitSharing();
  return (
    <DashboardLayout
      title="Overview"
      belowHeader={
        <select
          className="text-md text-neutral-700 font-semibold px-2 py-1 w-fit border border-gray-300 self-end rounded-md"
          onChange={onChange}
          value={selectedBusiness}
        >
          {business.map((item, index) => (
            <option key={index} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      }
      childrenHeader={
        <Dialog.Root
          size="lg"
          placement="center"
          motionPreset="slide-in-bottom"
          lazyMount
          open={open}
          onOpenChange={(e) => setOpen(e.open)}
          onExitComplete={onClose}
        >
          <Dialog.Trigger asChild>
            <Button className="bg-teal-500 px-2 text-white">
              <MdCalculate /> Open Calculator
            </Button>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title className="font-semibold">
                    Profit Sharing
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
                      handleSubmit();
                    }}
                  >
                    <Label className="mt-2 font-medium">Percentage (%)</Label>
                    <input
                      value={form.percentage}
                      onChange={(e) => onChangePS(e, "percentage")}
                      placeholder="30"
                      type="number"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                    />
                    <Label className="mt-2 font-medium">Person</Label>
                    <input
                      value={form.person}
                      onChange={(e) => onChangePS(e, "person")}
                      placeholder="3"
                      type="number"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                    />

                    <div className="mt-2">
                      <p>Maximal Disbursable Balance</p>
                      <p>{formatRupiah(information?.disbursableBalance)}</p>
                    </div>

                    <div className="w-full justify-around items-center flex flex-row flex-wrap gap-2 mt-4 border border-neutral-300 rounded-md py-4">
                      <div className="flex flex-col items-center w-[40%] justify-center mb-8">
                        <p className="">Total</p>
                        <p className="text-3xl">
                          {fetching ? (
                            <MdSync className="animate-spin cursor-wait" />
                          ) : (
                            formatRupiah(calc.total)
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col items-center w-[40%] justify-center mb-8">
                        <p className="">Remaining</p>
                        <p className="text-3xl">
                          {fetching ? (
                            <MdSync className="animate-spin cursor-wait" />
                          ) : (
                            formatRupiah(calc.remaining)
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col items-center w-[40%]">
                        <p className="">Percentage Per Person</p>
                        <p className="text-3xl">
                          {fetching ? (
                            <MdSync className="animate-spin cursor-wait" />
                          ) : (
                            calc.percentagePerPerson + "%"
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col items-center w-[40%]">
                        <p className="">Total Per Person</p>
                        <p className="text-3xl">
                          {fetching ? (
                            <MdSync className="animate-spin cursor-wait" />
                          ) : (
                            formatRupiah(calc.totalPerPerson)
                          )}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="bg-teal-500 font-semibold text-white mt-4"
                    >
                      {loading || fetching ? (
                        <MdSync className="animate-spin cursor-wait" />
                      ) : (
                        "Create Dividend"
                      )}
                    </Button>
                  </form>
                </Dialog.Body>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      }
    >
      {data ? (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <GridProduct items={data.chart.topProduct as DetailProduct[]} />
          <GridMaster title={"Total Product"} count={data.master.product} />
          <GridItemOrder items={data?.order} />
          <GridFinance
            title="Finance by Order"
            total={data.financeByOrder.total}
            expense={data.financeByOrder.totalExpense}
            income={data.financeByOrder.totalIncome}
          />

          <GridFinance
            title="Finance by Transaction"
            total={data.financeByTransaction.total}
            expense={data.financeByTransaction.totalExpense}
            income={data.financeByTransaction.totalIncome}
          />
          <GridChart items={data.chart.chartAnnualy} />
        </div>
      ) : (
        <LoadingPage />
      )}
      <Loading />
    </DashboardLayout>
  );
};

const useOverview = (businessId: string) => {
  const [data, setData] = useState<Overview>();

  const fetchData = async () => {
    const res = await api.get<Api<Overview>>("/overview", {
      params: { businessId },
    });
    setData(res.data.data);
  };

  useEffect(() => {
    if (businessId) {
      fetchData();
    }
  }, [businessId]);

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
  return (
    <div className="w-full h-60 bg-white rounded-lg border border-gray-300 flex flex-col px-4 py-2 gap-2">
      <div className="flex flex-row items-center justify-between">
        <h2 className="text-md text-neutral-700">Order Report</h2>
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
          <span
            className={cn(
              "text-base",
              isPositiveOmzet ? "text-green-500" : "text-red-500"
            )}
          >
            {isPositiveOmzet ? "+" : ""}
            {gap.omzet.toFixed(1)}%
          </span>
        </p>
      </div>
      <div>
        <p className="text-sm text-neutral-600 font-normal">Net Profit</p>
        <p className="text-xl text-neutral-800 font-semibold">
          {formatRupiah(current?.netProfit)}{" "}
          <span
            className={cn(
              "text-sm",
              isPositiveProfit ? "text-green-500" : "text-red-500"
            )}
          >
            {isPositiveProfit ? "+" : ""}
            {gap?.netProfit?.toFixed(1)}%
          </span>
        </p>
      </div>
      <div>
        <p className="text-sm text-neutral-600 font-normal">Order</p>
        <p className="text-xl text-neutral-800 font-semibold">
          {current?.order}{" "}
          <span className="text-neutral-600 text-sm">
            ({current?.orderItem} products)
          </span>{" "}
          <span
            className={cn(
              "text-sm",
              isPositiveOrder ? "text-green-500" : "text-red-500"
            )}
          >
            {isPositiveOrder ? "+" : ""}
            {gap.order.toFixed(1)}%
          </span>
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
    <div className="w-full bg-white rounded-lg border border-gray-300 flex flex-col px-4 py-2 gap-2 row-span-2 overflow-hidden">
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

interface FinanceProps {
  total: number;
  income: number;
  expense: number;
  title: string;
}

const GridFinance: React.FC<FinanceProps> = ({
  expense,
  income,
  total,
  title,
}) => {
  return (
    <div className="w-full h-60 bg-white rounded-lg border border-gray-300 flex flex-col px-4 py-2 gap-2 overflow-hidden">
      <h4 className="text-md text-neutral-700">{title}</h4>
      <div>
        <p className="text-sm text-neutral-600 font-normal">Total</p>
        <p className="text-3xl text-neutral-800 font-semibold">
          {formatRupiah(total)}{" "}
        </p>
      </div>
      <div>
        <p className="text-sm text-neutral-600 font-normal">Income</p>
        <p className="text-xl font-semibold text-green-500">
          + {formatRupiah(income)}{" "}
        </p>
      </div>
      <div>
        <p className="text-sm text-neutral-600 font-normal">Expense</p>
        <p className="text-xl text-red-500 font-semibold">
          - {formatRupiah(expense)}
        </p>
      </div>
    </div>
  );
};

interface MasterProps {
  title: string;
  count: number;
}

const GridMaster: React.FC<MasterProps> = ({ title, count }) => {
  return (
    <div className="w-full h-60 bg-white rounded-lg border border-gray-300 flex flex-col px-4 py-2 gap-2 overflow-hidden">
      <h4 className="text-md text-neutral-700">{title}</h4>
      <p className="text-7xl text-neutral-800 font-semibold">{count}</p>
      <MdBusiness className="text-3xl text-neutral-800" />
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
import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { Label } from "@/components/ui/label";
import { CalculateProfit } from "./api/profit-sharing";
import useDebounce from "@/hooks/useDebounce";
import { makeToast } from "@/helper/makeToast";
import { Information } from "@prisma/client";
import { sync } from "@/services/server/sync";
import { useRouter } from "next/router";

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

interface ProfitSharingDTO {
  percentage: number;
  person: number;
}

const initProfitSharing: ProfitSharingDTO = { percentage: 0, person: 0 };
const initCalc: CalculateProfit = {
  percentage: 0,
  person: 0,
  percentagePerPerson: 0,
  totalPerPerson: 0,
  remaining: 0,
  total: 0,
};

const useProfitSharing = () => {
  const [form, setForm] = useState<ProfitSharingDTO>(initProfitSharing);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [calc, setCalc] = useState<CalculateProfit>(initCalc);
  const [open, setOpen] = useState(false);
  const [information, setInformation] = useState<Information | null>(null);
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof ProfitSharingDTO
  ) => {
    setForm({ ...form, [key]: e.target.value });
    setFetching(true);
  };

  const fetchInformation = async () => {
    try {
      const res = await api.get<Api<Information>>("/information");
      setInformation(res.data.data);
    } catch (error) {
      makeToast("error", error);
    }
  };

  useEffect(() => {
    if (information === null) {
      fetchInformation();
    }
  }, [information]);

  const fetchData = async () => {
    try {
      const res = await api.get<Api<CalculateProfit>>("/profit-sharing", {
        params: form,
      });
      setCalc(res.data.data);
      setIsError(false);
    } catch (error) {
      makeToast("error", error);
      setIsError(true);
    } finally {
      setFetching(false);
    }
  };

  useDebounce(
    () => {
      if (Number(form.percentage) > 0 && Number(form.person) > 0) {
        fetchData();
      } else {
        setFetching(false);
        setCalc(initCalc);
      }
    },
    500,
    [form]
  );

  const handleSubmit = async () => {
    try {
      if (loading || fetching || isError) return;
      setLoading(true);
      const res = await api.post<Api>("/profit-sharing", form);
      makeToast("success", res.data.message);
      onClose();
      await sync();
      router.reload();
    } catch (error) {
      makeToast("error", error);
    } finally {
      setLoading(false);
    }
  };

  const onClose = () => {
    setForm(initProfitSharing);
    setOpen(false);
  };

  return {
    form,
    handleSubmit,
    calc,
    onChange,
    fetching,
    open,
    setOpen,
    onClose,
    information,
    loading,
  };
};

export default OverviewPage;
