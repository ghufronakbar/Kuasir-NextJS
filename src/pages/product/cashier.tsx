import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { LoadingData } from "@/components/material/loading-data";
import { api } from "@/config/api";
import { PLACEHOLDER } from "@/constants/image";
import formatRupiah from "@/helper/formatRupiah";
import { makeToast } from "@/helper/makeToast";
import { Api } from "@/models/response";
import { DetailProduct, DetailProductCategory } from "@/models/schema";
import { $Enums } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MdShoppingCart } from "react-icons/md";
import { Label } from "@/components/ui/label";
import { useBusiness } from "@/hooks/useBusiness";

const CashierPage = () => {
  const { data: business } = useBusiness();
  const {
    Loading,
    data,
    onClickProduct,
    onSearch,
    search,
    selectedProducts,
    increment,
    decrement,
    onChange,
    form,
    MERCHANTS,
    PAYMENT_METHODS,
    total,
    onChangeDescription,
    open,
    setOpen,
    handleCheckout,
    isDisable,
  } = useCashier();
  return (
    <DashboardLayout
      title="Make Order"
      childrenHeader={
        <Dialog.Root
          size="sm"
          placement="center"
          motionPreset="slide-in-bottom"
          lazyMount
          open={open}
          onOpenChange={(e) => setOpen(e.open)}
          onExitComplete={() => setOpen(false)}
        >
          <Dialog.Trigger asChild>
            <Button className="bg-teal-500 px-2 text-white">
              <MdShoppingCart /> Make Order
            </Button>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title className="font-semibold">
                    Detail Order
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
                      handleCheckout();
                    }}
                  >
                    <Label className="mt-2 font-medium">Business</Label>
                    <select
                      className="w-full p-2 border border-gray-200 rounded-lg shadow"
                      value={form.business}
                      onChange={(e) => onChange(e, "business")}
                    >
                      {business.map((item, index) => (
                        <option key={index} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <Label className="mt-2 font-medium">Merchant</Label>
                    <select
                      className="w-full p-2 border border-gray-200 rounded-lg shadow"
                      value={form.merchant}
                      onChange={(e) => onChange(e, "merchant")}
                    >
                      {MERCHANTS.map((item, index) => (
                        <option key={index} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <Label className="mt-2 font-medium">Method</Label>
                    <select
                      className="w-full p-2 border border-gray-200 rounded-lg shadow"
                      value={form.method}
                      onChange={(e) => onChange(e, "method")}
                    >
                      {PAYMENT_METHODS.map((item, index) => (
                        <option key={index} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <Label className="mt-2 font-medium">Customer Name*</Label>
                    <input
                      className="w-full p-2 border border-gray-200 rounded-lg shadow"
                      value={form.name}
                      onChange={(e) => onChange(e, "name")}
                      placeholder="Eren Yeager"
                    />
                    <span className="text-xs text-muted-foreground">
                      *Optional
                    </span>
                    <Label className="mt-2 font-medium">
                      Customer Phone / Email**
                    </Label>
                    <input
                      className="w-full p-2 border border-gray-200 rounded-lg shadow"
                      value={form.code}
                      onChange={(e) => onChange(e, "code")}
                      type="number"
                      placeholder="62812345678"
                    />
                    <span className="text-xs text-muted-foreground">
                      **If Phone Start With 62
                    </span>
                    <Button
                      type="submit"
                      className="bg-teal-500 font-semibold text-white mt-4"
                      disabled={isDisable}
                    >
                      Create
                    </Button>
                  </form>
                </Dialog.Body>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      }
    >
      <div className="w-full flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-1/2 xl:w-2/3 border border-gray-200 rounded-lg p-4 bg-white flex flex-col gap-4">
          <h2 className="text-3xl font-bold">Select Menu</h2>
          <input
            type="text"
            placeholder="Search"
            className="w-full p-2 border border-gray-200 rounded-lg shadow"
            value={search}
            onChange={onSearch}
          />
          <div className="flex flex-col gap-4">
            {data.map((item, index) => (
              <div key={index} className="flex flex-col gap-2">
                <div className="text-xl font-semibold">{item.name}</div>
                <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                  {item.products.map((product, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg p-4 flex flex-col gap-2"
                    >
                      <Image
                        src={product.image || PLACEHOLDER}
                        alt={product.name}
                        width={100}
                        height={100}
                        className="w-full aspect-video object-cover rounded-lg shadow-md"
                      />
                      <div className="font-semibold">{product.name}</div>
                      <div className="font-semibold">
                        {formatRupiah(product.price)}
                      </div>
                      <button
                        className="w-full rounded-md bg-black text-white py-2 hover:bg-gray-800 cursor-pointer"
                        onClick={() => onClickProduct(product)}
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full lg:w-1/2 xl:w-1/3 border border-gray-200 rounded-lg p-4 bg-white flex flex-col gap-8 h-fit sticky top-0">
          <div className="border border-gray-200 rounded-lg p-4 flex flex-col gap-8">
            <h2 className="text-3xl font-bold">Cart</h2>
            <div className="flex flex-col gap-4 w-full">
              {selectedProducts.map((item, index) => (
                <div className="flex flex-col gap-2" key={index}>
                  <div className="flex flex-row gap-4 w-full border border-gray-200 rounded-lg p-4 relative ">
                    <Image
                      src={item.image || PLACEHOLDER}
                      alt={item.name}
                      width={100}
                      height={100}
                      className="h-full w-auto !aspect-square object-cover rounded-lg shadow-md"
                    />
                    <div className="w-full flex justify-between flex-col">
                      <div className="flex flex-col justify-center">
                        <div className="font-semibold text-lg line-clamp-1">
                          {item.name}
                        </div>
                        <div className="">{formatRupiah(item.price)}</div>
                      </div>
                      <div className="self-end flex flex-col gap-2 items-center">
                        <div className="flex flex-row gap-2 items-center border border-gray-200 rounded-lg p-2 overflow-hidden">
                          <button
                            onClick={() => decrement(item.id)}
                            className="p-1 aspect-square cursor-pointer bg-neutral-200 w-8 h-8 rounded-lg"
                          >
                            -
                          </button>
                          <button className="font-semibold">
                            {item.amount}
                          </button>
                          <button
                            onClick={() => increment(item.id)}
                            className="p-1 aspect-square cursor-pointer bg-neutral-200 w-8 h-8 rounded-lg"
                          >
                            +
                          </button>
                        </div>
                        <div className="font-semibold ">
                          {formatRupiah(item.price * item.amount)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <textarea
                    className="w-full p-2 border border-gray-200 rounded-lg shadow"
                    placeholder="Description | Additional | Optional"
                    value={item.description}
                    onChange={(e) => onChangeDescription(e, index)}
                  />
                </div>
              ))}
              {selectedProducts.length === 0 && (
                <div className="text-center text-neutral-400">
                  No items in cart
                </div>
              )}
              <div className="flex flex-row items-center justify-between">
                <div className="text-xl font-bold">Total</div>
                <div className="text-xl font-bold">{formatRupiah(total)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Loading />
    </DashboardLayout>
  );
};

interface OrderDTO {
  merchant: string;
  method: string;
  business: $Enums.Business;
  name: string;
  code: string;
}

export const initOrderDTO: OrderDTO = {
  merchant: $Enums.Merchant.GrabFood,
  method: $Enums.PaymentMethod.QRIS,
  business: "Haykatuju",
  name: "",
  code: "",
};

interface CartItem extends DetailProduct {
  amount: number;
  description: string;
}

const useCashier = () => {
  const [data, setData] = useState<DetailProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setOrderDTO] = useState<OrderDTO>(initOrderDTO);
  const [selectedProducts, setSelectedProducts] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [open, setOpen] = useState(false);

  const onChangeDescription = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    index: number
  ) => {
    const newSelectedProducts = [...selectedProducts];
    newSelectedProducts[index].description = e.target.value;
    setSelectedProducts(newSelectedProducts);
  };

  const resetState = () => {
    setSelectedProducts([]);
    setOpen(false);
    setOrderDTO({ ...initOrderDTO });
  };

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const filteredData = data.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.products.some((product) =>
        product.name.toLowerCase().includes(search.toLowerCase())
      )
  );

  const total = selectedProducts.reduce(
    (acc, item) => acc + item.price * item.amount,
    0
  );

  const onClickProduct = (product: DetailProduct) => {
    if (selectedProducts.find((item) => item.id === product.id)) {
      const find = selectedProducts.find((item) => item.id === product.id);
      if (find) find.amount += 1;
      setSelectedProducts([...selectedProducts]);
    } else {
      setSelectedProducts((prev) => [
        { ...product, amount: 1, description: "" },
        ...prev,
      ]);
    }
  };

  const increment = (id: string) => {
    const find = selectedProducts.find((item) => item.id === id);
    if (find) find.amount += 1;
    setSelectedProducts([...selectedProducts]);
  };

  const decrement = (id: string) => {
    const find = selectedProducts.find((item) => item.id === id);
    if (find) {
      if (find && find.amount <= 1) {
        setSelectedProducts(selectedProducts.filter((item) => item.id !== id));
      } else {
        find.amount -= 1;
        setSelectedProducts([...selectedProducts]);
      }
    }
  };

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    key: keyof OrderDTO
  ) => {
    setOrderDTO({ ...form, [key]: e.target.value });
  };

  const fetchData = async () => {
    setLoading(true);
    const response = await api.get<Api<DetailProduct[]>>("/product/menu");
    const groupedData: DetailProductCategory[] = [];

    response.data.data.forEach((product) => {
      const existingCategory = groupedData.find(
        (category) => category.id === product.productCategoryId
      );

      if (existingCategory) {
        existingCategory.products.push(product);
      } else {
        groupedData.push({
          ...product.productCategory,
          products: [product],
        });
      }
    });

    setData(groupedData);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    setOrderDTO({
      ...form,
      merchant: $Enums.Merchant.GrabFood,
      method: $Enums.PaymentMethod.QRIS,
    });
  }, []);

  const Loading = () => <LoadingData loading={loading} />;

  const MERCHANTS = Object.values($Enums.Merchant);
  const PAYMENT_METHODS = Object.values($Enums.PaymentMethod);

  const dataCheckout = {
    ...form,
    orderItems: selectedProducts.map((item) => ({
      ...item,
      productId: item.id,
    })),
  };

  const handleCheckout = async () => {
    try {
      if (isDisable) return;
      setLoadingCheckout(true);
      makeToast("info");
      const response = await api.post("/product/order", dataCheckout);
      makeToast("success", response?.data?.message);
      resetState();
    } catch (error) {
      console.log(error);
      makeToast("error", error);
    } finally {
      setLoadingCheckout(false);
    }
  };

  const isDisable =
    loading ||
    loadingCheckout ||
    selectedProducts.length === 0 ||
    !form.method ||
    !form.merchant;

  return {
    data: filteredData,
    Loading,
    onChange,
    form,
    onClickProduct,
    onSearch,
    search,
    selectedProducts,
    increment,
    decrement,
    MERCHANTS,
    PAYMENT_METHODS,
    total,
    onChangeDescription,
    open,
    setOpen,
    handleCheckout,
    isDisable,
  };
};

export default CashierPage;
