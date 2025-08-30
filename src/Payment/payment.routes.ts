import { Router } from 'express';


import { protect } from '../middlewares/auth.middleware';
import { createPayment } from './payment.controller';

const router = Router();

router.post('/pay', protect, createPayment);

const payment = router
export default payment;
