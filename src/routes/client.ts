import express from "express";
import clientController from "../controller/ClientController.js";
import { isClientAuthenticated } from "../middleware/authClient.js";

const router = express.Router();
router.use(isClientAuthenticated); 

router.route("/agences").get(clientController.getAllAgence);
router.route("/plafonds").get(clientController.getUserPlafond);
router.route("/password").put(clientController.changePassword);
router.route("/banque").post(clientController.createBanque);
router.route("/banque").get(clientController.getAllBanques);
router.route("/banque/:id_banque").get(clientController.getBanqueById);
router.get("/fournisseurs", clientController.getFournisseurs);

router.route("/transfert").get(clientController.transfert);
router.route("/contact").post(clientController.addContact);
router.route("/transfert").post(clientController.transfer);

router.post("/paiement", clientController.addPaiement);

router.get("/accueil", clientController.getAccueil);

export { router };

