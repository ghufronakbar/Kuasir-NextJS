import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import cloudinary from "@/config/cloudinary";
import fs from "fs";
import { UploadApiResponse } from "cloudinary";
import { CLOUDINARY_FOLDER } from "@/constants/cloudinary";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Formidable Error:", err);
      return res.status(500).json({
        message: "Something went wrong while uploading the image",
      });
    }

    const { images } = files;
    if (!images) {
      return res.status(400).json({
        message: "Image is required",
      });
    }

    const uploadToCloudinary = (): Promise<UploadApiResponse> => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: CLOUDINARY_FOLDER },
          (error, result) => {
            if (error) {
              console.error("Cloudinary Error:", error);
              reject(error);
            } else {
              if (result) {
                resolve(result);
              }
            }
          }
        );

        const stream = fs.createReadStream(images[0].filepath);
        stream.pipe(uploadStream);
      });
    };

    try {
      const uploadResult = await uploadToCloudinary();

      return res.status(200).json({
        message: "Success to upload image",
        data: {
          url: uploadResult.secure_url,
        },
      });
    } catch (error) {
      console.error("Upload Error:", error);
      return res.status(500).json({
        message: "Something went wrong while uploading the image",
      });
    }
  });
}

export default handler;
