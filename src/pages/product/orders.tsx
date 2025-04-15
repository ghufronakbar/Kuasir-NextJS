import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { api } from "@/config/api";
import formatDate from "@/helper/formatDate";
import { AuthPage } from "@/middleware/auth-page";
import { Api } from "@/models/response";
import { useEffect, useState } from "react";
import Image from "next/image";
import { LoadingData } from "@/components/material/loading-data";
import { PLACEHOLDER } from "@/constants/image";
import { DetailOrderByDate } from "@/models/schema";
import formatRupiah from "@/helper/formatRupiah";
import { makeToast } from "@/helper/makeToast";

const OrdersPage = () => {  
  const { data, Loading, deleteOrder, totalByDate } = useOrders();

  return (
    <DashboardLayout title="Orders">
      <div className="flex flex-col gap-4">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex flex-col border border-white shadow-md rounded-lg overflow-x-hidden"
          >
            <div className="flex flex-row justify-between items-center w-full bg-gray-200 px-2 py-2 font-semibold text-xl">
              <div className="">
                {item.date}
              </div>
              <div className="text-sm font-medium">
                {formatRupiah(totalByDate(item))}
              </div>
            </div>
            {item.orders.map((order) => (
              <div
                key={order.id}
                className="w-full bg-gray-100 flex flex-col px-2 py-4 gap-2 border-b"
              >
                <div className="w-full flex flex-row justify-between items-center flex-wrap gap-2 font-semibold bg-slate-200 px-2 py-2">
                  <p>Order Id: #{order.id}</p>
                  <button
                    className="bg-red-500 px-2 py-1 text-white rounded-md cursor-pointer"
                    onClick={() => deleteOrder(order.id)}
                  >
                    Delete
                  </button>
                </div>
                <div className="w-full font-medium text-lg flex flex-col lg:flex-row gap-2">
                  <div className="relative overflow-x-auto w-full lg:w-1/2">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                      <tr className="bg-white border-b  border-gray-200">
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                        >
                          Transaction Date
                        </th>
                        <td className="px-6 py-4">
                          {formatDate(order.createdAt, true, true)}
                        </td>
                      </tr>
                      <tr className="bg-white border-b  border-gray-200">
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                        >
                          Total
                        </th>
                        <td className="px-6 py-4">
                          {formatRupiah(order.total)}
                        </td>
                      </tr>

                      <tr className="bg-white border-b  border-gray-200">
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                        >
                          Payment Method
                        </th>
                        <td className="px-6 py-4">{order.method}</td>
                      </tr>
                      <tr className="bg-white border-b  border-gray-200">
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                        >
                          Merchant
                        </th>
                        <td className="px-6 py-4">{order.merchant}</td>
                      </tr>
                      <tr className="bg-white border-b  border-gray-200">
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                        >
                          Business
                        </th>
                        <td className="px-6 py-4">{order.business}</td>
                      </tr>
                    </table>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 w-full lg:w-1/2">
                    {order.orderItems.map((orderItem) => (
                      <div
                        key={orderItem.id}
                        className="border border-gray-200 rounded-lg p-4 flex flex-col gap-2 bg-white"
                      >
                        <Image
                          src={orderItem.product.image || PLACEHOLDER}
                          alt={orderItem.name}
                          width={100}
                          height={100}
                          className="w-full aspect-video object-cover rounded-lg shadow-md"
                        />
                        <div className="font-semibold text-md">
                          {orderItem.name}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-neutral-700">
                            Notes:
                          </div>
                          <div className="text-sm">
                            {orderItem.description || "-"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm">
                            {formatRupiah(orderItem.price)} x {orderItem.amount}
                          </div>
                          <div className="text-sm font-semibold">
                            {formatRupiah(
                              orderItem.price * orderItem.amount || 0
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <Loading />
    </DashboardLayout>
  );
};

export default AuthPage(OrdersPage, ["CASHIER", "OWNER"]);

const useOrders = () => {
  const [d, setData] = useState<DetailOrderByDate[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const data = d;

  const fetchData = async () => {
    setLoading(true);
    const response = await api.get<Api<DetailOrderByDate[]>>("/product/order");
    setData(response.data.data);
    setLoading(false);
  };

  const fetching = async () => {
    await Promise.all([fetchData()]);
  };

  useEffect(() => {
    fetching();
  }, []);

  const deleteOrder = async (id: string) => {
    try {
      makeToast("info", "Deleting...");
      const confirmDel = window.confirm(
        "Are you sure you want to delete this data?"
      );
      if (!confirmDel) return;
      const res = await api.delete(`/product/order/${id}`);
      await fetching();
      makeToast("success", res?.data?.message);
    } catch (error) {
      makeToast("error", error);
    }
  };

  const totalByDate = (item: DetailOrderByDate) =>
    item.orders.reduce((acc, order) => acc + order.total, 0);

  const Loading = () => <LoadingData loading={loading} />;

  return {
    data,
    Loading,
    open,
    setOpen,
    deleteOrder,
    totalByDate,
  };
};
