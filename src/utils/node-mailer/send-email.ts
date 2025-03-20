import { mailer } from "@/config/mailer";
import { APP_NAME, EMAIL } from "@/constants";
import { emailTemplate } from "./email-template";

type EmailType = "DELETE_ACCOUNT" | "CREATE_ACCOUNT" | "ANNOUNCEMENT";

export const sendEmail = async (
  target: string,
  type: EmailType,
  name: string,
  body = ""
) => {
  let content = "";
  let message = "";
  let subject = "";
  let isPassword = false;

  switch (type) {
    case "DELETE_ACCOUNT":
      message = "Akun anda telah dihapus";
      content = "Silahkan hubungi admin";
      subject = `Informasi Hapus Akun ${APP_NAME}`;
      isPassword = false;
      break;
    case "CREATE_ACCOUNT":
      message = "Pembuatan akun berhasil";
      content = body;
      subject = `Pembuatan akun ${APP_NAME}`;
      isPassword = true;
      break;
    case "ANNOUNCEMENT":
      message = "Pemberitahuan";
      content = body;
      subject = `Pemberitahuan ${APP_NAME}`;
      isPassword = false;
      break;
  }

  const html = emailTemplate(name, message, content, isPassword);

  const msg = {
    from: `"${APP_NAME}" <${EMAIL}>`,
    to: target,
    subject,
    html,
  };

  try {
    await mailer.sendMail(msg);
  } catch (error) {
    console.error(error);
    return new Error("400:Gagal mengirim email ");
  }
};
