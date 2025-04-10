import { api } from "@/config/api";
import formatRupiah from "@/helper/formatRupiah";
import { makeToast } from "@/helper/makeToast";
import { cn } from "@/lib/utils";
import { Api } from "@/models/response";
import { initReport, Report } from "@/models/schema";
import { useEffect, useState } from "react";

export const ReportCapital = () => {
  const { data } = useCapital();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col col-span-2">
        <h4 className="text-sm text-neutral-700">Balance</h4>
        <p
          className={cn(
            "text-3xl font-semibold",
            data?.total >= 0 ? "text-neutral-800" : "text-red-500"
          )}
        >
          {formatRupiah(data.total)}
        </p>
      </div>
    </div>
  );
};

const useCapital = () => {
  const [data, setData] = useState<Report>(initReport);

  const fetchData = async () => {
    try {
      const response = await api.get<Api<Report>>("/capital");
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
