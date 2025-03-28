import { BASE_URL } from "@/constants";
import axios from "axios";

export const sync = async () => {
  const url = BASE_URL + "/api/synchronize";
  console.log({ url });
  await axios.post(url);
};
