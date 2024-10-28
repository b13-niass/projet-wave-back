import express from "express";
import clientController from "../controller/ClientController.js";
// import { isAuthenticatedGlobal } from "../middleware/auth.js";
//
const router = express.Router();
//

// router.use(isAuthenticatedGlobal); 

// Route to get all fournisseurs
router.get("/fournisseurs", clientController.getFournisseurs);

// Route to handle payment addition
router.post("/paiement", clientController.addPaiement);


export { router };
