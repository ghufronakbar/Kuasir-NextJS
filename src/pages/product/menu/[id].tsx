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
import { DetailProduct, DetailRecipe, DetailStock } from "@/models/schema";
import Image from "next/image";
import { PLACEHOLDER } from "@/constants/image";
import { useRouter } from "next/router";
import { LoadingPage } from "@/components/material/loading-page";
import formatRupiah from "@/helper/formatRupiah";

const THEAD = [
  "No",
  "",
  "Name",
  "Amount",
  "Average Price",
  "Last Updated At",
  "",
];

const DetailProductPage = () => {
  const {
    data,
    Loading,
    form,
    onChange,
    // other,
    // setOther,
    open,
    setOpen,
    onClose,
    mutate,
    confirmDelete,
    stocks,
    onClickDetail,
  } = useProduct();

  if (!data) return <LoadingPage />;

  return (
    <DashboardLayout
      title="Detail Product"
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
                    {form.id === "-" ? "Create Recipe" : "Edit Recipe"}
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
                    <Label className="mt-2 font-medium">Amount</Label>
                    <input
                      value={form.amount}
                      onChange={(e) => onChange(e, "amount")}
                      placeholder="Dendeng Balado"
                      type="number"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                    />
                    <Label className="mt-2 font-medium">Stock</Label>
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
      <div className="w-full flex flex-col-reverse md:flex-row gap-4">
        <div className="w-full md:w-2/3 flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md h-fit">
          <h2 className="text-2xl lg:text-3xl lg:leading-tight max-w-5xl tracking-tight font-medium text-black">
            Recipes
          </h2>
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
                {data.recipes.map((item, index) => (
                  <tr
                    className="bg-white border-b  border-gray-200"
                    key={index}
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                    >
                      {index + 1}
                    </th>
                    <th scope="row" className="px-6 py-4">
                      <Image
                        src={item.stock.image || PLACEHOLDER}
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
                    <td className="px-6 py-4">
                      {formatDate(item.updatedAt, true, true)}
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
        </div>
        <div className="w-full md:w-1/3 flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md h-fit sticky top-0">
          <h2 className="text-2xl lg:text-3xl lg:leading-tight max-w-5xl tracking-tight font-medium text-black">
            Product
          </h2>
          <Image
            src={data.image || PLACEHOLDER}
            alt=""
            width={400}
            height={400}
            className="w-full aspect-video object-cover rounded-lg shadow-lg"
          />
          <div>
            <h3 className="text-xl lg:text-2xl lg:leading-tight max-w-5xl tracking-tight font-medium text-black">
              {data.name}
            </h3>
            <p className="text-neutral-700">{data.description}</p>
          </div>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
              <tr className="bg-white border-b  border-gray-200">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                >
                  Category
                </th>
                <td className="px-6 py-4">{data.productCategory.name}</td>
              </tr>
              <tr className="bg-white border-b  border-gray-200">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                >
                  COGS
                </th>
                <td className="px-6 py-4">{formatRupiah(data.cogs)}</td>
              </tr>
              <tr className="bg-white border-b  border-gray-200">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                >
                  Price
                </th>
                <td className="px-6 py-4">{formatRupiah(data.price)}</td>
              </tr>
              <tr className="bg-white border-b  border-gray-200">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                >
                  Created At
                </th>
                <td className="px-6 py-4">{formatDate(data.createdAt)}</td>
              </tr>
              <tr className="bg-white border-b  border-gray-200">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                >
                  Last Updated At
                </th>
                <td className="px-6 py-4">{formatDate(data.updatedAt)}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      <Loading />
    </DashboardLayout>
  );
};

export default AuthPage(DetailProductPage, ["CASHIER", "OWNER"]);

interface RecipeDTO {
  id: string;
  amount: number;
  stockId: string;
}

const initRecipeDTO: RecipeDTO = {
  id: "-",
  amount: 0,
  stockId: "",
};

const useProduct = () => {
  const [data, setData] = useState<DetailProduct>();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<RecipeDTO>(initRecipeDTO);
  const [other, setOther] = useState("");
  const [open, setOpen] = useState(false);
  const [stocks, setStocks] = useState<DetailStock[]>([]);
  const router = useRouter();
  const id = (router.query.id as string) || "";

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    key: keyof RecipeDTO
  ) => {
    setForm({ ...form, [key]: e.target.value });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get<Api<DetailProduct>>("/product/menu/" + id);
      setData(response.data.data);
      setLoading(false);
    } catch (error) {
      makeToast("error", error);
      router.push("/product/menu");
    }
  };

  const fetchDataStock = async () => {
    const res = await api.get<Api<DetailStock[]>>("/product/stock");
    setStocks(res.data.data);
  };

  const onClose = () => {
    setForm(initRecipeDTO);
    setOpen(false);
  };

  const fetching = async () => {
    await Promise.all([fetchData(), fetchDataStock()]);
  };

  useEffect(() => {
    if (router.isReady) {
      fetching();
    }
  }, [router]);

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
      setForm(initRecipeDTO);
      setLoading(false);
      setOpen(false);
    }
  };

  const create = async () => {
    try {
      const res = await api.post("/product/recipe", {
        ...form,
        productId: id,
      });
      await fetching();
      makeToast("success", res?.data?.message);
    } catch (error) {
      throw error;
    }
  };

  const edit = async () => {
    try {
      const res = await api.put(`/product/recipe/${form.id}`, {
        ...form,
        productId: id,
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

  const onClickDetail = (item: DetailRecipe) => {
    setOpen(true);
    setForm({ ...item });
  };

  const confirmDelete = async (item: DetailRecipe) => {
    try {
      const isConfirm = confirm("Are you sure you want to delete this data?");
      if (!isConfirm || loading) return;
      makeToast("info");
      setLoading(true);
      const res = await api.delete(`/product/recipe/${item.id}`);
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
    other,
    setOther,
    open,
    setOpen,
    onClose,
    mutate,
    confirmDelete,
    stocks,
    onClickDetail,
  };
};
