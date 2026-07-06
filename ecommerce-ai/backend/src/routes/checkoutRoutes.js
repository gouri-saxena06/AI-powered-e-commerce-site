import express from 'express';
import {
  createCheckoutSession, getOrder, listMyOrders, listAllOrders,
} from '../controllers/checkoutController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
router.post('/create-session', requireAuth, createCheckoutSession);
router.get('/orders/mine', requireAuth, listMyOrders);
router.get('/orders/all', requireAuth, requireAdmin, listAllOrders);
router.get('/orders/:id', requireAuth, getOrder);

export default router;
