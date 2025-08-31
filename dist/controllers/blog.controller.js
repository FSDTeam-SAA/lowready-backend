"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../errors/AppError"));
const blog_model_1 = require("../models/blog.model");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const cloudinary_1 = require("../utils/cloudinary");
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const createBlog = (0, catchAsync_1.default)(async (req, res) => {
    try {
        let image = { public_id: "", url: "" };
        if (req.file) {
            const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(req.file.path, "blogs");
            if (uploadResult) {
                image = {
                    public_id: uploadResult.public_id,
                    url: uploadResult.secure_url,
                };
            }
        }
        const result = await blog_model_1.Blog.create({
            title: req.body.title,
            description: req.body.description,
            image,
        });
        return (0, sendResponse_1.default)(res, {
            statusCode: 200,
            success: true,
            message: "Blog created successfully!",
            data: result,
        });
    }
    catch (error) {
        throw new AppError_1.default(500, "Failed to create blog");
    }
});
const getAllBlogs = (0, catchAsync_1.default)(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const totalBlogs = await blog_model_1.Blog.countDocuments();
        const blogs = await blog_model_1.Blog.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        return (0, sendResponse_1.default)(res, {
            statusCode: 200,
            success: true,
            message: "Blogs retrieved successfully!",
            data: blogs,
            meta: {
                total: totalBlogs,
                page,
                limit,
                totalPages: Math.ceil(totalBlogs / limit),
            },
        });
    }
    catch (error) {
        throw new AppError_1.default(500, "Failed to retrieve blogs");
    }
});
const getSingleBlog = (0, catchAsync_1.default)(async (req, res) => {
    try {
        const { blogId } = req.params;
        const blog = await blog_model_1.Blog.findById(blogId);
        if (!blog) {
            throw new AppError_1.default(404, "Blog not found");
        }
        return (0, sendResponse_1.default)(res, {
            statusCode: 200,
            success: true,
            message: "Blog retrieved successfully!",
            data: blog,
        });
    }
    catch (error) {
        throw new AppError_1.default(500, "Failed to retrieve blog");
    }
});
const updateBlog = (0, catchAsync_1.default)(async (req, res) => {
    try {
        const { blogId } = req.params;
        const { title, description } = req.body;
        const blog = await blog_model_1.Blog.findById(blogId);
        if (!blog) {
            throw new AppError_1.default(404, "Blog not found");
        }
        let updateData = {
            title: title ?? blog.title,
            description: description ?? blog.description,
        };
        if (req.file) {
            const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(req.file.path, "blogs");
            if (uploadResult) {
                updateData.image = {
                    public_id: uploadResult.public_id,
                    url: uploadResult.secure_url,
                };
            }
        }
        else {
            updateData.image = blog.image;
        }
        const result = await blog_model_1.Blog.findByIdAndUpdate(blogId, updateData, {
            new: true,
            runValidators: true,
        });
        return (0, sendResponse_1.default)(res, {
            statusCode: 200,
            success: true,
            message: "Blog updated successfully!",
            data: result,
        });
    }
    catch (error) {
        throw new AppError_1.default(500, "Failed to update blog");
    }
});
const deleteBlog = (0, catchAsync_1.default)(async (req, res) => {
    try {
        const { blogId } = req.params;
        const blog = await blog_model_1.Blog.findById(blogId);
        if (!blog) {
            throw new AppError_1.default(404, "Blog not found");
        }
        await blog_model_1.Blog.findByIdAndDelete(blogId);
        return (0, sendResponse_1.default)(res, {
            statusCode: 200,
            success: true,
            message: "Blog deleted successfully!",
        });
    }
    catch (error) {
        throw new AppError_1.default(500, "Failed to delete blog");
    }
});
const blogController = {
    createBlog,
    getAllBlogs,
    getSingleBlog,
    updateBlog,
    deleteBlog,
};
exports.default = blogController;
