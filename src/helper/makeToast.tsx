import { AxiosError } from "axios";
import { toast, TypeOptions } from "react-toastify";

export const makeToast = (type: TypeOptions, message?: unknown) => {
  let msg = "";
  if (typeof message === "string") {
    msg = message;
  }
  if (message instanceof AxiosError) {
    msg = message.response?.data?.message;
  }

  let defaultMessage = "";
  switch (type) {
    case "success":
      defaultMessage = "Successfull";
      break;
    case "error":
      defaultMessage = "Something went wrong";
      break;
    case "warning":
      defaultMessage = "Warning";
      break;
    case "info":
      defaultMessage = "Loading...";
      break;
    default:
      defaultMessage = "Default";
  }

  toast(msg || defaultMessage, {
    autoClose: 3000,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    type: type,
    position: "bottom-right",
  });
};
