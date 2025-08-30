import { ISubscriptionPlan } from "../interface/subscription";
import SubscriptionPlan from "./subscription.model";


/*********************
 * CREATE PLAN *
 *********************/
export const createSubscriptionPlan = async (data: ISubscriptionPlan): Promise<ISubscriptionPlan> => {
  return await SubscriptionPlan.create(data);
};

/*********************
 * GET ALL PLANS *
 *********************/
export const getAllSubscriptionPlans = async (): Promise<ISubscriptionPlan[]> => {
  return await SubscriptionPlan.find().sort({ createdAt: -1 });
};

/*********************
 * GET PLAN BY ID *
 *********************/
export const getSubscriptionPlanById = async (id: string): Promise<ISubscriptionPlan | null> => {
  return await SubscriptionPlan.findById(id);
};

/*********************
 * UPDATE PLAN *
 *********************/
export const updateSubscriptionPlan = async (id: string, data: ISubscriptionPlan): Promise<ISubscriptionPlan | null> => {
  return await SubscriptionPlan.findByIdAndUpdate(id, data, { new: true });
};

/*********************
 * DELETE PLAN *
 *********************/
export const deleteSubscriptionPlan = async (id: string): Promise<ISubscriptionPlan | null> => {
  return await SubscriptionPlan.findByIdAndDelete(id);
};
