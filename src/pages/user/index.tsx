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
import { $Enums } from "@prisma/client";
import Image from "next/image";
import { PLACEHOLDER } from "@/constants/image";
import { DetailUser } from "@/models/schema";

const THEAD = ["No", "", "Name", "Email", "Role", "Created At", ""];

const UserPage = () => {
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
    ROLES,
  } = useUsers();
  return (
    <DashboardLayout
      title="Users"
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
                    {form.id === "-" ? "Create User" : "Edit User Role"}
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
                      disabled={form.id !== "-"}
                    />
                    <Label className="mt-2 font-medium">Email</Label>
                    <input
                      value={form.email}
                      onChange={(e) => onChange(e, "email")}
                      placeholder="lanstheprodigy@kuasir.com"
                      type="text"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                      disabled={form.id !== "-"}
                    />

                    <Label className="mt-2 font-medium">Role</Label>
                    <select
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                      value={form.role}
                      onChange={(e) => onChange(e, "role")}
                    >
                      <option value="" disabled hidden>
                        Select Role
                      </option>
                      {ROLES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>

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
                    src={item.image || PLACEHOLDER}
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
                  {item.name}
                </th>
                <td className="px-6 py-4">{item.email}</td>
                <td className="px-6 py-4">{item.role}</td>
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

export default AuthPage(UserPage, ["CASHIER", "OWNER"]);

interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: $Enums.Role;
}

const initUserDTO: UserDTO = {
  id: "-",
  name: "",
  email: "",
  role: "CASHIER",
};

const useUsers = () => {
  const [data, setData] = useState<DetailUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<UserDTO>(initUserDTO);
  const [open, setOpen] = useState(false);

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
    const response = await api.get<Api<DetailUser[]>>("/user");
    setData(response.data.data);
    setLoading(false);
  };

  const onClickDetail = (item: DetailUser) => {
    setOpen(true);
    setForm(item);
  };

  const onClose = () => {
    setForm(initUserDTO);
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
      setForm(initUserDTO);
      setLoading(false);
      setOpen(false);
    }
  };

  const create = async () => {
    try {
      const res = await api.post("/user", {
        ...form,
      });
      await fetching();
      makeToast("success", res?.data?.message);
    } catch (error) {
      throw error;
    }
  };

  const edit = async () => {
    try {
      const res = await api.patch(`/user/${form.id}`, {
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

  const confirmDelete = async (item: DetailUser) => {
    try {
      const isConfirm = confirm("Are you sure you want to delete this data?");
      if (!isConfirm || loading) return;
      setLoading(true);
      const res = await api.delete(`/user/${item.id}`);
      await fetchData();
      makeToast("success", res?.data?.message);
      setLoading(false);
    } catch (error) {
      makeToast("error", error);
    } finally {
      setLoading(false);
    }
  };

  const ROLES = Object.values($Enums.Role);

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
    ROLES,
  };
};
