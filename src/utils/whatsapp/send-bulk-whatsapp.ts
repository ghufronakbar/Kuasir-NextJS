import { whatsapp } from "@/config/whatsapp";
import { AxiosError } from "axios";

export const sendBulkWhatsapp = async (
  phones: string[],
  names: string[],
  business: string,
  subject: string,
  message: string
) => {
  let success = 0;
  let i = 0;
  const promises = phones.map(async (phone) => {
    console.log("Sending WhatsApp message to: ", phone);
    const fullMessage = `*${subject} - ${business}*\n\nHai, ${
      names[i++]
    }\n\n${message}`;
    try {
      const response = await whatsapp.post("/send", {
        target: phone,
        message: fullMessage,
      });
      console.log(`Message sent successfully to ${phone}`);
      if (response.data?.status) {
        success++;
      } else {
        console.log(
          `Failed to send message to ${phone}, response: ${JSON.stringify(
            response.data
          )}`
        );
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(
          `Axios Error sending WhatsApp message to ${phone}: `,
          error?.response
        );
      } else if (error instanceof Error) {
        console.log(
          `Error sending WhatsApp message to ${phone}: `,
          error.message
        );
      }
    }
  });

  await Promise.all(promises);
  return success;
};
