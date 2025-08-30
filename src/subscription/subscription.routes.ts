
import express from 'express';


import { protect, isAdmin } from '../middlewares/auth.middleware';
import { createPlan, deletePlan, getAllPlans, getPlanById, updatePlan } from './subscription.controller';

const router = express.Router();

router.post('/', protect, isAdmin, createPlan); // Only admin can create
router.get('/', protect, isAdmin, getAllPlans); // Only admin can view all plans
router.get('/:id', protect, getPlanById); // Anyone can view a plan by ID
router.patch('/:id', protect, isAdmin, updatePlan); // Only admin can update
router.delete('/:id', protect, isAdmin, deletePlan); // Only admin can delete

export default router;