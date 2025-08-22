import { Router } from "express";
import blogController from "../controllers/blog.controller";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router.post("/create", upload.single("image"), blogController.createBlog);
router.get("/all", blogController.getAllBlogs);

router.get("/:blogId", blogController.getSingleBlog);
router.put(
  "/update/:blogId",
  upload.single("image"),
  blogController.updateBlog
);

router.delete("/delete/:blogId", blogController.deleteBlog);

const blogRouter = router;
export default blogRouter;
