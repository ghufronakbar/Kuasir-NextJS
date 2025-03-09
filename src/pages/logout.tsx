import { useAuth } from "@/hooks/useAuth";

const LogoutPage = () => {
  const { signOut } = useAuth();
  signOut();
  return null;
};

export default LogoutPage;
