import { api } from "@/config/api";
import { makeToast } from "@/helper/makeToast";
import { useAuth } from "@/hooks/useAuth";
import { Api } from "@/models/response";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { MdSync } from "react-icons/md";

export const SyncButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { decoded } = useAuth();
  const router = useRouter();

  const handleSync = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);
      const res = await api.post<Api>("/synchronize");
      makeToast("success", res?.data?.message);
      router.reload();
    } catch (error) {
      makeToast("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (router.isReady) {
      if (router.pathname !== "/login") {
        setIsVisible(true);
      }
    }
  }, [router]);

  if (
    !isVisible ||
    (decoded?.role !== "OWNER" && decoded?.role !== "MANAGER_OPERATIONAL")
  )
    return null;
  return (
    <div
      className="fixed bottom-10 right-10 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white cursor-pointer text-xl"
      onClick={handleSync}
    >
      <MdSync className={isLoading ? "animate-spin cursor-wait" : ""} />
    </div>
  );
};
