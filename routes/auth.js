import express from "express";
import auth from "../middleware/auth.js"

const router = express.Router();
//import controllers
import {
  register,
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/auth/index.js";

//routes
router.post("/register",register);
router.post("/login",login);
router.post("/forgotpassword",auth,forgotPassword);
router.post("/resetpassword/:resetToken",resetPassword);

export default router;