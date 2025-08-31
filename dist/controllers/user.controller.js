"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrganizations = exports.getSingleUser = exports.getAllNormalUsers = exports.refreshToken = exports.updateUser = exports.changePassword = exports.resetPassword = exports.VerifyToken = exports.forgetPassword = exports.verifyEmail = exports.login = exports.register = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const generateOTP_1 = require("../utils/generateOTP");
const authToken_1 = require("../utils/authToken");
const sendEmail_1 = require("../utils/sendEmail");
const user_model_1 = require("../models/user.model");
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const cloudinary_1 = require("../utils/cloudinary");
exports.register = (0, catchAsync_1.default)(async (req, res) => {
    const { firstName, lastName, email, password, street, postCode, phoneNum, role, gender, dateOfBirth, bio, avatars, } = req.body;
    if (!firstName || !lastName || !email || !password) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Please fill in all required fields');
    }
    if (role === 'admin') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not allowed to register as admin');
    }
    const userExists = await user_model_1.User.isUserExistsByEmail(email);
    if (userExists) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User already exists');
    }
    // Generate OTP
    const otp = (0, generateOTP_1.generateOTP)();
    const jwtPayloadOTP = { otp };
    const otptoken = (0, authToken_1.createToken)(jwtPayloadOTP, process.env.OTP_SECRET, process.env.OTP_EXPIRE);
    // Create user
    const user = await user_model_1.User.create({
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
        bio: bio || '',
        avatars: avatars || '',
        verificationInfo: { token: otptoken },
    });
    // Send OTP email
    await (0, sendEmail_1.sendEmail)(user.email, 'Registered Account', `Your OTP is ${otp}`);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User registered successfully. Please verify OTP sent to email.',
        data: { email: user.email },
    });
});
exports.login = (0, catchAsync_1.default)(async (req, res) => {
    const { email, password } = req.body;
    const user = await user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    // Check password
    if (!(await user_model_1.User.isPasswordMatched(password, user.password))) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Password is incorrect');
    }
    // Check OTP verification
    if (!(await user_model_1.User.isOTPVerified(user._id.toString()))) {
        const otp = (0, generateOTP_1.generateOTP)();
        const jwtPayloadOTP = { otp };
        const otptoken = (0, authToken_1.createToken)(jwtPayloadOTP, process.env.OTP_SECRET, process.env.OTP_EXPIRE);
        user.verificationInfo.token = otptoken;
        await user.save();
        await (0, sendEmail_1.sendEmail)(user.email, 'Verify your Account', `Your OTP is ${otp}`);
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.FORBIDDEN,
            success: false,
            message: 'OTP is not verified. Please verify your OTP.',
            data: { email: user.email },
        });
    }
    // Generate access and refresh tokens
    const jwtPayload = {
        _id: user._id,
        email: user.email,
        role: user.role,
    };
    const accessToken = (0, authToken_1.createToken)(jwtPayload, process.env.JWT_ACCESS_SECRET, process.env.JWT_ACCESS_EXPIRES_IN);
    const refreshToken = (0, authToken_1.createToken)(jwtPayload, process.env.JWT_REFRESH_SECRET, process.env.JWT_REFRESH_EXPIRES_IN);
    user.refresh_token = refreshToken;
    await user.save();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User logged in successfully',
        data: {
            accessToken,
            refreshToken,
            role: user.role,
            _id: user._id,
            email: user.email,
        },
    });
});
exports.verifyEmail = (0, catchAsync_1.default)(async (req, res) => {
    const { email, otp } = req.body;
    const user = await user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (user.verificationInfo.verified) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User already verified');
    }
    if (otp) {
        const savedOTP = (0, authToken_1.verifyToken)(user.verificationInfo.token, process.env.OTP_SECRET || '');
        console.log(savedOTP);
        if (otp === savedOTP.otp) {
            user.verificationInfo.verified = true;
            user.verificationInfo.token = '';
            await user.save();
            (0, sendResponse_1.default)(res, {
                statusCode: http_status_1.default.OK,
                success: true,
                message: 'User verified',
                data: '',
            });
        }
        else {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid OTP');
        }
    }
    else {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'OTP is required');
    }
});
exports.forgetPassword = (0, catchAsync_1.default)(async (req, res) => {
    const { email } = req.body;
    const user = await user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const otp = (0, generateOTP_1.generateOTP)();
    const jwtPayloadOTP = {
        otp: otp,
    };
    const otptoken = (0, authToken_1.createToken)(jwtPayloadOTP, process.env.OTP_SECRET, process.env.OTP_EXPIRE);
    user.password_reset_token = otptoken;
    await user.save();
    /////// TODO: SENT EMAIL MUST BE DONE
    (0, sendEmail_1.sendEmail)(user.email, 'Reset Password', `Your OTP is ${otp}`);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'OTP sent to your email',
        data: '',
    });
});
// Verify OTP
exports.VerifyToken = (0, catchAsync_1.default)(async (req, res) => {
    const { email, otp } = req.body;
    const user = await user_model_1.User.findOne({
        email: email,
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const verify = (await (0, authToken_1.verifyToken)(user.password_reset_token, process.env.OTP_SECRET));
    // console.log(2, verify)
    if (verify.otp !== otp) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid OTP');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'OTP verified',
        data: user.password_reset_token,
    });
});
// reset password
exports.resetPassword = (0, catchAsync_1.default)(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    const user = await user_model_1.User.findOne({
        password_reset_token: token,
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    // const verify = (await verifyToken(
    //   user.password_reset_token,
    //   process.env.OTP_SECRET!
    // )) as JwtPayload
    // if (verify.otp !== otp) {
    //   throw new AppError(httpStatus.BAD_REQUEST, 'Invalid OTP')
    // }
    user.password = password;
    user.password_reset_token = '';
    await user.save();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Password reset successfully',
        data: {},
    });
});
exports.changePassword = (0, catchAsync_1.default)(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Old password and new password are required');
    }
    if (oldPassword === newPassword) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Old password and new password cannot be same');
    }
    const user = await user_model_1.User.findById({ _id: req.user?._id });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    user.password = newPassword;
    await user.save();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Password changed',
        data: '',
    });
});
exports.updateUser = (0, catchAsync_1.default)(async (req, res) => {
    const id = req.user?._id;
    const updateData = req.body;
    if (!id)
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User ID is required');
    const allowedFields = [
        'firstName',
        'lastName',
        'street',
        'postCode',
        'phoneNum',
        'bio',
    ];
    const filteredData = {};
    // filter only allowed fields
    for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
            filteredData[field] = updateData[field];
        }
    }
    // Handle avatar upload
    if (req.file) {
        const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(req.file.path, 'avatars');
        // Remove old avatar from Cloudinary if exists
        const existingUser = await user_model_1.User.findById(id).select('avatar');
        if (existingUser?.avatar?.public_id) {
            await (0, cloudinary_1.deleteFromCloudinary)(existingUser.avatar.public_id);
        }
        filteredData.avatar = {
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
        };
    }
    const updatedUser = await user_model_1.User.findByIdAndUpdate(id, filteredData, {
        new: true,
        runValidators: true,
    }).select('-password -verificationInfo -password_reset_token');
    if (!updatedUser) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found or not updated');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User updated successfully',
        data: updatedUser,
    });
});
exports.refreshToken = (0, catchAsync_1.default)(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw new AppError_1.default(400, 'Refresh token is required');
    }
    const decoded = (0, authToken_1.verifyToken)(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await user_model_1.User.findById(decoded._id);
    if (!user) {
        throw new AppError_1.default(401, 'Invalid refresh token');
    }
    const jwtPayload = {
        _id: user._id,
        email: user.email,
        role: user.role,
    };
    const accessToken = (0, authToken_1.createToken)(jwtPayload, process.env.JWT_ACCESS_SECRET, process.env.JWT_ACCESS_EXPIRES_IN);
    const refreshToken1 = (0, authToken_1.createToken)(jwtPayload, process.env.JWT_REFRESH_SECRET, process.env.JWT_REFRESH_EXPIRES_IN);
    user.refresh_token = refreshToken1;
    await user.save();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Token refreshed successfully',
        data: { accessToken: accessToken, refreshToken: refreshToken1 },
    });
});
exports.getAllNormalUsers = (0, catchAsync_1.default)(async (req, res) => {
    const { page = 1, limit = 10, search } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    const query = { role: 'user' };
    if (search) {
        query.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }
    const users = await user_model_1.User.find(query)
        .select('-password -refresh_token -password_reset_token')
        .skip(skip)
        .limit(limitNum);
    const total = await user_model_1.User.countDocuments(query);
    res.status(200).json({
        success: true,
        message: 'All users with role=user fetched successfully',
        data: users,
        meta: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        },
    });
});
exports.getSingleUser = (0, catchAsync_1.default)(async (req, res) => {
    const { userId } = req.params;
    const isExist = await user_model_1.User.findById(userId);
    if (!isExist)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    const user = await user_model_1.User.findById(userId).select('-password -refresh_token -password_reset_token');
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User fetched successfully',
        data: user,
    });
});
exports.getAllOrganizations = (0, catchAsync_1.default)(async (req, res) => {
    const { page = 1, limit = 10, search } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    // Base query → only organizations
    const query = { role: 'organization' };
    // If search query is passed → filter by firstName, lastName, or email
    if (search) {
        query.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }
    const organizations = await user_model_1.User.find(query)
        .select('-password -refresh_token -password_reset_token')
        .skip(skip)
        .limit(limitNum);
    const total = await user_model_1.User.countDocuments(query);
    res.status(200).json({
        success: true,
        message: 'All organizations fetched successfully',
        data: organizations,
        meta: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        },
    });
});
