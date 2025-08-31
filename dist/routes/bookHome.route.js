"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookHome_controller_1 = require("../controllers/bookHome.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.post('/', auth_middleware_1.protect, bookHome_controller_1.createBooking);
router.get('/', auth_middleware_1.protect, auth_middleware_1.isAdmin, bookHome_controller_1.getAllBookings);
router.get('/facility/:facilityId', auth_middleware_1.protect, bookHome_controller_1.getBookingsByFacility);
router.get('/user/:userId', auth_middleware_1.protect, bookHome_controller_1.getBookingsByUser);
router.get('/:id', auth_middleware_1.protect, bookHome_controller_1.getBooking);
router.patch('/:id', auth_middleware_1.protect, bookHome_controller_1.editBooking);
exports.default = router;
