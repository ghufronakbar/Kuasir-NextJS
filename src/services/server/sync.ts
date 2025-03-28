import { BASE_URL } from "@/constants";
import { Api } from "@/models/response";
import { SynchonizeData } from "@/pages/api/synchronize";
import axios from "axios";

export const sync = async () => {
  const url = BASE_URL + "/api/synchronize";
  const { data } = await axios.post<Api<SynchonizeData>>(url);
  return data.data;
};
