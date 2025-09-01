import { Router } from "express";
import visitBookingController from "../controllers/visitBooking.controller";
import {
  isAdmin,
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


router.get(
  "/recent-bookings",
  // protect,
  // isAdmin,
  visitBookingController.getAllRecentBookings
)

router.put(
  "/status/:bookingId",
  protect,
  isOrganization,
  visitBookingController.updateVisitBookingStatus
);

router.put(
  "/status-cancel/:bookingId",
  protect,
  isOrganization,
  visitBookingController.updateCancelVisitBookingStatus
);

router.put(
  "/feedback/:bookingId",
  protect,
  isUser,
  visitBookingController.addFeedback
);

router.put(
  "/reschedule/:bookingId",
  protect,
  isUser,
  visitBookingController.rescheduleVisitBooking
);

router.delete(
  "/:bookingId",
  protect,
  isUser,
  visitBookingController.deleteVisitBooking
);

router.get("/:userId", visitBookingController.getSingleUserVisitBooking);

const visitBookingRouter = router;
export default visitBookingRouter;
