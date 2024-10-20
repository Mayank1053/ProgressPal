import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserDetails,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/user.controller.js";
import { verifyJwtToken } from "../middlewares/auth.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/email/verify/:code").get(verifyEmail);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset").post(resetPassword);

router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);
// Secured routes
router.route("/logout").post(verifyJwtToken, logoutUser);
router.route("/change-password").post(verifyJwtToken, changeCurrentPassword);
router.route("/").get(verifyJwtToken, getCurrentUser);
router.route("/update-details").patch(verifyJwtToken, updateUserDetails);

export default router;
