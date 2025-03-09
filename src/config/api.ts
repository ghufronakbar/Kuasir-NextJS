import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("ACCESS_TOKEN");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        Cookies.remove("ACCESS_TOKEN");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export { api };
