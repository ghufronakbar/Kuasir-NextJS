import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { api } from "@/config/api";
import formatDate from "@/helper/formatDate";
import { AuthPage } from "@/middleware/auth-page";
import { Api } from "@/models/response";
import { DetailBusiness, DetailParentBusiness } from "@/models/schema";
import { useEffect, useState } from "react";
import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { MdCreate } from "react-icons/md";
import { Label } from "@/components/ui/label";
import { makeToast } from "@/helper/makeToast";
import { CachedBusiness } from "@/hooks/useBusiness";

const THEAD = ["No", "Name", "Parent Business", "Created At", ""];

const BusinessPage = () => {
  const {
    data,
    Loading,
    form,
    onChange,
    parents,
    other,
    setOther,
    open,
    setOpen,
    onClickDetail,
    onClose,
    isOther,
    mutate,
    confirmDelete,
  } = useBusiness();
  return (
    <DashboardLayout
      title="Business"
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
                    {form.id === "-" ? "Create Business" : "Edit Business"}
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
                      placeholder="Haykatuju"
                      type="text"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                    />
                    <Label className="mt-2 font-medium">Parent Business</Label>
                    <select
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                      value={form.parentBusiness}
                      onChange={(e) => onChange(e, "parentBusiness")}
                    >
                      <option value="">Select Parent Business</option>
                      {parents.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    {isOther && (
                      <>
                        <Label className="mt-2 font-medium">
                          Name Parent Business
                        </Label>
                        <input
                          value={other}
                          onChange={(e) => setOther(e.target.value)}
                          placeholder="Haykatuju"
                          type="text"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                        />
                      </>
                    )}
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
                <td className="px-6 py-4">{item.parentBusiness.name}</td>
                <td className="px-6 py-4">
                  {formatDate(item.createdAt, true)}
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

export default AuthPage(BusinessPage, ["CASHIER", "OWNER"]);

interface BusinessDTO {
  id: string;
  name: string;
  parentBusiness: string;
}

const initBusinessDTO: BusinessDTO = {
  id: "-",
  name: "",
  parentBusiness: "",
};

const useBusiness = () => {
  const [_data, setData] = useState<DetailBusiness[]>([]);
  const [loading, setLoading] = useState(false);
  const [parents, setParents] = useState<string[]>([]);
  const [form, setForm] = useState<BusinessDTO>(initBusinessDTO);
  const [other, setOther] = useState("");
  const [open, setOpen] = useState(false);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    key: keyof BusinessDTO
  ) => {
    setForm({ ...form, [key]: e.target.value });
  };

  const fetchData = async () => {
    setLoading(true);
    const response = await api.get<Api<DetailBusiness[]>>("/business");
    setData(response.data.data);
    const cachedBusiness: CachedBusiness = {
      ttl: Date.now() + 60 * 60 * 1000,
      data: response.data.data,
    };
    localStorage.setItem("business", JSON.stringify(cachedBusiness));
    setLoading(false);
  };

  const fetchParents = async () => {
    const res = await api.get<Api<DetailParentBusiness[]>>("/parent-business");
    setParents([...res.data.data.map((item) => item.name), "Other"]);
    setForm({ ...form, id: res.data.data?.[0]?.id || "-" });
  };

  const onClickDetail = (item: DetailBusiness) => {
    setOpen(true);
    setForm({ ...item, parentBusiness: item.parentBusiness.name });
  };

  const onClose = () => {
    setForm(initBusinessDTO);
    setOpen(false);
  };

  const fetching = async () => {
    await Promise.all([fetchData(), fetchParents()]);
  };

  useEffect(() => {
    fetchData();
    fetchParents();
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
      setForm(initBusinessDTO);
      setLoading(false);
      setOpen(false);
    }
  };

  const create = async () => {
    try {
      const res = await api.post("/business", {
        name: form.name,
        parentBusiness: isOther ? other : form.parentBusiness,
      });
      await fetching();
      makeToast("success", res?.data?.message);
    } catch (error) {
      throw error;
    }
  };

  const edit = async () => {
    try {
      const res = await api.put(`/business/${form.id}`, {
        name: form.name,
        parentBusiness: isOther ? other : form.parentBusiness,
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

  const confirmDelete = async (item: DetailBusiness) => {
    try {
      const isConfirm = confirm("Are you sure you want to delete this data?");
      if (!isConfirm || loading) return;
      setLoading(true);
      const res = await api.delete(`/business/${item.id}`);
      await fetchData();
      makeToast("success", res?.data?.message);
      setLoading(false);
    } catch (error) {
      makeToast("error", error);
    } finally {
      setLoading(false);
    }
  };

  const isOther = form.parentBusiness === "Other";

  const data = _data.filter((item) => item.name !== "All");

  return {
    data,
    Loading,
    parents,
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
  };
};
