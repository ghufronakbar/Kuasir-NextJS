import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { api } from "@/config/api";
import formatDate from "@/helper/formatDate";
import { AuthPage } from "@/middleware/auth-page";
import { Api } from "@/models/response";
import { useEffect, useState } from "react";
import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { MdBroadcastOnHome, MdCreate } from "react-icons/md";
import { Label } from "@/components/ui/label";
import { makeToast } from "@/helper/makeToast";
import { DetailCustomer } from "@/models/schema";
import { $Enums } from "@prisma/client";

const THEAD = [
  "No",
  "Name",
  "Email / Phone",
  "Total Order",
  "Last Order",
  "Created At",
  "",
];

const CustomerPage = () => {
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
    isEdit,
  } = useCustomers();

  const { handleSend, msg, onChangeMsg, isMsg, setIsMsg } = useMessage();
  return (
    <DashboardLayout
      title="Customer"
      belowHeader={
        <Dialog.Root
          size="sm"
          placement="center"
          motionPreset="slide-in-bottom"
          lazyMount
          open={isMsg}
          onOpenChange={(e) => setIsMsg(e.open)}
          // onExitComplete={onClose}
        >
          <Dialog.Trigger asChild>
            <Button className="bg-teal-500 px-2 text-white">
              <MdBroadcastOnHome /> Broadcast Message
            </Button>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title className="font-semibold">
                    Send broadcast message to customers who have made a purchase based on the selected business
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
                      handleSend();
                    }}
                  >
                    <Label className="mt-2 font-medium">Title</Label>
                    <input
                      value={msg.title}
                      onChange={(e) => onChangeMsg(e, "title")}
                      placeholder="Pemberitahuan Diskon"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                    />
                    <Label className="mt-2 font-medium">Message</Label>
                    <textarea
                      value={msg.message}
                      onChange={(e) => onChangeMsg(e, "message")}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                    />
                    <Label className="mt-2 font-medium">Business</Label>
                    <select
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                      value={msg.business}
                      onChange={(e) => onChangeMsg(e, "business")}
                    >
                      <option value="" disabled hidden>
                        Select Business
                      </option>
                      {Object.values($Enums.Business).map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="submit"
                      className="bg-teal-500 font-semibold text-white mt-4"
                    >
                      Send
                    </Button>
                  </form>
                </Dialog.Body>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
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
                    {!isEdit ? "Create Customer" : "Edit Customer"}
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
                    <Label className="mt-2 font-medium">Name</Label>
                    <input
                      value={form.name}
                      onChange={(e) => onChange(e, "name")}
                      placeholder="Lans The Prodigy"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                    />
                    <Label className="mt-2 font-medium">Email / Phone*</Label>
                    <input
                      value={form.code}
                      onChange={(e) => onChange(e, "code")}
                      placeholder="62814261721"
                      type="text"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                    />
                    <span className="text-xs text-muted-foreground">
                      *If Phone Start With 62
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
                  {item.name}
                </th>
                <td className="px-6 py-4">{item.id}</td>
                <td className="px-6 py-4">{item.orders?.length}</td>
                <td className="px-6 py-4">
                  {formatDate(item.orders?.[0]?.createdAt, true, true)}
                </td>
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

export default AuthPage(CustomerPage, ["CASHIER", "OWNER"]);

interface UserDTO {
  id: string;
  name: string;
  code: string;
}

const initUserDTO: UserDTO = {
  id: "",
  name: "",
  code: "",
};

const useCustomers = () => {
  const [data, setData] = useState<DetailCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<UserDTO>(initUserDTO);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    key: keyof UserDTO
  ) => {
    setForm({ ...form, [key]: e.target.value });
  };

  const fetchData = async () => {
    setLoading(true);
    const response = await api.get<Api<DetailCustomer[]>>("/customer");
    setData(response.data.data);
    setLoading(false);
  };

  const onClickDetail = (item: DetailCustomer) => {
    setOpen(true);
    setIsEdit(true);
    setForm({ code: item.id, name: item.name, id: item.id });
  };

  const onClose = () => {
    setForm(initUserDTO);
    setIsEdit(false);
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
      await create();
      await fetchData();
    } catch (error) {
      makeToast("error", error);
    } finally {
      setForm(initUserDTO);
      setLoading(false);
      setOpen(false);
    }
  };

  const create = async () => {
    try {
      const res = await api.post("/customer", {
        ...form,
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

  const confirmDelete = async (item: DetailCustomer) => {
    try {
      const isConfirm = confirm("Are you sure you want to delete this data?");
      if (!isConfirm || loading) return;
      setLoading(true);
      const res = await api.delete(`/customer?id=${item.id}`);
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
    isEdit,
  };
};

interface MessageDTO {
  title: string;
  message: string;
  business: string;
}

const initMessageDTO: MessageDTO = {
  title: "",
  message: "",
  business: "Haykatuju",
};

const useMessage = () => {
  const [isMsg, setIsMsg] = useState(false);
  const [msg, setMsg] = useState(initMessageDTO);
  const [loading, setLoading] = useState(false);

  const onChangeMsg = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
    key: keyof MessageDTO
  ) => {
    setMsg({ ...msg, [key]: e.target.value });
  };

  const handleSend = async () => {
    try {
      if (loading) return;
      setLoading(true);
      makeToast("info");
      const res = await api.post("/customer/message", { ...msg });
      makeToast("success", res?.data?.message);
      setIsMsg(false);
      setMsg(initMessageDTO);
    } catch (error) {
      makeToast("error", error);
    } finally {
      setLoading(false);
    }
  };

  return { msg, onChangeMsg, handleSend, isMsg, setIsMsg };
};
