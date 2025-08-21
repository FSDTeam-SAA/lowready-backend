import { Router } from "express";
import { facilityRouter } from "./facility.router";

const router = Router();

const moduleRoutes = [
  {
    path: "/facility",
    route: facilityRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
