
import express from 'express';


import { protect, isAdmin } from '../middlewares/auth.middleware';
import { createPlan, deletePlan, getAllPlans, getPlanById, updatePlan } from './subscription.controller';

const router = express.Router();

router.post('/create', protect, isAdmin, createPlan); // Only admin can create
router.get('/get',getAllPlans); // Only admin can view all plans
router.get('/:id', protect, getPlanById); // Anyone can view a plan by ID
router.put('/update/:id', protect, isAdmin, updatePlan); // Only admin can update
router.delete('/delete/:id', protect, isAdmin, deletePlan); // Only admin can delete


const subscription = router
export default subscription;