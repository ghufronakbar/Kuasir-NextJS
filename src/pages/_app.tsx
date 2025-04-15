import { AuthProvider } from "@/hooks/useAuth";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import { Provider } from "@/components/ui/provider";
import Head from "next/head";
import { LOGO } from "@/constants/image";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider
      // themes={["light"]}
      // enableColorScheme={false}
      // defaultTheme="light"
      // enableSystem={false}
      forcedTheme="light"
    >
      <Head>
        <title>Kuasir ー クアシル</title>
        <meta name="description" content="Kuasir" />
        <link rel="shortcut icon" href={LOGO} type="image/x-icon" />
      </Head>
      <AuthProvider>
        <Component {...pageProps} />
        <ToastContainer />
      </AuthProvider>
    </Provider>
  );
}
