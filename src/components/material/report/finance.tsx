import { api } from "@/config/api";
import formatRupiah from "@/helper/formatRupiah";
import { makeToast } from "@/helper/makeToast";
import { Api } from "@/models/response";
import { initReport, Report } from "@/models/schema";
import { useEffect, useState } from "react";

export const ReportFinance = () => {
  const { data } = useFinance();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col col-span-2">
        <h4 className="text-sm text-neutral-700">Balance</h4>
        <p className="text-3xl text-neutral-800 font-semibold">
          {formatRupiah(data.total)}
        </p>
      </div>
      <div className="flex flex-row gap-4 flex-wrap">
        <div className="flex flex-col">
          <h4 className="text-sm text-neutral-700">To Be Received</h4>
          <p className="text-2xl text-green-500 font-semibold">
            +{formatRupiah(data.plus)}
          </p>
        </div>
        <div className="flex flex-col">
          <h4 className="text-sm text-neutral-700">To Be Paid</h4>
          <p className="text-2xl text-red-500 font-semibold">
            -{formatRupiah(data.minus)}
          </p>
        </div>
      </div>
    </div>
  );
};

const useFinance = () => {
  const [data, setData] = useState<Report>(initReport);

  const fetchData = async () => {
    try {
      const response = await api.get<Api<Report>>("/finance");
      setData(response.data.data);
    } catch (error) {
      makeToast("error", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data };
};
