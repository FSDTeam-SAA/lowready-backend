import { Router } from "express";
import facilityController from "../controllers/facility.controller";
import { isOrganization, protect } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router.post(
  "/create",
  protect,
  isOrganization,
  upload.fields([
    { name: "image", maxCount: 5 },
    { name: "video", maxCount: 1 },
  ]),
  facilityController.createFacility
);

router.get(
  "/my-facilities",
  protect,
  isOrganization,
  facilityController.getMyFacilities
);

export const facilityRouter = router;
