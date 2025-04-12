import { whatsapp } from "@/config/whatsapp";
import { AxiosError } from "axios";

export const sendWhatsapp = async (
  phone: string,
  subject: string,
  message: string
) => {
  console.log("Sending WhatsApp message to: ", phone);
  const fullMessage = `${subject}\n\n${message}`;
  try {
    await whatsapp.post("/send", {
      target: phone,
      message: fullMessage,
    });
    console.log("Message sent successfully");
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log("Error sending WhatsApp message:", error?.response?.data);
    } else if (error instanceof Error) {
      console.log("Error sending WhatsApp message:", error.message);
    }
  }
};
