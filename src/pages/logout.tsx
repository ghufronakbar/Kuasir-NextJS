import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";
import { useEffect } from "react";

const LogoutPage = () => {
  const { signOut } = useAuth();
  const { isReady } = useRouter();
  useEffect(() => {
    if (isReady) {
      signOut();
      localStorage.removeItem("business");
    }
  }, [isReady]);
  return null;
};

export default LogoutPage;
