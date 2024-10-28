import express from "express";
import clientController from "../controller/ClientController.js";
import { isClientAuthenticated } from "../middleware/authClient.js";

const router = express.Router();

router.use(isClientAuthenticated); // Utilisation du middleware pour toutes les routes protégées

router.get("/accueil", clientController.getAccueil);

export { router };
