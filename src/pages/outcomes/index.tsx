import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { api } from "@/config/api";
import formatDate from "@/helper/formatDate";
import { AuthPage } from "@/middleware/auth-page";
import { Api } from "@/models/response";
import { useEffect, useState } from "react";
import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { MdCreate } from "react-icons/md";
import { Label } from "@/components/ui/label";
import { makeToast } from "@/helper/makeToast";
import { DetailOutcome, DetailStock } from "@/models/schema";
import { $Enums } from "@prisma/client";
import Image from "next/image";
import { PLACEHOLDER } from "@/constants/image";
import formatRupiah from "@/helper/formatRupiah";
import { useBusiness } from "@/hooks/useBusiness";

const THEAD = ["No", "", "Name", "Amount", "Price", "Method", "Created At", ""];

const OutcomesPage = () => {
  const {
    data: business,
    selectedBusiness,
    onChange: onChangeB,
  } = useBusiness();
  const {
    data,
    Loading,
    form,
    onChange,
    categories,
    other,
    setOther,
    open,
    setOpen,
    onClickDetail,
    onClose,
    isOther,
    mutate,
    confirmDelete,
    stocks,
    methods,
  } = useOutcomes(selectedBusiness);
  return (
    <DashboardLayout
      title="Outcomes"
      belowHeader={
        <select
          className="text-md text-neutral-700 font-semibold px-2 py-1 w-fit border border-gray-300 self-end rounded-md"
          onChange={onChangeB}
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
                    {form.id === "-" ? "Create Outcomes" : "Edit Outcomes"}
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
                    <Label className="mt-2 font-medium">Stock Name</Label>
                    <select
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                      value={form.stockId}
                      onChange={(e) => onChange(e, "stockId")}
                    >
                      <option value="" disabled hidden>
                        Select Stock
                      </option>
                      {stocks.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} - {item.unit}
                        </option>
                      ))}
                    </select>
                    <Label className="mt-2 font-medium">Category</Label>
                    <select
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                      value={form.category}
                      onChange={(e) => onChange(e, "category")}
                    >
                      <option value="" disabled hidden>
                        Select Category
                      </option>
                      {categories.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    {isOther && (
                      <>
                        <Label className="mt-2 font-medium">
                          Category Name
                        </Label>
                        <input
                          value={other}
                          onChange={(e) => setOther(e.target.value)}
                          placeholder="Nasi Goreng"
                          type="text"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                        />
                      </>
                    )}
                    <Label className="mt-2 font-medium">Amount</Label>
                    <input
                      value={form.amount}
                      onChange={(e) => onChange(e, "amount")}
                      placeholder="200"
                      type="text"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                    />
                    <Label className="mt-2 font-medium">Price</Label>
                    <input
                      value={form.price}
                      onChange={(e) => onChange(e, "price")}
                      placeholder="200"
                      type="text"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                    />
                    <Label className="mt-2 font-medium">Payment Method</Label>
                    <select
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                      value={form.method}
                      onChange={(e) => onChange(e, "method")}
                    >
                      {methods.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <Label className="mt-2 font-medium">Description</Label>
                    <textarea
                      value={form.description}
                      onChange={(e) => onChange(e, "description")}
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
                <th scope="row" className="px-6 py-4">
                  <Image
                    src={item.stock?.image || PLACEHOLDER}
                    alt=""
                    width={400}
                    height={400}
                    className="min-w-12 min-h-12 w-12 h-12 rounded-lg object-cover"
                  />
                </th>
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                >
                  {item.stock.name}
                </th>
                <td className="px-6 py-4">
                  {item.amount} {item.stock.unit}
                </td>
                <td className="px-6 py-4">{formatRupiah(item.price)}</td>
                <td className="px-6 py-4">{formatDate(item.createdAt)}</td>
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

export default AuthPage(OutcomesPage, ["CASHIER", "OWNER"]);

interface OutcomeDTO {
  id: string;
  amount: number;
  price: number;
  method: string;
  stockId: string;
  category: string;
  description: string;
}

const initOutcomeDTO: OutcomeDTO = {
  id: "-",
  amount: 0,
  price: 0,
  method: "Cash",
  category: "",
  description: "",
  stockId: "",
};

const useOutcomes = (businessId: string) => {
  const [data, setData] = useState<DetailOutcome[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [stocks, setStocks] = useState<DetailStock[]>([]);
  const [form, setForm] = useState<OutcomeDTO>(initOutcomeDTO);
  const [other, setOther] = useState("");
  const [open, setOpen] = useState(false);
  const methods: string[] = Object.values($Enums.PaymentMethod);

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
    const response = await api.get<Api<DetailOutcome[]>>("/outcome", {
      params: { businessId },
    });
    setData(response.data.data);
    const uniqueCategories = Array.from(
      new Set(response.data.data.map((item) => item.category))
    )
      .filter((item) => item !== "")
      .map((item) => item);
    setCategories([...uniqueCategories, "Other"]);
    // setForm({ ...form, category: uniqueCategories?.[0] || "Other" });
    setLoading(false);
  };

  const fetchStocks = async () => {
    const res = await api.get<Api<DetailStock[]>>("/stock");
    setStocks(res.data.data);
    // setForm({ ...form, stockId: res.data.data?.[0]?.id || "-" });
  };

  const onClickDetail = (item: DetailOutcome) => {
    setOpen(true);
    setForm({
      amount: item.amount,
      category: item.category,
      description: item.description || "",
      id: item.id,
      method: item.method,
      price: item.price,
      stockId: item.stockId,
    });
  };

  const onClose = () => {
    setForm(initOutcomeDTO);
    setOpen(false);
  };

  const fetching = async () => {
    await Promise.all([fetchData(), fetchStocks()]);
  };

  useEffect(() => {
    if (businessId) {
      fetching();
    }
  }, [businessId]);

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
      const res = await api.post("/outcome", {
        ...form,
        businessId,
        category: isOther ? other : form.category,
      });
      await fetching();
      makeToast("success", res?.data?.message);
    } catch (error) {
      throw error;
    }
  };

  const edit = async () => {
    try {
      const res = await api.put(`/outcome/${form.id}`, {
        ...form,
        businessId,
        category: isOther ? other : form.category,
      });
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

  const confirmDelete = async (item: DetailOutcome) => {
    try {
      const isConfirm = confirm("Are you sure you want to delete this data?");
      if (!isConfirm || loading) return;
      setLoading(true);
      const res = await api.delete(`/outcome/${item.id}`);
      await fetchData();
      makeToast("success", res?.data?.message);
      setLoading(false);
    } catch (error) {
      makeToast("error", error);
    } finally {
      setLoading(false);
    }
  };

  const isOther = form.category === "Other";

  return {
    data,
    Loading,
    categories,
    onChange,
    form,
    other,
    setOther,
    open,
    setOpen,
    onClickDetail,
    onClose,
    isOther,
    mutate,
    confirmDelete,
    stocks,
    methods,
  };
};
