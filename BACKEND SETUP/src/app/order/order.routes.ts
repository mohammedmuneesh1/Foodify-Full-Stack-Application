import express, { Router } from 'express'
import tryCatch from '../../middleware/customMiddleware/tryCatch';
import { CANCEL_ORDER, DELETE_ORDER, GET_ORDER_BY_ID, GET_SHOP_ORDERS, GET_USER_ORDERS, PLACE_ORDER, UPDATE_ORDER_STATUS } from './order.controller';

export const router:Router = express.Router();


// POST: Place a new order
// Body: { shopId, paymentMethod: "cod" | "online", deliveryAddress: {...}, note?: string }
router.post("/users/:userId/orders", tryCatch(PLACE_ORDER));

// GET: Get all orders for a user
// Query: ?status=pending&skip=0&limit=10
router.get("/users/:userId/orders", tryCatch(GET_USER_ORDERS));

// GET: Get specific order details
router.get("/orders/:orderId", tryCatch(GET_ORDER_BY_ID));

// PUT: Cancel an order
// Body: { cancelReason?: string }
router.put("/orders/:orderId/cancel", tryCatch(CANCEL_ORDER));

// ────────────────────────────────────────────────────────────────────
// SHOP ROUTES (Admin/Shop Owner)
// ────────────────────────────────────────────────────────────────────

// GET: Get all orders for a shop
// Query: ?status=pending&skip=0&limit=20
router.get("/shops/:shopId/orders", tryCatch(GET_SHOP_ORDERS));

// PUT: Update order status (shop confirms, prepares, etc.)
// Body: { status: "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled" }
router.put("/orders/:orderId/status", tryCatch(UPDATE_ORDER_STATUS));

// ────────────────────────────────────────────────────────────────────
// ADMIN ROUTES
// ────────────────────────────────────────────────────────────────────

// DELETE: Delete an order (admin only)
router.delete("/orders/:orderId", tryCatch(DELETE_ORDER));