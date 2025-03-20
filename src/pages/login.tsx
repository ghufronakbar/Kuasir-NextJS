import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  BottomGradient,
  Input,
  LabelInputContainer,
} from "@/components/ui/input";
import Link from "next/link";
import { MdLogin, MdPassword } from "react-icons/md";
import { useRouter } from "next/router";
import { api } from "@/config/api";
import Cookies from "js-cookie";
import { AxiosError } from "axios";
import { makeToast } from "@/helper/makeToast";

const LoginForm = () => {
  const { form, handleLogin, onChange, pending } = useLogin();
  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white">
      <h2 className="font-bold text-xl text-neutral-800">Kuasir Login</h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 ">
        Track, Manage, Optimize — All in One Place.
      </p>

      <form
        className="my-8"
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <LabelInputContainer className="mb-4">
          <Label>Email</Label>
          <Input
            placeholder="admin@kuasir.com"
            value={form.email}
            onChange={(e) => onChange(e, "email")}
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-8">
          <Label>Kata Sandi</Label>
          <Input
            placeholder="••••••••"
            type="password"
            value={form.password}
            onChange={(e) => onChange(e, "password")}
          />
        </LabelInputContainer>

        <button
          className="bg-gradient-to-br relative group/btn from-black to-neutral-600 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] text-center flex items-center justify-center"
          type="submit"
        >
          {pending ? (
            <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div>
          ) : (
            <div className="flex items-center space-x-2">
              <MdLogin className="h-4 w-4" />
              <span>Masuk</span>
            </div>
          )}
          <BottomGradient />
        </button>

        <div className="bg-gradient-to-r from-transparent via-neutral-300 to-transparent my-8 h-[1px] w-full" />

        <div className="flex flex-col space-y-4">
          <Link
            className="relative group/btn flex space-x-2 items-center px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 justify-center"
            href="/register"
          >
            <MdPassword className="h-4 w-4 text-neutral-800 " />
            <span className="text-neutral-700 text-sm">Lupa Password</span>
            <BottomGradient />
          </Link>
        </div>
      </form>
    </div>
  );
};

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 py-20">
      <LoginForm />
    </div>
  );
};

export default LoginPage;

interface LoginDTO {
  email: string;
  password: string;
}

const initLoginDTO: LoginDTO = {
  email: "",
  password: "",
};

const useLogin = () => {
  const [form, setForm] = useState<LoginDTO>(initLoginDTO);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: keyof LoginDTO
  ) => {
    setForm({ ...form, [type]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      setPending(true);
      const response = await api.post("/account/login", form);
      Cookies.set("ACCESS_TOKEN", response?.data?.data?.accessToken);
      router.push("/profile");
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        makeToast("error", error.response?.data?.message);
      }
    } finally {
      setPending(false);
    }
  };

  return {
    form,
    setForm,
    onChange,
    handleLogin,
    pending,
  };
};
