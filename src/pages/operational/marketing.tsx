import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { api } from "@/config/api";
import formatDate from "@/helper/formatDate";
import { AuthPage } from "@/middleware/auth-page";
import { Api } from "@/models/response";
import { useEffect, useState } from "react";
import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { MdCreate, MdPayment } from "react-icons/md";
import { Label } from "@/components/ui/label";
import { makeToast } from "@/helper/makeToast";
import { Transaction } from "@prisma/client";
import formatRupiah from "@/helper/formatRupiah";
import { ReportOperational } from "@/components/material/report/operational";
import { DetailOrderByDate } from "@/models/schema";

const THEAD = ["No", "Marketing", "Note", "Amount", "Created At", ""];

const MarketingPage = () => {
  const {
    data,
    Loading,
    form,
    onChange,
    open,
    setOpen,
    onClickDetail,
    onClose,
    mutate,
    confirmDelete,
    marketings,
    fetchData,
  } = useMarketing();

  const {
    calculate,
    isPayout,
    selectedDate,
    amount,
    setSelectedDate,
    setIsPayout,
    handlePayout,
    setAmount,
    setType,
    type,
    data: ordersByDate,
  } = usePayout(fetchData);

  const omzet =
    ordersByDate.reduce(
      (acc, item) =>
        acc + item.orders.reduce((acc, order) => acc + order.total, 0),
      0
    ) || 0;

  const totalOrder =
    ordersByDate.reduce((acc, item) => acc + item.orders.length, 0) || 0;

  const totalOrderItem =
    ordersByDate.reduce(
      (acc, item) =>
        acc +
        item.orders.reduce(
          (acc, order) =>
            acc +
            order.orderItems.reduce(
              (acc, orderItem) => acc + orderItem.amount,
              0
            ),
          0
        ),
      0
    ) || 0;

  const adsByOrder = Number(omzet) / Number(totalOrder) || 0;
  const adsByOrderItem = Number(omzet) / Number(totalOrderItem) || 0;

  return (
    <DashboardLayout
      title="Marketing"
      belowHeader={<ReportOperational />}
      childrenHeader={
        <div className="flex flex-row gap-4">
          <Dialog.Root
            size="sm"
            placement="center"
            motionPreset="slide-in-bottom"
            lazyMount
            open={isPayout}
            onOpenChange={(e) => setIsPayout(e.open)}
            onExitComplete={() => setSelectedDate("")}
          >
            <Dialog.Trigger asChild>
              <Button className="bg-slate-500 px-2 text-white">
                <MdPayment /> Payout From App
              </Button>
            </Dialog.Trigger>
            <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content>
                  <Dialog.Header>
                    <Dialog.Title className="font-semibold">
                      Payout From App
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
                        handlePayout();
                      }}
                    >
                      <Label className="mt-2 font-medium">Payout Amount</Label>
                      <input
                        value={amount}
                        onChange={(e) => setAmount(e.target.valueAsNumber)}
                        placeholder="200"
                        type="number"
                        className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                      />
                      <Label className="mt-2 font-medium">Date</Label>
                      <input
                        value={
                          selectedDate ||
                          new Date()?.toISOString()?.split?.("T")?.[0]
                        }
                        onChange={(e) => setSelectedDate(e.target.value)}
                        placeholder="200"
                        type="date"
                        className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                      />
                      <Label className="mt-2 font-medium">Marketing Type</Label>
                      <select
                        className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                      >
                        <option value="">Select Marketing Type</option>
                        {["Food Ads", "Food Campaign"].map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                      <div className="flex flex-row w-full gap-4">
                        <div className="flex flex-col gap-2">
                          <Label className="mt-2 font-medium">
                            Total Order (Rp)
                          </Label>
                          <input
                            value={calculate()?.total}
                            onChange={() => {}}
                            placeholder="0"
                            type="number"
                            disabled
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label className="mt-2 font-medium">
                            Marketing Fee
                          </Label>
                          <input
                            value={calculate()?.marketingFee}
                            onChange={() => {}}
                            placeholder="0"
                            type="number"
                            disabled
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                          />
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        *Total Order and Marketing Fee will be calculated
                        automatically
                      </span>
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
                <MdCreate /> Create New
              </Button>
            </Dialog.Trigger>
            <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content>
                  <Dialog.Header>
                    <Dialog.Title className="font-semibold">
                      {form.id === "-"
                        ? "Create New Marketing"
                        : "Edit Marketing"}
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
                        mutate();
                      }}
                    >
                      <Label className="mt-2 font-medium">Marketing</Label>
                      <select
                        className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                        value={form.description}
                        onChange={(e) => onChange(e, "description")}
                      >
                        <option value="">Select Marketing</option>
                        {marketings.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>

                      <Label className="mt-2 font-medium">Amount</Label>
                      <input
                        value={form.amount}
                        onChange={(e) => onChange(e, "amount")}
                        placeholder="200"
                        type="number"
                        className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                      />
                      <Label className="mt-2 font-medium">Date</Label>
                      <input
                        value={
                          form.date ||
                          new Date()?.toISOString()?.split?.("T")?.[0]
                        }
                        onChange={(e) => onChange(e, "date")}
                        placeholder="200"
                        type="date"
                        className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                      />
                      <Label className="mt-2 font-medium">Note</Label>
                      <textarea
                        value={form.note}
                        onChange={(e) => onChange(e, "note")}
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
        </div>
      }
    >
      <div className="flex flex-col text-sm mb-2">
        <div className="flex flex-row">
          <p>Ads Per Order: </p>
          <p>{formatRupiah(adsByOrder)}</p>
        </div>
        <div className="flex flex-row">
          <p>Ads Per Item: </p>
          <p>{formatRupiah(adsByOrderItem)}</p>
        </div>
      </div>
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              {THEAD.map((item, index) => (
                <th key={index} scope="col" className="px-6 py-3">
                  {item}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr className="bg-white border-b  border-gray-200" key={index}>
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                >
                  {index + 1}
                </th>
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                >
                  {item.description}
                </th>

                <td className="px-6 py-4">{item.note || "-"}</td>
                <td className="px-6 py-4">{formatRupiah(item.amount)}</td>
                <td className="px-6 py-4">
                  {formatDate(item.createdAt, true, true)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-row gap-2 font-medium">
                    <Button
                      className="bg-teal-500 text-white px-2"
                      onClick={() => onClickDetail(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      className="bg-red-500 text-white px-2"
                      onClick={() => confirmDelete(item)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Loading />
    </DashboardLayout>
  );
};

export default AuthPage(MarketingPage, ["CASHIER", "OWNER"]);

interface OutcomeDTO {
  id: string;
  description: string;
  amount: number;
  note: string;
  date: string;
}

const initOutcomeDTO: OutcomeDTO = {
  id: "-",
  description: "",
  amount: 0,
  note: "",
  date: new Date()?.toISOString()?.split?.("T")?.[0],
};

const useMarketing = () => {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const marketings = [
    "Food Ads",
    "Food Campaign",
    "Tiktok Ads",
    "Meta Ads",
    "Endorsement",
  ];
  const [form, setForm] = useState<OutcomeDTO>(initOutcomeDTO);
  const [open, setOpen] = useState(false);

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    key: keyof OutcomeDTO
  ) => {
    setForm({ ...form, [key]: e.target.value });
  };

  const fetchData = async () => {
    setLoading(true);
    const response = await api.get<Api<Transaction[]>>(
      "/operational/marketing"
    );
    setData(response.data.data);
    setLoading(false);
  };

  const onClickDetail = (item: Transaction) => {
    setOpen(true);
    setForm({
      amount: item.amount,
      description: item.description || "",
      id: item.id,
      note: item.note || "",
      date: item.createdAt.toString(),
    });
  };

  const onClose = () => {
    setForm(initOutcomeDTO);
    setOpen(false);
  };

  const fetching = async () => {
    await Promise.all([fetchData()]);
  };

  useEffect(() => {
    fetching();
  }, []);

  const mutate = async () => {
    try {
      if (loading) return;
      setLoading(true);
      makeToast("info");
      if (form.id === "-") {
        await create();
      } else {
        await edit();
      }
    } catch (error) {
      makeToast("error", error);
    } finally {
      setForm(initOutcomeDTO);
      setLoading(false);
      setOpen(false);
    }
  };

  const create = async () => {
    try {
      const res = await api.post("/operational/marketing", form);
      await fetching();
      makeToast("success", res?.data?.message);
    } catch (error) {
      throw error;
    }
  };

  const edit = async () => {
    try {
      const res = await api.put(`/operational/marketing/${form.id}`, form);
      await fetching();
      makeToast("success", res?.data?.message);
    } catch (error) {
      throw error;
    }
  };

  const Loading = () => {
    if (!loading) {
      return null;
    }
    return (
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 bottom-10 right-10 fixed z-50 pointer-events-none"></div>
    );
  };

  const confirmDelete = async (item: Transaction) => {
    try {
      const isConfirm = confirm("Are you sure you want to delete this data?");
      if (!isConfirm || loading) return;
      setLoading(true);
      const res = await api.delete(`/operational/marketing/${item.id}`);
      await fetchData();
      makeToast("success", res?.data?.message);
      setLoading(false);
    } catch (error) {
      makeToast("error", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    Loading,
    onChange,
    form,
    open,
    setOpen,
    onClickDetail,
    onClose,
    mutate,
    confirmDelete,
    marketings,
    fetchData,
  };
};

const usePayout = (refetch: () => Promise<void>) => {
  const [data, setData] = useState<DetailOrderByDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isPayout, setIsPayout] = useState(false);
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<string>("Food Campaign");
  const [pending, setPending] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get<Api<DetailOrderByDate[]>>(
        "/product/order"
      );
      setData(response.data.data);
    } catch (error) {
      makeToast("error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculate = () => {
    const filteredOrderByDate = data.filter(
      (item) => item.date === formatDate(selectedDate, true)
    );
    const total =
      filteredOrderByDate?.[0]?.orders?.reduce(
        (acc, item) => acc + item.total,
        0
      ) || 0;

    const marketingFee = Number(total || 0) - Number(amount || 0) || 0;
    return {
      total,
      marketingFee,
    };
  };

  const handlePayout = async () => {
    try {
      if (pending) return;
      setPending(true);
      makeToast("info");
      const res = await api.post("/operational/marketing", {
        description: type,
        amount: Number(calculate().marketingFee),
        date: selectedDate,
      });
      await refetch();
      setAmount(0);
      setIsPayout(false);
      makeToast("success", res.data.message);
    } catch (error) {
      makeToast("error", error);
    } finally {
      setPending(false);
    }
  };

  return {
    data,
    loading,
    selectedDate,
    setSelectedDate,
    calculate,
    isPayout,
    setIsPayout,
    handlePayout,
    amount,
    setAmount,
    type,
    setType,
  };
};
