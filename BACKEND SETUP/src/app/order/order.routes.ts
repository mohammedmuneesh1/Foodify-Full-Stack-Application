import express, { Router } from 'express'
import tryCatch from '../../middleware/customMiddleware/tryCatch';
import { CANCEL_ORDER, DELETE_ORDER, GET_ORDER_BY_ID, GET_SHOP_ORDERS, GET_USER_ORDERS, PLACE_ORDER, UPDATE_ORDER_STATUS } from './order.controller';
import authMiddleware from '../../middleware/customMiddleware/authMiddleware';

export const router:Router = express.Router();


// POST: Place a new order
// Body: { shopId, paymentMethod: "cod" | "online", deliveryAddress: {...}, note?: string }
router.post("/",authMiddleware, tryCatch(PLACE_ORDER));
// GET: Get all orders for a user
// Query: ?status=pending&skip=0&limit=10
router.get("/",authMiddleware, tryCatch(GET_USER_ORDERS));

// GET: Get specific order details
router.get("/orders/:orderId",authMiddleware, tryCatch(GET_ORDER_BY_ID));

// PUT: Cancel an order
// Body: { cancelReason?: string }
router.put("/orders/:orderId/cancel",authMiddleware, tryCatch(CANCEL_ORDER));

// ────────────────────────────────────────────────────────────────────
// SHOP ROUTES (Admin/Shop Owner)
// ────────────────────────────────────────────────────────────────────

// GET: Get all orders for a shop
// Query: ?status=pending&skip=0&limit=20
router.get("/shops/:shopId/orders",authMiddleware, tryCatch(GET_SHOP_ORDERS));


// PUT: Update order status (shop confirms, prepares, etc.)
// Body: { status: "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled" }
router.put("/:orderId/status",authMiddleware, tryCatch(UPDATE_ORDER_STATUS));

// ────────────────────────────────────────────────────────────────────
// ADMIN ROUTES
// ────────────────────────────────────────────────────────────────────

// DELETE: Delete an order (admin only)
router.delete("/orders/:orderId",authMiddleware, tryCatch(DELETE_ORDER));