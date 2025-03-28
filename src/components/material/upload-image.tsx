import { api } from "@/config/api";
import { makeToast } from "@/helper/makeToast";
import { Api } from "@/models/response";
import { cn } from "@/utils/cn";
import Image from "next/image";
import React, { useState } from "react";

interface Props {
  className?: string;
  image?: string | null;
  onChangeImage?: (image: string | null) => void;
}

export const UploadImage: React.FC<Props> = ({
  className,
  image,
  onChangeImage,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const onImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        await handleFileUpload(file);
      }
    } catch (error) {
      makeToast("error", error);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("images", file);
    makeToast("info", "Uploading...");
    const res = await api.post<Api<{ url: string }>>("/images", formData);
    onChangeImage?.(res.data.data.url);
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 border border-dashed border-gray-300 rounded-md p-2 cursor-pointer hover:bg-gray-100 h-40 transition-all overflow-hidden",
        className,
        isDragOver ? "bg-gray-200" : ""
      )}
      onClick={() => document.getElementById("image")?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        className="hidden"
        type="file"
        accept="image/*"
        id="image"
        onChange={onImageSelected}
      />
      {image ? (
        <Image
          src={image}
          alt="Uploaded Image"
          className="w-full h-full object-cover rounded-md"
          width={600}
          height={400}
        />
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <p className="text-gray-500">Upload an image / drag here</p>
        </>
      )}
    </div>
  );
};
