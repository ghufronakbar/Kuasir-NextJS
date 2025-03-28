import { $Enums } from "@prisma/client";
import { useEffect, useState } from "react";

export const useBusiness = () => {
  const [data, setData] = useState<$Enums.Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");

  useEffect(() => {
    setData(Object.values($Enums.Business));
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBusiness(e.target.value);
  };
  return {
    data,
    selectedBusiness,
    onChange,
  };
};
