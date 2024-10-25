import path from "path";
import { StatusCodes } from "http-status-codes";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { UploadedFile } from "express-fileupload";
import { fileURLToPath } from "url";

const uploadImageLocal = async (
  image: UploadedFile,
  folder: string
): Promise<string> => {
  if (!image) {
    throw new Error("No image uploaded.");
  }
  if (!image.mimetype.startsWith("image")) {
    throw new Error("Please Upload Image");
  }
  const maxSize = 1024 * 1024;
  if (image.size > maxSize) {
    throw new Error("Please upload image smaller 1MB");
  }
  const ext = path.extname(image.name);

  if (![".jpg", ".jpeg", ".png", ".mp4"].includes(ext)) {
    throw new Error(
      "Please upload image with.jpg,.jpeg,.png or mp4 extensions"
    );
  }
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  console.log(__filename);

  const newFilename = `${Date.now()}-${Math.floor(
    Math.random() * 1000000
  )}${ext}`;

  const imagePath = path.join(
    __dirname,
    `../public/uploads/${folder}/${newFilename}`
  );

  await image.mv(imagePath);
  return `/uploads/${image.name}`;
};

const uploadImageCloud = async (file: UploadedFile, folder: string) => {
  if (!file) {
    throw new Error("No file uploaded.");
  }

  const ext = path.extname(file.name).toLowerCase();

  if (![".jpg", ".jpeg", ".png", ".mp4"].includes(ext)) {
    throw new Error(
      "Please upload a file with .jpg, .jpeg, .png, or .mp4 extensions"
    );
  }

  const resourceType = [".mp4"].includes(ext) ? "video" : "image";

  const uploadOptions = {
    use_filename: true,
    folder: folder,
    resource_type: resourceType as "image" | "video",
  };

  const result = await cloudinary.uploader.upload(
    file.tempFilePath,
    uploadOptions
  );

  fs.unlinkSync(file.tempFilePath);

  return result.secure_url;
};

export { uploadImageLocal, uploadImageCloud };
