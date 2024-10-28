import express from "express";
import clientController from "../controller/ClientController.js";
import { isAuthenticatedGlobal } from "../middleware/auth.js";

const router = express.Router();

// router.use(isAuthenticatedGlobal);


router.route("/agences").get(clientController.getAllAgence);

router.route("/plafonds").get(clientController.getUserPlafond);

router.route("/password").put(clientController.changePassword);

export { router };
