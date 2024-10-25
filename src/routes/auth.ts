import express from "express"
import authController from "../controller/AuthController.js";

const router = express.Router();

/* router.route('/register').post(authController.register);
router.route('/login').post(authController.login);
router.route('/logout').get(authController.logout);
router.route('/uploadProfile').post(authController.uploadProfile); */


export {router};
