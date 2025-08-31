"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.facilityRouter = void 0;
const express_1 = require("express");
const facility_controller_1 = __importDefault(require("../controllers/facility.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const multer_middleware_1 = require("../middlewares/multer.middleware");
const router = (0, express_1.Router)();
router.post("/create", auth_middleware_1.protect, auth_middleware_1.isOrganization, multer_middleware_1.upload.fields([
    { name: "image", maxCount: 5 },
    { name: "medical", maxCount: 5 },
    { name: "amenitiesServices", maxCount: 10 },
    { name: "video", maxCount: 1 },
]), facility_controller_1.default.createFacility);
router.get("/my-facilities", auth_middleware_1.protect, auth_middleware_1.isOrganization, facility_controller_1.default.getMyFacilities);
router.get("/all", facility_controller_1.default.getAllFacilities);
router.get("/locations", facility_controller_1.default.getAllFacilitiesLocations);
router.get("/summary/:facilityId", auth_middleware_1.protect, auth_middleware_1.isOrganization, facility_controller_1.default.facilityDashboardSummary);
router.put("/update/:facilityId", auth_middleware_1.protect, auth_middleware_1.isOrganization, multer_middleware_1.upload.fields([
    { name: "image", maxCount: 5 },
    { name: "medical", maxCount: 5 },
    { name: "amenitiesServices", maxCount: 10 },
    { name: "video", maxCount: 1 },
]), facility_controller_1.default.updateFacility);
router.get("/:facilityId", 
// protect
facility_controller_1.default.getSingleFacility);
router.put("/update-status/:facilityId", 
// protect,
// isOrganization,
facility_controller_1.default.updateFacilityStatus);
exports.facilityRouter = router;
