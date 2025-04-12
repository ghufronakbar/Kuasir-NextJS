import axios from "axios";
import { FONNTE_API_KEY } from "@/constants/fonnte";

export const whatsapp = axios.create({
  baseURL: "https://api.fonnte.com",
});

whatsapp.interceptors.request.use(
  (config) => {
    config.headers.Authorization = FONNTE_API_KEY;
    config.data.countryCode = "62";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
