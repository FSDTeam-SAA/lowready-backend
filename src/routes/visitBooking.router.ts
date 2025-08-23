import { Router } from "express";
import visitBookingController from "../controllers/visitBooking.controller";
import { isUser, protect } from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/create",
  protect,
  isUser,
  visitBookingController.createVisitBooking
);

const visitBookingRouter = router;
export default visitBookingRouter;
