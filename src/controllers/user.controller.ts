
import catchAsync from "../utils/catchAsync";
import AppError from "../errors/AppError";
import httpStatus from "http-status";
import { generateOTP } from "../utils/generateOTP";
import { createToken, verifyToken } from "../utils/authToken";
import { sendEmail } from "../utils/sendEmail";
import { User } from "../models/user.model";
import sendResponse from "../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { Request, Response } from "express";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary";

export const register = catchAsync(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    street,
    postCode,
    phoneNum,
    role,
    gender,
    dateOfBirth,
    bio,
    avatars,
  } = req.body;

  if (!firstName || !lastName || !email || !password) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Please fill in all required fields"
    );
  }

  if (role === "admin") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to register as admin"
    );
  }

  const userExists = await User.isUserExistsByEmail(email);
  if (userExists) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
  }

  // Generate OTP
  const otp = generateOTP();
  const jwtPayloadOTP = { otp };
  const otptoken = createToken(
    jwtPayloadOTP,
    process.env.OTP_SECRET as string,
    process.env.OTP_EXPIRE
  );

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phoneNum,
    role,
    gender,
    dateOfBirth,
    street,
    postCode,
    bio: bio || "",
    avatars: avatars || "",
    verificationInfo: { token: otptoken },
  });

  // Send OTP email
  await sendEmail(user.email, "Registered Account", `Your OTP is ${otp}`);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User registered successfully. Please verify OTP sent to email.",
    data: { email: user.email },
  });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.isUserExistsByEmail(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Check password
  if (!(await User.isPasswordMatched(password, user.password as string))) {
    throw new AppError(httpStatus.FORBIDDEN, "Password is incorrect");
  }

  // Check OTP verification
  if (!(await User.isOTPVerified(user._id.toString()))) {
    const otp = generateOTP();
    const jwtPayloadOTP = { otp };
    const otptoken = createToken(
      jwtPayloadOTP,
      process.env.OTP_SECRET as string,
      process.env.OTP_EXPIRE
    );
    user.verificationInfo.token = otptoken;
    await user.save();

    await sendEmail(user.email, "Verify your Account", `Your OTP is ${otp}`);

    return sendResponse(res, {
      statusCode: httpStatus.FORBIDDEN,
      success: false,
      message: "OTP is not verified. Please verify your OTP.",
      data: { email: user.email },
    });
  }

  // Generate access and refresh tokens
  const jwtPayload = {
    _id: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    process.env.JWT_ACCESS_SECRET as string,
    process.env.JWT_ACCESS_EXPIRES_IN as string
  );

  const refreshToken = createToken(
    jwtPayload,
    process.env.JWT_REFRESH_SECRET as string,
    process.env.JWT_REFRESH_EXPIRES_IN as string
  );

  user.refresh_token = refreshToken;
  await user.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: {
      accessToken,
      refreshToken,
      role: user.role,
      _id: user._id,
      email: user.email,
    },
  });
});

export const verifyEmail = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.isUserExistsByEmail(email);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  if (user.verificationInfo.verified) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already verified");
  }
  if (otp) {
    const savedOTP = verifyToken(
      user.verificationInfo.token,
      process.env.OTP_SECRET || ""
    ) as JwtPayload;
    console.log(savedOTP);
    if (otp === savedOTP.otp) {
      user.verificationInfo.verified = true;
      user.verificationInfo.token = "";
      await user.save();

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User verified",
        data: "",
      });
    } else {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP");
    }
  } else {
    throw new AppError(httpStatus.BAD_REQUEST, "OTP is required");
  }
});

export const forgetPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await User.isUserExistsByEmail(email);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  const otp = generateOTP();
  const jwtPayloadOTP = {
    otp: otp,
  };

  const otptoken = createToken(
    jwtPayloadOTP,
    process.env.OTP_SECRET as string,
    process.env.OTP_EXPIRE as string
  );
  user.password_reset_token = otptoken;
  await user.save();

  /////// TODO: SENT EMAIL MUST BE DONE
  sendEmail(user.email, "Reset Password", `Your OTP is ${otp}`);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP sent to your email",
    data: "",
  });
});

// Verify OTP
export const VerifyToken = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({
    email: email,
  });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  const verify = (await verifyToken(
    user.password_reset_token,
    process.env.OTP_SECRET!
  )) as JwtPayload;

  // console.log(2, verify)
  if (verify.otp !== otp) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP verified",
    data: user.password_reset_token,
  });
});

// reset password
export const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const user = await User.findOne({
    password_reset_token: token,
  });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // const verify = (await verifyToken(
  //   user.password_reset_token,
  //   process.env.OTP_SECRET!
  // )) as JwtPayload

  // if (verify.otp !== otp) {
  //   throw new AppError(httpStatus.BAD_REQUEST, 'Invalid OTP')
  // }

  user.password = password;
  user.password_reset_token = "";
  await user.save();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successfully",
    data: {},
  });
});

export const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Old password and new password are required"
    );
  }
  if (oldPassword === newPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Old password and new password cannot be same"
    );
  }
  const user = await User.findById({ _id: req.user?._id });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  user.password = newPassword;
  await user.save();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password changed",
    data: "",
  });
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.user?._id;
  const updateData = req.body;

  if (!id) throw new AppError(httpStatus.BAD_REQUEST, "User ID is required");

  const allowedFields = [
    "firstName",
    "lastName",
    "street",
    "postCode",
    "phoneNum",
    "bio",
  ];
  const filteredData: Partial<Record<string, any>> = {};

  // filter only allowed fields
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  }

  // Handle avatar upload
  if (req.file) {
    const uploadResult = await uploadToCloudinary(req.file.path, "avatars");

    // Remove old avatar from Cloudinary if exists
    const existingUser = await User.findById(id).select("avatar");
    if (existingUser?.avatar?.public_id) {
      await deleteFromCloudinary(existingUser.avatar.public_id);
    }

    filteredData.avatar = {
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    };
  }

  const updatedUser = await User.findByIdAndUpdate(id, filteredData, {
    new: true,
    runValidators: true,
  }).select("-password -verificationInfo -password_reset_token");

  if (!updatedUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found or not updated");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully",
    data: updatedUser,
  });
});

export const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError(400, "Refresh token is required");
  }

  const decoded = verifyToken(
    refreshToken,
    process.env.JWT_REFRESH_SECRET as string
  ) as JwtPayload;
  const user = await User.findById(decoded._id);
  if (!user) {
    throw new AppError(401, "Invalid refresh token");
  }
  const jwtPayload = {
    _id: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    process.env.JWT_ACCESS_SECRET as string,
    process.env.JWT_ACCESS_EXPIRES_IN as string
  );

  const refreshToken1 = createToken(
    jwtPayload,
    process.env.JWT_REFRESH_SECRET as string,
    process.env.JWT_REFRESH_EXPIRES_IN as string
  );
  user.refresh_token = refreshToken1;
  await user.save();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Token refreshed successfully",
    data: { accessToken: accessToken, refreshToken: refreshToken1 },
  });
});

export const getAllNormalUsers = catchAsync(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 10, search } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const query: any = { role: "user" };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password -refresh_token -password_reset_token")
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "All users with role=user fetched successfully",
      data: users,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  }
);

export const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const isExist = await User.findById(userId);
  if (!isExist) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  const user = await User.findById(userId).select(
    "-password -refresh_token -password_reset_token"
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User fetched successfully",
    data: user,
  });
});
