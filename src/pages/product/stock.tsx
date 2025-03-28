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
import Image from "next/image";
import { DetailStock } from "@/models/schema";
import { LoadingData } from "@/components/material/loading-data";
import { PLACEHOLDER } from "@/constants/image";
import { UploadImage } from "@/components/material/upload-image";
import { useAuth } from "@/hooks/useAuth";
import formatRupiah from "@/helper/formatRupiah";

const THEAD = [
  "No",
  "",
  "Name",
  "Current Stock",
  "Average Price",
  "Created At",
  "",
];

const StockPage = () => {
  const {
    data,
    Loading,
    form,
    onChange,
    units,
    open,
    setOpen,
    onClickDetail,
    onClose,
    mutate,
    onChangeImage,
    onDelete,
  } = useStock();
  const { decoded } = useAuth();
  const isAdmin = decoded?.role === "OWNER";
  return (
    <DashboardLayout
      title="Stock"
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
                    {form.id === "-" ? "Create Stock" : "Edit Stock"}
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
                    <Label className="mt-2 font-medium">Image</Label>
                    <UploadImage
                      onChangeImage={onChangeImage}
                      image={form.image}
                    />
                    <Label className="mt-2 font-medium">Name</Label>
                    <input
                      value={form.name}
                      onChange={(e) => onChange(e, "name")}
                      placeholder="Daging"
                      type="text"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                    />
                    <Label className="mt-2 font-medium">Unit</Label>
                    <select
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                      value={form.unit}
                      onChange={(e) => onChange(e, "unit")}
                    >
                      <option value="">Select Unit</option>
                      {units.map((item) => (
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
                <td className="px-6 py-4">
                  {item.quantity} {item.unit}
                </td>
                <td className="px-6 py-4">
                  {formatRupiah(item.averagePrice)}
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
                    {isAdmin && (
                      <Button
                        className="bg-red-500 text-white px-2"
                        onClick={() => onDelete(item)}
                      >
                        Delete
                      </Button>
                    )}
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

export default AuthPage(StockPage, ["CASHIER", "OWNER"]);

interface StockDTO {
  id: string;
  name: string;
  unit: string;
  image: string | null;
}

const initStockDTO: StockDTO = {
  id: "-",
  name: "",
  unit: "",
  image: null,
};

const useStock = () => {
  const [data, setData] = useState<DetailStock[]>([]);
  const [loading, setLoading] = useState(false);
  const units = ["kg", "package", "liter", "bottle", "pcs", "set", "item"];
  const [form, setForm] = useState<StockDTO>(initStockDTO);
  const [open, setOpen] = useState(false);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    key: keyof StockDTO
  ) => {
    setForm({ ...form, [key]: e.target.value });
  };

  const fetchData = async () => {
    setLoading(true);
    const response = await api.get<Api<DetailStock[]>>("/product/stock");
    setData(response.data.data);
    setLoading(false);
  };

  const onClickDetail = (item: DetailStock) => {
    setForm({
      id: item.id,
      name: item.name,
      unit: item.unit,
      image: item.image,
    });
    setOpen(true);
  };

  const onClose = () => {
    setForm(initStockDTO);
    setOpen(false);
  };

  const fetching = async () => {
    await Promise.all([fetchData()]);
  };

  useEffect(() => {
    fetchData();
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
      setForm(initStockDTO);
      setLoading(false);
      setOpen(false);
    }
  };

  const create = async () => {
    try {
      const res = await api.post("/product/stock", {
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
      const res = await api.put(`/product/stock/${form.id}`, {
        ...form,
      });
      await fetching();
      makeToast("success", res?.data?.message);
    } catch (error) {
      throw error;
    }
  };

  const onChangeImage = (image: string | null) => {
    setForm({ ...form, image });
  };

  const Loading = () => <LoadingData loading={loading} />;

  const onDelete = async (item: DetailStock) => {
    try {
      const isConfirm = confirm("Are you sure you want to delete this data?");
      if (!isConfirm) return;
      setLoading(true);
      const res = await api.delete(`/product/stock/${item.id}`);
      await fetchData();
      makeToast("success", res?.data?.message);
    } catch (error) {
      makeToast("error", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    Loading,
    units,
    onChange,
    form,
    open,
    setOpen,
    onClickDetail,
    onClose,
    mutate,
    onChangeImage,
    onDelete,
  };
};
