import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import AppError from '../errors/AppError';
import sendResponse from '../utils/sendResponse';
import { createSubscriptionPlan, deleteSubscriptionPlan, getAllSubscriptionPlans, getSubscriptionPlanById, updateSubscriptionPlan } from './subscription.service';


/******************
 * CREATE PLAN *
 ******************/
export const createPlan = catchAsync(async (req: Request, res: Response) => {

  const plan = await createSubscriptionPlan(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Subscription plan created successfully',
    data: plan,
  });
});

/********************
 * GET ALL PLANS *
 ********************/
export const getAllPlans = catchAsync(async (req: Request, res: Response) => {
  const plans = await getAllSubscriptionPlans();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All subscription plans fetched successfully',
    data: plans,
  });
});

/*********************
 * GET PLAN BY ID *
 *********************/
export const getPlanById = catchAsync(async (req: Request, res: Response) => {
  const plan = await getSubscriptionPlanById(req.params.id);
  
  if (!plan) {
    throw new AppError(httpStatus.NOT_FOUND, 'Plan not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subscription plan fetched successfully',
    data: plan,
  });
});

/*********************
 * UPDATE PLAN *
 *********************/
export const updatePlan = catchAsync(async (req: Request, res: Response) => {
  const updatedPlan = await updateSubscriptionPlan(req.params.id, req.body);

  if (!updatedPlan) {
    throw new AppError(httpStatus.NOT_FOUND, 'Plan not found or not updated');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subscription plan updated successfully',
    data: updatedPlan,
  });
});

/***********************
 * DELETE PLAN *
 ***********************/
export const deletePlan = catchAsync(async (req: Request, res: Response) => {
  const deleted = await deleteSubscriptionPlan(req.params.id);

  if (!deleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Plan not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subscription plan deleted successfully',
  });
});
