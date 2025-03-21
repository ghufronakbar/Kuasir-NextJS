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
import { useBusiness } from "@/hooks/useBusiness";

const OrdersPage = () => {
  const {
    data: business,
    selectedBusiness,
    onChange: onChangeB,
  } = useBusiness();
  const { data, Loading } = useOrders(selectedBusiness);
  return (
    <DashboardLayout
      title="Orders"
      belowHeader={
        <select
          className="text-md text-neutral-700 font-semibold px-2 py-1 w-fit border border-gray-300 self-end rounded-md"
          onChange={onChangeB}
          value={selectedBusiness}
        >
          {business.map((item, index) => (
            <option key={index} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      }
    >
      <div className="flex flex-col">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex flex-col border border-white shadow-md rounded-lg overflow-x-hidden"
          >
            <div className="w-full bg-gray-200 px-2 py-2 font-semibold text-xl">
              {item.date}
            </div>
            {item.orders.map((order) => (
              <div
                key={order.id}
                className="w-full bg-gray-100 flex flex-col px-2 py-4 gap-2 border-b"
              >
                <h2 className="font-semibold w-full bg-slate-200 px-2 py-1">
                  Order Id: #{order.id}
                </h2>
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
                        <td className="px-6 py-4">{order.business.name}</td>
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

const useOrders = (businessId: string) => {
  const [data, setData] = useState<DetailOrderByDate[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const response = await api.get<Api<DetailOrderByDate[]>>("/order", {
      params: {
        businessId,
      },
    });
    setData(response.data.data);
    setLoading(false);
  };

  const fetching = async () => {
    await Promise.all([fetchData()]);
  };

  useEffect(() => {
    if (businessId) {
      fetching();
    }
  }, [businessId]);

  const Loading = () => <LoadingData loading={loading} />;

  return {
    data,
    Loading,
    open,
    setOpen,
  };
};
