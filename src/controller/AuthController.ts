import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyPassword, hashPassword } from "../utils/password.js";
import { createJWT } from "../utils/jwt.js";
import { ControllerRequest } from "../interface/Interface.js";
import { v2 as cloudinary } from "cloudinary";
import { env } from "process";
import { uploadImageCloud } from "../utils/uploadFile.js";
import { UploadedFile } from "express-fileupload";

const prisma = new PrismaClient();

class AuthController {
 
  
}

export default new AuthController();
