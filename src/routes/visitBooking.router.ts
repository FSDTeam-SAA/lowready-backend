import { Router } from "express";
import visitBookingController from "../controllers/visitBooking.controller";
import {
  isOrganization,
  isUser,
  protect,
} from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/create",
  protect,
  isUser,
  visitBookingController.createVisitBooking
);

router.get(
  "/my-bookings",
  protect,
  isUser,
  visitBookingController.getMyVisitBookings
);

router.get(
  "/facility-bookings",
  protect,
  isOrganization,
  visitBookingController.getMyFacilityBookings
);

router.put(
  "/status/:bookingId",
  protect,
  isOrganization,
  visitBookingController.updateVisitBookingStatus
);

router.put(
  "/feedback/:bookingId",
  protect,
  isUser,
  visitBookingController.addFeedback
);

const visitBookingRouter = router;
export default visitBookingRouter;
