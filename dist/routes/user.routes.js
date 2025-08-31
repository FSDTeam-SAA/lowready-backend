"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const multer_middleware_1 = require("../middlewares/multer.middleware");
const router = express_1.default.Router();
router.post('/register', user_controller_1.register);
router.post('/login', user_controller_1.login);
router.post('/verify', user_controller_1.verifyEmail);
router.post('/otp/verify', user_controller_1.VerifyToken);
router.post('/forget', user_controller_1.forgetPassword),
    router.post('/reset-password/:token', user_controller_1.resetPassword);
router.post('/change-password', auth_middleware_1.protect, user_controller_1.changePassword);
router.patch('/update', auth_middleware_1.protect, multer_middleware_1.upload.single('photo'), user_controller_1.updateUser);
router.post('/refresh-token', user_controller_1.refreshToken);
router.get('/customers', auth_middleware_1.protect, auth_middleware_1.isAdmin, user_controller_1.getAllNormalUsers);
router.get('/organizations', auth_middleware_1.protect, auth_middleware_1.isAdmin, user_controller_1.getAllOrganizations);
router.get('/:userId', user_controller_1.getSingleUser);
exports.default = router;
