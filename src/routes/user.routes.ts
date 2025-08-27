import express from "express";
import {
  register,
  verifyEmail,
  login,
  forgetPassword,
  resetPassword,
  changePassword,
  updateUser,
  refreshToken,
  getAllNormalUsers,
  VerifyToken,
  getSingleUser,
} from "../controllers/user.controller";
import { isAdmin, protect } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify", verifyEmail);
router.post("/otp/verify", VerifyToken);
router.post("/forget", forgetPassword),
  router.post("/reset-password/:token", resetPassword);
router.post("/change-password", protect, changePassword);

router.patch("/update", protect, upload.single("photo"), updateUser);
router.post("/refresh-token", refreshToken);

router.get("/customers", protect, isAdmin, getAllNormalUsers);
router.get("/:userId", getSingleUser);

export default router;
