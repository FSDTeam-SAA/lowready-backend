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
    { name: "medical", maxCount: 5 },
    { name: "amenitiesServices", maxCount: 10 },
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

router.get("/all", facilityController.getAllFacilities);
router.get("/locations", facilityController.getAllFacilitiesLocations);
router.get("/summary/:facilityId", protect,
  isOrganization, facilityController.facilityDashboardSummary);

router.put(
  "/update/:facilityId",
  protect,
  isOrganization,
  upload.fields([
    { name: "image", maxCount: 5 },
    { name: "medical", maxCount: 5 },
    { name: "amenitiesServices", maxCount: 10 },
    { name: "video", maxCount: 1 },
  ]),
  facilityController.updateFacility
);

router.get(
  "/:facilityId",
  // protect
  facilityController.getSingleFacility
);

export const facilityRouter = router;
