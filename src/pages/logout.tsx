import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";
import { useEffect } from "react";

const LogoutPage = () => {
  const { signOut } = useAuth();
  const { isReady } = useRouter();
  useEffect(() => {
    if (isReady) {
      signOut();
    }
  }, [isReady]);
  return null;
};

export default LogoutPage;
