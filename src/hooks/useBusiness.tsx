import { LoadingData } from "@/components/material/loading-data";
import { api } from "@/config/api";
import { makeToast } from "@/helper/makeToast";
import { Api } from "@/models/response";
import { DetailBusiness } from "@/models/schema";
import { useEffect, useState } from "react";

export interface CachedBusiness {
  ttl: number;
  data: DetailBusiness[];
}

export const useBusiness = () => {
  const [data, setData] = useState<DetailBusiness[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const cachedData = localStorage.getItem("business");
      let parsed: CachedBusiness | null = null;
      if (cachedData) {
        parsed = JSON.parse(cachedData);
      }
      if (!parsed || parsed?.ttl < Date.now()) {
        const response = await api.get<Api<DetailBusiness[]>>("/business");
        setData(response.data.data);
        const cachedBusiness: CachedBusiness = {
          ttl: Date.now() + 60 * 60 * 1000,
          data: response.data.data,
        };
        localStorage.setItem("business", JSON.stringify(cachedBusiness));
        setSelectedBusiness(response.data?.data?.[0]?.id);
      } else {
        setData(parsed?.data);
        setSelectedBusiness(parsed?.data?.[0]?.id);
      }
      setLoading(false);
    } catch (error) {
      makeToast("error", error);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBusiness(e.target.value);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const Loading = () => <LoadingData loading={loading} />;

  return {
    data,
    selectedBusiness,
    onChange,
    loading,
    Loading,
  };
};
