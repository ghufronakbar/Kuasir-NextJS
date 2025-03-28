import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { LoadingData } from "@/components/material/loading-data";
import { Label } from "@/components/ui/label";
import { api } from "@/config/api";
import formatDate from "@/helper/formatDate";
import { makeToast } from "@/helper/makeToast";
import { AuthPage } from "@/middleware/auth-page";
import { Api } from "@/models/response";
import { DetailProductCategory } from "@/models/schema";
import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { MdCreate } from "react-icons/md";

const THEAD = ["No", "Name", "Total Product", "Created At", ""];

const ProductCategoryPage = () => {
  const {
    data,
    Loading,
    form,
    onChange,
    onClickDetail,
    onClose,
    open,
    setOpen,
    mutate,
    confirmDelete,
  } = useProductCategories();
  return (
    <DashboardLayout
      title="Product Category"
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
                    {form.id === "-" ? "Create Product" : "Edit Product"}
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
                      placeholder="Lauk"
                      type="text"
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
                  {item.name}
                </th>
                <td className="px-6 py-4">{item.products.length}</td>
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

export default AuthPage(ProductCategoryPage, ["CASHIER", "OWNER"]);

interface ProductCategoryDTO {
  id: string;
  name: string;
}

const initProductCategoryDTO: ProductCategoryDTO = {
  id: "-",
  name: "",
};

const useProductCategories = () => {
  const [data, setData] = useState<DetailProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ProductCategoryDTO>(initProductCategoryDTO);
  const [open, setOpen] = useState(false);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof ProductCategoryDTO
  ) => {
    setForm({ ...form, [key]: e.target.value });
  };

  const onClickDetail = (item: DetailProductCategory) => {
    setForm({ id: item.id, name: item.name });
    setOpen(true);
  };

  const onClose = () => {
    setForm(initProductCategoryDTO);
    setOpen(false);
  };

  const fetchData = async () => {
    setLoading(true);
    const response = await api.get<Api<DetailProductCategory[]>>(
      "/product-category"
    );
    setData(response.data.data);
    setLoading(false);
  };

  const Loading = () => <LoadingData loading={loading} />;

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
      setForm(initProductCategoryDTO);
      setLoading(false);
      setOpen(false);
    }
  };

  const create = async () => {
    try {
      const res = await api.post("/product-category", {
        ...form,
      });
      await fetchData();
      makeToast("success", res?.data?.message);
    } catch (error) {
      throw error;
    }
  };

  const edit = async () => {
    try {
      const res = await api.put(`/product-category/${form.id}`, {
        ...form,
      });
      await fetchData();
      makeToast("success", res?.data?.message);
    } catch (error) {
      throw error;
    }
  };

  const confirmDelete = async (item: DetailProductCategory) => {
    try {
      const isConfirm = confirm("Are you sure you want to delete this data?");
      if (!isConfirm || loading) return;
      setLoading(true);
      const res = await api.delete(`/product-category/${item.id}`);
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
    form,
    open,
    onChange,
    onClickDetail,
    onClose,
    setOpen,
    mutate,
    confirmDelete,
  };
};
