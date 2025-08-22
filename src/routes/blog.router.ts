import { Router } from "express";
import blogController from "../controllers/blog.controller";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router.post("/create", upload.single("image"), blogController.createBlog);
router.get("/all", blogController.getAllBlogs);

router.get("/:blogId", blogController.getSingleBlog);

const blogRouter = router;
export default blogRouter;
