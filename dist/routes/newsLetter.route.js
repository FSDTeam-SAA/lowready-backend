"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const newsLetter_controller_1 = require("../controllers/newsLetter.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware"); // Assume this checks role
const router = express_1.default.Router();
router.post('/subscribe', newsLetter_controller_1.subscribeNewsletter);
router.post('/broadcast', auth_middleware_1.protect, auth_middleware_1.isAdmin, newsLetter_controller_1.broadcastNewsletter);
exports.default = router;
