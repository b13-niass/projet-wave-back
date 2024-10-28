import express from "express";
import clientController from "../controller/ClientController.js";
import { isAuthenticatedGlobal } from "../middleware/auth.js";
//
const router = express.Router();
//

// router.use(isAuthenticatedGlobal); // Utilisez le middleware pour toutes les routes

//transfert
router.route("/transfert").get(clientController.transfert);
router.route("/contact").post(clientController.addContact);
router.route("/transfert").post(clientController.transfer);




export { router };

