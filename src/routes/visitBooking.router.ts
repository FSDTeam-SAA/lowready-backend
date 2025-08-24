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

const visitBookingRouter = router;
export default visitBookingRouter;
