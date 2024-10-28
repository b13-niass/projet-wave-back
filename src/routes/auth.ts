import express from "express"
import authController from "../controller/AuthController.js";

const router = express.Router();

router.route('/login').post(authController.login);
router.route('/verifytoken').post(authController.verifyCode);

export {router};
