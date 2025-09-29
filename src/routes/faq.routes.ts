import { Router } from "express";
import {
  createFaq,
  deleteFaq,
  editFaq,
  getAllFaqs,
  updateFaqFaqPage,
  updateFaqHomePage,
} from "../controllers/faq.controller";
import { isAdmin, protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", protect, isAdmin, createFaq);
router.put("/:faqId", protect, isAdmin, editFaq);
router.delete("/:faqId", protect, isAdmin, deleteFaq);
router.get("/all", getAllFaqs);
router.put("/update-home/:faqId", protect, isAdmin, updateFaqHomePage);
router.put("/update-faq/:faqId", protect, isAdmin, updateFaqFaqPage);

const faqRouter = router;

export default faqRouter;
