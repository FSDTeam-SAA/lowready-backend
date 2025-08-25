import express from 'express'
import {
  subscribeNewsletter,
  broadcastNewsletter,
} from '../controllers/newsLetter.controller'
import { protect, isAdmin } from '../middlewares/auth.middleware' // Assume this checks role

const router = express.Router()

router.post('/newsletter/subscribe', subscribeNewsletter)
router.post('/newsletter/broadcast', protect, isAdmin, broadcastNewsletter)

export default router
