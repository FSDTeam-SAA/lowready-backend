import AppError from "../errors/AppError";
import { Blog } from "../models/blog.model";
import catchAsync from "../utils/catchAsync";
import { uploadToCloudinary } from "../utils/cloudinary";
import sendResponse from "../utils/sendResponse";

const createBlog = catchAsync(async (req, res) => {
  try {
    let image = { public_id: "", url: "" };
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.path, "blogs");

      if (uploadResult) {
        image = {
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
        };
      }
    }

    const result = await Blog.create({
      title: req.body.title,
      description: req.body.description,
      image,
    });

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Blog created successfully!",
      data: result,
    });
  } catch (error) {
    throw new AppError(500, "Failed to create blog");
  }
});

const getAllBlogs = catchAsync(async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const totalBlogs = await Blog.countDocuments();

    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendResponse(res, {
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
  } catch (error) {
    throw new AppError(500, "Failed to retrieve blogs");
  }
});

const getSingleBlog = catchAsync(async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new AppError(404, "Blog not found");
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Blog retrieved successfully!",
      data: blog,
    });
  } catch (error) {
    throw new AppError(500, "Failed to retrieve blog");
  }
});

const updateBlog = catchAsync(async (req, res) => {
  try {
    const { blogId } = req.params;
    const { title, description } = req.body;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new AppError(404, "Blog not found");
    }

    let updateData: any = {
      title: title ?? blog.title,
      description: description ?? blog.description,
    };

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.path, "blogs");
      if (uploadResult) {
        updateData.image = {
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
        };
      }
    } else {
      updateData.image = blog.image;
    }

    const result = await Blog.findByIdAndUpdate(blogId, updateData, {
      new: true,
      runValidators: true,
    });

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Blog updated successfully!",
      data: result,
    });
  } catch (error) {
    throw new AppError(500, "Failed to update blog");
  }
});

const deleteBlog = catchAsync(async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new AppError(404, "Blog not found");
    }
    await Blog.findByIdAndDelete(blogId);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Blog deleted successfully!",
    });
  } catch (error) {
    throw new AppError(500, "Failed to delete blog");
  }
});

const blogController = {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog,
};
export default blogController;
