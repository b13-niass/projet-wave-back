import express from "express";
import clientController from "../controller/ClientController.js";
import { isClientAuthenticated } from "../middleware/authClient.js";

const router = express.Router();
router.use(isClientAuthenticated); 

router.route("/banque").post(clientController.createBanque);

// route pour recuperer tous les banques
router.route("/banque").get(clientController.getAllBanques);

// route pour recuperer une banque 
router.route("/banque/:id_banque").get(clientController.getBanqueById);


router.get("/fournisseurs", clientController.getFournisseurs);

router.post("/paiement", clientController.addPaiement);

router.get("/accueil", clientController.getAccueil);

export { router };
