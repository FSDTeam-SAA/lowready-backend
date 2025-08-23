import { Router } from "express";
import { facilityRouter } from "./facility.router";
import userRouters from "./user.routes";
import reviewRatingRouter from "./reviewRating.routes";
import blogRouter from "./blog.router";
import contactUsRouter from "./contactUs.router";
import visitBookingRouter from "./visitBooking.router";

const router = Router();

const moduleRoutes = [
  {
    path: "/facility",
    route: facilityRouter,
  },
  {
    path: "/user",
    route: userRouters,
  },
  {
    path: "/review-rating",
    route: reviewRatingRouter,
  },
  {
    path: "/blog",
    route: blogRouter,
  },
  {
    path: "/contactUs",
    route: contactUsRouter,
  },
  {
    path: "/visit-booking",
    route: visitBookingRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
