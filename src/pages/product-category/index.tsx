import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { LoadingData } from "@/components/material/loading-data";
import { api } from "@/config/api";
import formatDate from "@/helper/formatDate";
import { AuthPage } from "@/middleware/auth-page";
import { Api } from "@/models/response";
import { DetailProductCategory } from "@/models/schema";
import { useEffect, useState } from "react";

const THEAD = ["No", "Name", "Total Product", "Created At", ""];

const BusinessPage = () => {
  const { data, Loading } = useProductCategories();
  return (
    <DashboardLayout title="Product Category">
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
                <td className="px-6 py-4">{formatDate(item.createdAt)}</td>
                <td className="px-6 py-4">Some Action</td>
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

const useProductCategories = () => {
  const [data, setData] = useState<DetailProductCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const response = await api.get<Api<DetailProductCategory[]>>(
      "/product-category"
    );
    setData(response.data.data);
    setLoading(false);
  };

  const Loading = () => <LoadingData loading={loading} />

  useEffect(() => {
    fetchData();
  }, []);

  return { data, Loading };
};
