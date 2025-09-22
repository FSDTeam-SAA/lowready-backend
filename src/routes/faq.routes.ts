import { Router } from "express";
import { createFaq } from "../controllers/faq.controller";
import { isAdmin, protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", protect, isAdmin, createFaq);

const faqRouter = router;

export default faqRouter;
