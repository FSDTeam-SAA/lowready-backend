import { Router } from "express";
import {
  createFaq,
  deleteFaq,
  editFaq,
  getAllFaqs,
} from "../controllers/faq.controller";
import { isAdmin, protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", protect, isAdmin, createFaq);
router.put("/:faqId", protect, isAdmin, editFaq);
router.delete("/:faqId", protect, isAdmin, deleteFaq);
router.get("/all", getAllFaqs);

const faqRouter = router;

export default faqRouter;
