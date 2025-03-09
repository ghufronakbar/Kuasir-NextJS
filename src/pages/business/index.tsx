import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { api } from "@/config/api";
import formatDate from "@/helper/formatDate";
import { AuthPage } from "@/middleware/auth-page";
import { Api } from "@/models/response";
import { DetailBusiness } from "@/models/schema";
import { useEffect, useState } from "react";

const THEAD = ["No", "Name", "Parent Business", "Created At", ""];

const BusinessPage = () => {
  const { data, Loading } = useBusiness();
  return (
    <DashboardLayout title="Business">
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

const useBusiness = () => {
  const [data, setData] = useState<DetailBusiness[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const response = await api.get<Api<DetailBusiness[]>>("/business");
    setData(response.data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const Loading = () => {
    if (!loading) {
      return null;
    }
    return (
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 bottom-10 right-10 fixed z-50 pointer-events-none"></div>
    );
  };

  return { data, Loading };
};
