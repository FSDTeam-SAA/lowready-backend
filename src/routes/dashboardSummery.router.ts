import { Router } from "express";
import dashboardSummeryController from "../controllers/dashboardSummery";


const router = Router();

router.get("/admin-dashboard", dashboardSummeryController.getAdminDashboardSummery)



const dashboardSummeryRouter = router;
export default dashboardSummeryRouter;