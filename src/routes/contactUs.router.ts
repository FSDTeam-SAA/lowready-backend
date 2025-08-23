import { Router } from "express";
import contractUsController from "../controllers/contactUs.controller";

const router = Router();

router.post("/send-message", contractUsController.createContactUs);

const contactUsRouter = router;
export default contactUsRouter;
