import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  const { isReady } = useRouter();
  useEffect(() => {
    if (isReady) {
      window.location.href = "/login";
    }
  }, [isReady]);
  return null;
}
