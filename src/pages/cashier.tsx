import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { LoadingData } from "@/components/material/loading-data";
import { api } from "@/config/api";
import { LOGO } from "@/constants/image";
import formatRupiah from "@/helper/formatRupiah";
import { makeToast } from "@/helper/makeToast";
import { Api } from "@/models/response";
import {
  DetailBusiness,
  DetailProduct,
  DetailProductCategory,
} from "@/models/schema";
import { cn } from "@/utils/cn";
import { $Enums } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MdShoppingCartCheckout } from "react-icons/md";

const CashierPage = () => {
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
    orderDTO,
    MERCHANTS,
    PAYMENT_METHODS,
    businesses,
    total,
    CheckoutButton,
    onChangeDescription,
  } = useCashier();
  return (
    <DashboardLayout title="Make Order">
      <div className="w-full flex flex-row gap-4">
        <div className="w-2/3 border border-gray-200 rounded-lg p-4 bg-white flex flex-col gap-4">
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
                <div className="grid grid-cols-3 gap-2">
                  {item.products.map((product, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg p-4 flex flex-col gap-2"
                    >
                      <Image
                        src={product.image || LOGO}
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
        <div className="w-1/3 border border-gray-200 rounded-lg p-4 bg-white flex flex-col gap-8 h-fit sticky top-0">
          <div className="border border-gray-200 rounded-lg p-4 gap-4 flex flex-col">
            <h2 className="text-3xl font-bold">Detail Order</h2>
            <div className="flex flex-col gap-2 w-full">
              <label className="font-semibold">Business</label>
              <select
                className="w-full p-2 border border-gray-200 rounded-lg shadow"
                value={orderDTO.businessId}
                onChange={(e) => onChange(e, "businessId")}
              >
                {businesses.map((item, index) => (
                  <option key={index} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label className="font-semibold">Merchant</label>
              <select
                className="w-full p-2 border border-gray-200 rounded-lg shadow"
                value={orderDTO.merchant}
                onChange={(e) => onChange(e, "merchant")}
              >
                {MERCHANTS.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label className="font-semibold">Method</label>
              <select
                className="w-full p-2 border border-gray-200 rounded-lg shadow"
                value={orderDTO.method}
                onChange={(e) => onChange(e, "method")}
              >
                {PAYMENT_METHODS.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 flex flex-col gap-8">
            <h2 className="text-3xl font-bold">Cart</h2>
            <div className="flex flex-col gap-4 w-full">
              {selectedProducts.map((item, index) => (
                <div className="flex flex-col gap-2" key={index}>
                  <div className="flex flex-row gap-4 w-full !aspect-[6/1] max-h-[140px] border border-gray-200 rounded-lg p-4 relative ">
                    <Image
                      src={item.image || LOGO}
                      alt={item.name}
                      width={100}
                      height={100}
                      className="h-full w-auto !aspect-square object-cover rounded-lg shadow-md"
                    />
                    <div className="flex flex-col h-full justify-center">
                      <div className="font-semibold text-lg">{item.name}</div>
                      <div className="">{formatRupiah(item.price)}</div>
                    </div>
                    <div className="self-end right-5 absolute flex flex-col gap-2 items-center">
                      <div className="flex flex-row gap-2 items-center border border-gray-200 rounded-lg p-2 overflow-hidden">
                        <button
                          onClick={() => decrement(item.id)}
                          className="p-1 aspect-square cursor-pointer bg-neutral-200 w-8 h-8 rounded-lg"
                        >
                          -
                        </button>
                        <button className="font-semibold">{item.amount}</button>
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
      <CheckoutButton />
      <Loading />
    </DashboardLayout>
  );
};

interface OrderDTO {
  merchant: string;
  method: string;
  businessId: string;
}

export const initOrderDTO: OrderDTO = {
  merchant: $Enums.Merchant.GrabFood,
  method: $Enums.PaymentMethod.QRIS,
  businessId: "",
};

interface CartItem extends DetailProduct {
  amount: number;
  description: string;
}

const useCashier = () => {
  const [data, setData] = useState<DetailProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderDTO, setOrderDTO] = useState<OrderDTO>(initOrderDTO);
  const [selectedProducts, setSelectedProducts] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [businesses, setBusinesses] = useState<DetailBusiness[]>([]);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

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

    setOrderDTO({ ...initOrderDTO, businessId: businesses?.[0]?.id || "" });
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
        ...prev,
        { ...product, amount: 1, description: "" },
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
    setOrderDTO({ ...orderDTO, [key]: e.target.value });
  };

  const fetchBusinesses = async () => {
    const response = await api.get<Api<DetailBusiness[]>>("/business");
    setBusinesses(response.data.data);
    if (response.data.data.length > 0) {
      setOrderDTO({ ...orderDTO, businessId: response.data.data[0].id });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const response = await api.get<Api<DetailProduct[]>>("/product");
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
    fetchBusinesses();
    setOrderDTO({
      ...orderDTO,
      merchant: $Enums.Merchant.GrabFood,
      method: $Enums.PaymentMethod.QRIS,
    });
  }, []);

  const Loading = () => <LoadingData loading={loading} />;

  const MERCHANTS = Object.values($Enums.Merchant);
  const PAYMENT_METHODS = Object.values($Enums.PaymentMethod);

  const dataCheckout = {
    ...orderDTO,
    orderItems: selectedProducts.map((item) => ({
      ...item,
      productId: item.id,
    })),
  };

  const handleCheckout = async () => {
    try {
      if (loadingCheckout) return;
      if (selectedProducts.length === 0 || loading) return;
      setLoadingCheckout(true);
      makeToast("info");
      const response = await api.post("/order", dataCheckout);
      makeToast("success", response?.data?.message);
      resetState();
    } catch (error) {
      console.log(error);
      makeToast("error", error);
    } finally {
      setLoadingCheckout(false);
    }
  };

  const CheckoutButton = () => {
    return (
      <button
        className={cn(
          "rounded-full h-fit w-fit p-4 bg-blue-500 bottom-10 right-10 fixed z-50 cursor-pointer",
          loading || selectedProducts.length === 0
            ? "bg-gray-400 cursor-wait"
            : ""
        )}
        onClick={handleCheckout}
      >
        <MdShoppingCartCheckout className="text-white w-12 h-12" />
      </button>
    );
  };

  return {
    data: filteredData,
    Loading,
    onChange,
    orderDTO,
    onClickProduct,
    onSearch,
    search,
    selectedProducts,
    increment,
    decrement,
    MERCHANTS,
    PAYMENT_METHODS,
    businesses,
    CheckoutButton,
    total,
    onChangeDescription,
  };
};

export default CashierPage;
