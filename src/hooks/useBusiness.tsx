import { $Enums } from "@prisma/client";
import { useState } from "react";

export const useBusiness = () => {
  const data = Object.values($Enums.Business);
  const [selectedBusiness, setSelectedBusiness] = useState<string>(
    $Enums.Business.Haykatuju
  );

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBusiness(e.target.value);
  };
  return {
    data,
    selectedBusiness,
    onChange,
  };
};
