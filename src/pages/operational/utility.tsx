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
import { Operational } from "@prisma/client";
import formatRupiah from "@/helper/formatRupiah";

const THEAD = ["No", "Utility", "Note", "Amount", "Created At", ""];

const UtilityPage = () => {
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
    utilities,
  } = useUtility();

  return (
    <DashboardLayout
      title="Utility"
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
                    {form.id === "-" ? "Create New Utility" : "Edit Utility"}
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
                    <Label className="mt-2 font-medium">Utility</Label>
                    <select
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                      value={form.description}
                      onChange={(e) => onChange(e, "description")}
                    >
                      <option value="">Select Utility</option>
                      {utilities.map((item) => (
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

export default AuthPage(UtilityPage, ["CASHIER", "OWNER"]);

interface OutcomeDTO {
  id: string;
  description: string;
  amount: number;
  note: string;
}

const initOutcomeDTO: OutcomeDTO = {
  id: "-",
  description: "",
  amount: 0,
  note: "",
};

const useUtility = () => {
  const [data, setData] = useState<Operational[]>([]);
  const [loading, setLoading] = useState(false);
  const utilities = [
    "Gas",
    "Water",
    "Electricity",
    "Internet",
    "Phone",
    "TV",
    "Fuel",
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
    const response = await api.get<Api<Operational[]>>("/operational/utility");
    setData(response.data.data);
    setLoading(false);
  };

  const onClickDetail = (item: Operational) => {
    setOpen(true);
    setForm({
      amount: item.amount,
      description: item.description || "",
      id: item.id,
      note: item.note || "",
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
      const res = await api.post("/operational/utility", form);
      await fetching();
      makeToast("success", res?.data?.message);
    } catch (error) {
      throw error;
    }
  };

  const edit = async () => {
    try {
      const res = await api.put(`/operational/utility/${form.id}`, form);
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

  const confirmDelete = async (item: Operational) => {
    try {
      const isConfirm = confirm("Are you sure you want to delete this data?");
      if (!isConfirm || loading) return;
      setLoading(true);
      const res = await api.delete(`/operational/utility/${item.id}`);
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
    utilities,
  };
};
