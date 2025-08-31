"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blog_controller_1 = __importDefault(require("../controllers/blog.controller"));
const multer_middleware_1 = require("../middlewares/multer.middleware");
const router = (0, express_1.Router)();
router.post("/create", multer_middleware_1.upload.single("image"), blog_controller_1.default.createBlog);
router.get("/all", blog_controller_1.default.getAllBlogs);
router.get("/:blogId", blog_controller_1.default.getSingleBlog);
router.put("/update/:blogId", multer_middleware_1.upload.single("image"), blog_controller_1.default.updateBlog);
router.delete("/delete/:blogId", blog_controller_1.default.deleteBlog);
const blogRouter = router;
exports.default = blogRouter;
