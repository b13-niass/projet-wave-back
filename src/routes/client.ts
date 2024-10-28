import express from "express";
import clientController from "../controller/ClientController.js";
import { isAuthenticatedGlobal } from "../middleware/auth.js";
//
const router = express.Router();
//

// router.use(isAuthenticatedGlobal); // Utilisez le middleware pour toutes les routes
// router pour creer une une banque

router.route("/banque").post(clientController.createBanque);

// route pour recuperer tous les banques
router.route("/banque").get(clientController.getAllBanques);

// route pour recuperer une banque 
router.route("/banque/:id_banque").get(clientController.getBanqueById);


export { router };
