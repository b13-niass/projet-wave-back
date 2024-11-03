import express from "express";
import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import fileUpload from "express-fileupload";
import { router as authRoutes } from "./routes/auth.js";
import { router as clientRoutes } from "./routes/client.js";
import { router as AdminRoutes } from "./routes/admin.js";
import swaggerUi from "swagger-ui-express";
import yamljs from "yamljs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";

const app = express();

const FRONT_URL = process.env.FRONT_URL;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Content-Type",
    "Origin",
    "Cache-Control",
    "X-File-Name",
  ],
  credentials: true,
};

const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(__filename);

const BASE_API = process.env.PREFIX_URI;

const swaggerDocument = yamljs.load(path.join(_dirname, "..", "swagger.yaml"));

const PORT = process.env.PORT || 8140;

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));

app.use(
  "/api-docs-tailleur",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(`${BASE_API}`, authRoutes);
app.use(`${BASE_API}/client`, clientRoutes);
app.use(`${BASE_API}/admin`, AdminRoutes);

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
