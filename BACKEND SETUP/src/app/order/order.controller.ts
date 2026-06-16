
// ────────────────────────────────────────────────────────────────────
// PLACE ORDER - Main function

import { Request, Response } from "express";
import ResponseHandler from "../../utils/Response-Error-Handler/responseHandler";
import CartModel from "../cart/models/cart.schema";
import OrderModel from "./models/order.schema";

// ────────────────────────────────────────────────────────────────────
export async function PLACE_ORDER(
  req: Request,
  res: Response
): Promise<any> {
  

  const userId = req.user?.uId;
  const {  paymentMethod, deliveryAddress, note } = req.body;

  // Validate payment method
  if (!["cod", "online"].includes(paymentMethod)) {
    return ResponseHandler(
      res,
      400,
      false,
      null,
      "Invalid payment method. Use 'cod' or 'online'."
    );
  }

  // Validate delivery address
  if (
    !deliveryAddress ||
    !deliveryAddress.addressLine ||
    !deliveryAddress.city ||
    deliveryAddress.latitude === undefined ||
    deliveryAddress.longitude === undefined
  ) {
    return ResponseHandler(
      res,
      400,
      false,
      null,
      "Invalid delivery address. Required fields: addressLine, city, latitude, longitude."
    );
  }

  console.log('userId',userId);
  // Fetch user's cart
  const cart = await CartModel.findOne({ user: userId }).populate("items.item");
  console.log(cart);
  

  if (!cart || cart.items.length === 0) {
    return ResponseHandler(res, 400, false, null, "Cart is empty.");
  }

  //FOLLOWING SWIGGY/ZOMOTO STYLE ONLY ORDER FROM ONE SHOP AT A TIME
  const shopId = cart.items[0].shop.toString();
  console.log('shopId',cart.items[0]?.item);

  // Filter cart items for the specific shop
  // const shopCartItems = cart.items.filter(
  //   (item: any) => item.shop.toString() === shopId
  // );
  const shopCartItems = cart.items;


  if (shopCartItems.length === 0) {
    return ResponseHandler(
      res,
      400,
      false,
      null,
      "No items from this shop in cart."
    );
  }

  // Build order items snapshot (mirrors cart items)
  const orderItems = shopCartItems.map((cartItem: any) => ({
    item: cartItem.item._id,
    shop: cartItem.shop,
    quantity: cartItem.quantity,
    ...(cartItem.variant && {
      variant:{
        name: cartItem.variant.name,
        price: cartItem.variant.price,
      }
    }),
    // variant: cartItem.variant,
    addons: cartItem.addons,
    basePrice: cartItem.basePrice,
    totalPrice: cartItem.totalPrice,
  }));

  // Calculate pricing
  const subtotal = orderItems.reduce(
    (sum: number, item: any) => sum + item.totalPrice,
    0
  );
  const deliveryFee = 0; // Set based on your logic
  const discount = 0; // Apply coupons/discounts if needed
  const totalAmount = subtotal + deliveryFee - discount;

  // Create order
  const order = new OrderModel({
    user: userId,
    shop: shopId,
    items: orderItems,
    subtotal,
    deliveryFee,
    discount,
    totalAmount,
    deliveryAddress,
    payment: {
      method: paymentMethod,
      status: paymentMethod === "cod" ? "pending" : "pending",
    },
    note,
    status: "pending",
  });

  await order.save();

  // Remove ordered items from cart
  cart.items = cart.items.filter(
    (item: any) => item.shop.toString() !== shopId
  );
  cart.totalAmount = cart.items.reduce(
    (sum: number, item: any) => sum + item.totalPrice,
    0
  );
  await cart.save();

  return ResponseHandler(
    res,
    201,
    true,
    { order },
    "Order placed successfully."
  );
}

// ────────────────────────────────────────────────────────────────────
// GET USER ORDERS
// ────────────────────────────────────────────────────────────────────
export async function GET_USER_ORDERS(
  req: Request,
  res: Response
): Promise<any> {
  const userId = req.user?.uId;
  const { status, skip = 0, limit = 50 } = req.query;

  const filter: any = { user: userId };
  if (status && status !== "all") {
    filter.status = status;
  }

  const orders = await OrderModel.find(filter)
    .populate("shop", "name slug image")
    .populate("items.item", "name image price")
    .sort({ createdAt: -1 })
    .skip(Number(skip))
    .limit(Number(limit));

  const total = await OrderModel.countDocuments(filter);

  return ResponseHandler(
    res,
    200,
    true,
    { orders, total, skip: Number(skip), limit: Number(limit) },
    "Orders fetched successfully."
  );
}

// ────────────────────────────────────────────────────────────────────
// GET ORDER BY ID
// ────────────────────────────────────────────────────────────────────
export async function GET_ORDER_BY_ID(
  req: Request,
  res: Response
): Promise<any> {
  const { orderId } = req.params;

  const order = await OrderModel.findById(orderId)
    .populate("user", "name email phone")
    .populate("shop", "name slug image")
    .populate("items.item");

  if (!order) {
    return ResponseHandler(res, 404, false, null, "Order not found.");
  }

  return ResponseHandler(res, 200, true, { order }, "Order fetched successfully.");
}

// ────────────────────────────────────────────────────────────────────
// UPDATE ORDER STATUS (Shop/Admin)
// ────────────────────────────────────────────────────────────────────
export async function UPDATE_ORDER_STATUS(
  req: Request,
  res: Response
): Promise<any> {
  const { orderId } = req.params;
  const { status } = req.body;
  const userId = req.user?.uId;
  const userRole = req.user?.role;

  if(userRole !== "Hotel Owner"){
    return ResponseHandler(res, 400, false, null, "Invalid role.");
  }

  if(!orderId) return ResponseHandler(res, 400, false, null, "Order ID is required.");


  const validStatuses = [
        "pending",       // just placed, awaiting confirmation
        "confirmed",     // shop confirmed
        "preparing",     // shop is preparing
        "out_for_delivery",
        "delivered",
        "picked_up",
        "ready_for_pickup",
        "rider_assigned",
        "cancelled",
        "refund_initiated",
        "refunded",
      ];

  if (!validStatuses.includes(status)) {
    return ResponseHandler(res, 400, false, null, "Invalid status.");
  }

  const order = await OrderModel.findById(orderId);

  if (!order) {
    return ResponseHandler(res, 404, false, null, "Order not found.");
  }

  // Update status and timeline
  order.status = status;

  if (status === "confirmed") order.confirmedAt = new Date();
  if (status === "preparing") order.preparingAt = new Date();
  if (status === "out_for_delivery") order.outForDeliveryAt = new Date();
  if (status === "delivered") order.deliveredAt = new Date();
  if (status === "cancelled") order.cancelledAt = new Date();

  await order.save();

  return ResponseHandler(
    res,
    200,
    true,
    { order },
    `Order status updated to ${status}.`
  );
}

// ────────────────────────────────────────────────────────────────────
// CANCEL ORDER
// ────────────────────────────────────────────────────────────────────
export async function CANCEL_ORDER(
  req: Request,
  res: Response
): Promise<any> {
  const { orderId } = req.params;
  const { cancelReason } = req.body;

  const order = await OrderModel.findById(orderId);

  if (!order) {
    return ResponseHandler(res, 404, false, null, "Order not found.");
  }

  // Can only cancel pending/confirmed orders
  if (!["pending", "confirmed"].includes(order.status)) {
    return ResponseHandler(
      res,
      400,
      false,
      null,
      `Cannot cancel order with status: ${order.status}`
    );
  }

  order.status = "cancelled";
  order.cancelledAt = new Date();
  order.cancelReason = cancelReason || "Cancelled by user";

  // Handle refund for online payments
  if (order.payment.method === "online") {
    order.payment.status = "refund_initiated";
  }

  await order.save();

  return ResponseHandler(
    res,
    200,
    true,
    { order },
    "Order cancelled successfully."
  );
}

// ────────────────────────────────────────────────────────────────────
// GET SHOP ORDERS (for shop dashboard)
// ────────────────────────────────────────────────────────────────────
export async function GET_SHOP_ORDERS(
  req: Request,
  res: Response
): Promise<any> {
  const { shopId } = req.params;
  const { status } = req.query;
 
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Number(req.query.limit) || 10;
  const skip =  limit * (page - 1);

  const filter: any = { shop: shopId };
  if (status && status !== "all") {
    filter.status = status;
  }


  const [orders, total, totalOrders, pendingOrders, deliveredOrder, preparingOrders] = await Promise.all([
    OrderModel.find(filter)
      .populate("user", "name email phone")
      .populate("items.item", "name image")
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit)),
    OrderModel.countDocuments(filter),
    OrderModel.countDocuments({ shop: shopId }),
    OrderModel.countDocuments({ shop: shopId, status: "pending" }),
    OrderModel.countDocuments({ shop: shopId, status: "delivered" }),
    OrderModel.countDocuments({ shop: shopId, status: "preparing" }),
  ]);



  const totalPages = Math.ceil(total / limit);


  return ResponseHandler(
    res,
    200,
    true,
    { orders, total,
       skip: Number(skip),
        limit: Number(limit),
        totalPages: Number(totalPages),
        totalOrders,
        pendingOrders,
        deliveredOrder,
        preparingOrders,
     },
    "Shop orders fetched successfully."
  );
}

// ────────────────────────────────────────────────────────────────────
// DELETE ORDER (Admin only)
// ────────────────────────────────────────────────────────────────────
export async function DELETE_ORDER(
  req: Request,
  res: Response
): Promise<any> {
  const { orderId } = req.params;

  const order = await OrderModel.findByIdAndDelete(orderId);

  if (!order) {
    return ResponseHandler(res, 404, false, null, "Order not found.");
  }

  return ResponseHandler(res, 200, true, null, "Order deleted successfully.");
}
