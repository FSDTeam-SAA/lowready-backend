import { Router } from 'express';


import { isAdmin, protect } from '../middlewares/auth.middleware';
import { createPayment } from './payment.controller';
import { getAllPayments, getAllUserPayments } from '../Dashboard/dashboard.controller';

const router = Router();

router.post('/pay', protect, createPayment);
router.get("/user/all", protect, getAllUserPayments);
router.get("/all", protect, getAllPayments);

const payment = router
export default payment;
