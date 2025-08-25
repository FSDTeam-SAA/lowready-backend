import express from 'express'
import {
  subscribeNewsletter,
  broadcastNewsletter,
} from '../controllers/newsLetter.controller'
import { protect, isAdmin } from '../middlewares/auth.middleware' // Assume this checks role

const router = express.Router()

router.post('/subscribe', subscribeNewsletter)
router.post('/broadcast', 
  protect, isAdmin, 
  broadcastNewsletter)

export default router
