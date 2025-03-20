import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Label } from "@/components/ui/label";
import { api } from "@/config/api";
import { DEFAULT_PROFILE } from "@/constants/image";
import formatDate from "@/helper/formatDate";
import { makeToast } from "@/helper/makeToast";
import { useAuth } from "@/hooks/useAuth";
import { AuthPage } from "@/middleware/auth-page";
import { Api } from "@/models/response";
import { DetailUser } from "@/models/schema";
import { cn } from "@/utils/cn";
import { User } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MdDelete, MdEdit, MdSave } from "react-icons/md";

const ProflePage = () => {
  const {
    data,
    deleteProfilePicture,
    loading,
    onChange,
    onChangeImage,
    onSubmit,
  } = useProfile();
  const {
    form,
    onChange: onChangePassword,
    onSubmit: onSubmitPassword,
  } = usePassword();
  return (
    <DashboardLayout
      title="Profile"
      childrenHeader={
        <button
          className={cn(
            "w-fit h-fit rounded-lg px-4 py-2 bg-primary text-white drop-shadow-lg hover:bg-primary/80 transition-all flex flex-row gap-2 items-center",
            loading && "cursor-not-allowed"
          )}
          onClick={onSubmit}
          disabled={loading}
        >
          <MdSave />
          Save
        </button>
      }
    >
      <div className="w-full flex flex-col-reverse md:flex-row gap-8">
        <div className="w-full md:w-1/2 lg:w-2/3 bg-white rounded-lg border-neutral-200 border p-8 h-fit flex flex-col gap-4 overflow-hidden">
          <Image
            src={data?.image || DEFAULT_PROFILE}
            alt=""
            width={400}
            height={400}
            className="w-40 h-40 rounded-full object-cover self-center"
          />
          <div className="flex flex-row gap-4 self-center">
            <div
              className="text-sm font-medium text-center self-center cursor-pointer flex flex-row gap-2 items-center"
              onClick={() => document.getElementById("image")?.click()}
            >
              <MdEdit />
              Change profile picture
            </div>
            {data?.image && (
              <div
                className="text-sm font-medium text-center self-center cursor-pointer flex flex-row gap-2 items-center"
                onClick={deleteProfilePicture}
              >
                <MdDelete />
                Delete profile picture
              </div>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            id="image"
            onChange={onChangeImage}
          />
          <Label className="mt-2 font-medium">Name</Label>
          <input
            value={data.name}
            onChange={(e) => onChange(e, "name")}
            placeholder="Lans The Prodigy"
            type="text"
            className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
          />
          <Label className="mt-2 font-medium">Email</Label>
          <input
            value={data.email}
            onChange={(e) => onChange(e, "email")}
            placeholder="lanstheprodigy@gmail.com"
            type="text"
            className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
          />
          <Label className="mt-2 font-medium">Role</Label>
          <input
            value={data.role}
            onChange={(e) => onChange(e, "role")}
            placeholder="lanstheprodigy@gmail.com"
            type="text"
            className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
            disabled
          />
          <div className="w-full flex flex-col">
            <label className="font-medium text-lg text-black">
              Registered At
            </label>
            <p>{formatDate(data.createdAt, true)}</p>
          </div>
          <div className="w-full flex flex-col">
            <label className="font-medium text-lg text-black">
              Last Updated At
            </label>
            <p>{formatDate(data.updatedAt, true)}</p>
          </div>
        </div>
        <div className="w-full md:w-1/2 lg:w-1/3 bg-white rounded-lg border-neutral-200 border p-8 h-fit flex flex-col gap-4 overflow-hidden">
          <Label className="mt-2 font-medium">Old Password</Label>
          <input
            value={form.oldPass}
            onChange={(e) => onChangePassword(e, "oldPass")}
            placeholder="********"
            type="password"
            className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
          />
          <Label className="mt-2 font-medium">New Password</Label>
          <input
            value={form.newPass}
            onChange={(e) => onChangePassword(e, "newPass")}
            placeholder="********"
            type="password"
            className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
          />
          <Label className="mt-2 font-medium">Confirm Password</Label>
          <input
            value={form.confirmPass}
            onChange={(e) => onChangePassword(e, "confirmPass")}
            placeholder="********"
            type="password"
            className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50"
          />
          <button
            onClick={onSubmitPassword}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all"
          >
            Change Password
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuthPage(ProflePage, [
  "CASHIER",
  "OWNER",
  "MANAGER_OPERATIONAL",
]);

const initUser: User = {
  name: "",
  email: "",
  createdAt: new Date(),
  id: "",
  isDeleted: false,
  password: "",
  role: "CASHIER",
  updatedAt: new Date(),
  image: null,
};

const useProfile = () => {
  const [data, setData] = useState<User>(initUser);
  const [loading, setLoading] = useState<boolean>(false);
  const { updateToken } = useAuth();

  const fetchData = async () => {
    try {
      const response = await api.get<Api<User>>("/profile");
      setData(response.data.data);
    } catch (error) {
      makeToast("error", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: keyof User
  ) => {
    setData((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  const onSubmit = async () => {
    try {
      if (data.name.length <= 0) throw new Error("Name is required");
      if (data.email.length <= 0) throw new Error("Email is required");
      if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        throw new Error("Email is invalid");
      }
      if (loading) return;
      setLoading(true);
      makeToast("info", "Updating...");
      const res = await api.put<Api<DetailUser>>("/profile", data);
      updateToken(res.data.data.accessToken);
      makeToast("success", res.data.message);
      fetchData();
    } catch (error) {
      setLoading(false);
      makeToast("error", error);
    }
  };

  const deleteProfilePicture = async () => {
    try {
      makeToast("info", "Deleting...");
      setData((prev) => ({ ...prev, image: null }));
      const res = await api.patch<Api<DetailUser>>("/profile", { image: null });
      updateToken(res.data.data.accessToken);
      makeToast("success", res.data.message);
      fetchData();
      makeToast("success", "Delete profile picture successfully");
      fetchData();
    } catch (error) {
      makeToast("error", error);
    }
  };

  const onChangeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      makeToast("info");
      const formData = new FormData();
      formData.append("images", file);
      const res = await api.post<Api<{ url: string }>>("/images", formData);
      const res2 = await api.patch("/profile", {
        image: res.data.data.url,
      });
      setData((prev) => ({ ...prev, image: res.data.data.url }));
      updateToken(res2.data.data.accessToken);
      makeToast("success", res2.data.message);
      fetchData();      
    } catch (error) {
      makeToast("error", error);
    }
  };

  return {
    data,
    loading,
    onChange,
    onSubmit,
    deleteProfilePicture,
    onChangeImage,
  };
};

interface PasswordDTO {
  newPass: string;
  oldPass: string;
  confirmPass: string;
}

const initPassword: PasswordDTO = { newPass: "", oldPass: "", confirmPass: "" };

const usePassword = () => {
  const [form, setForm] = useState<PasswordDTO>(initPassword);
  const [loading, setLoading] = useState<boolean>(false);
  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: keyof PasswordDTO
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  const onSubmit = async () => {
    try {
      if (loading) return;
      setLoading(true);
      if (form.oldPass.length <= 0) throw new Error("Old password is required");
      if (form.newPass.length <= 0) throw new Error("New password is required");
      if (form.confirmPass.length <= 0)
        throw new Error("Confirm password is required");
      if (form.newPass !== form.confirmPass)
        throw new Error("New password and confirm password is not match");
      makeToast("info");
      await api.put<Api<DetailUser>>("/auth/password", form);
      makeToast("success", "Update password successfully");
    } catch (error) {
      makeToast("error", error);
    } finally {
      setLoading(false);
      setForm(initPassword);
    }
  };

  return { form, loading, onChange, onSubmit };
};
