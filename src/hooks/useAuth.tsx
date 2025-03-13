import React, { createContext, useContext, useEffect, useState } from "react";
import { $Enums } from "@prisma/client";
import { api } from "@/config/api";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { makeToast } from "@/helper/makeToast";

interface DecodedToken {
  id: string;
  email: string;
  name: string;
  role: $Enums.Role;
  iat: number;
  exp: number;
}

interface AuthContextType {
  loading: boolean;
  decoded: DecodedToken | null;
  fetchAuth: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [decoded, setDecoded] = useState<DecodedToken | null>(null);
  const router = useRouter();

  const fetchAuth = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("ACCESS_TOKEN");
      if (!token) {
        setDecoded(null);
        router.push("/login");
        setLoading(false);
        return;
      }
      const response = await api.get<DecodedToken>("/auth/check", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDecoded(response.data);
    } catch (error) {
      console.error(error);
      Cookies.remove("ACCESS_TOKEN");
      setDecoded(null);
      makeToast("error", "You are not authorized to access this page!");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.isReady) {
      fetchAuth();
    }
  }, [router]);

  const signOut = async () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useLogout();
  };

  const useLogout = () => {
    return useEffect(() => {
      if (router.isReady) {
        Cookies.remove("ACCESS_TOKEN");
        setDecoded(null);
        router.push("/login");
      } else {
        window.location.href = "/login";
        Cookies.remove("ACCESS_TOKEN");
        setDecoded(null);
      }
    }, [router.isReady]);
  };

  return (
    <AuthContext.Provider value={{ loading, decoded, fetchAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
