import express from "express";
import clientController from "../controller/ClientController.js";
import { isClientAuthenticated } from "../middleware/authClient.js";

const router = express.Router();

 router.use(isClientAuthenticated); 

router.get("/fournisseurs", clientController.getFournisseurs);

router.post("/paiement", clientController.addPaiement);


router.get("/accueil", clientController.getAccueil);

export { router };
