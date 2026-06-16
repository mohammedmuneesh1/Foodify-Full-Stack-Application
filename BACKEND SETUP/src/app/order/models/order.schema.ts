import mongoose from "mongoose";
 
// ── Snapshot of a single ordered item (mirrors CartItem at time of order) ──
const orderItemSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "shop",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    // Variant snapshot at time of order
    variant: {
      _id: mongoose.Schema.Types.ObjectId,
      name: String,
      price: Number,
      
    },
    // Addons snapshot at time of order
    addons: [
      {
        name: String,
        quantity: Number,
        price: Number,
        applyType: {
          type: String,
          enum: ["per-item", "fixed"],
          default: "fixed",
        },
      },
    ],
    basePrice: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  { _id: true }
);
 
// ── Delivery address embedded document ──
const deliveryAddressSchema = new mongoose.Schema(
    
    
    {
    label: {
      type: String,                         // e.g. "Home", "Work", "Other"
      trim: true,
      enum: ["Home", "Work", "Other"],
    },
    
    addressLine: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      default: "India",
      trim: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    landmark: {
      type: String,                         // optional nearby landmark
      trim: true,
    },
    contactName: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
  },
  { _id: false }                            // embedded — no separate _id needed
);
 
// ── Payment info embedded document ──
const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,                         // populated after online payment
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);
 
// ── Main Order schema ──
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "shop",
      required: true,
      index: true,
    },
 
    // Snapshot of cart items at checkout
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (v: unknown[]) => v.length > 0,
        message: "Order must have at least one item.",
      },
    },
 
    // Pricing breakdown
    subtotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,                       // subtotal + deliveryFee - discount
    },
 
    // Where to deliver
    deliveryAddress: {
      type: deliveryAddressSchema,
      required: true,
    },
 
    // Payment details
    payment: {
      type: paymentSchema,
      required: true,
    },
 
    // Order lifecycle status
    status: {
      type: String,
      enum: [
        "pending",       // just placed, awaiting confirmation
        "confirmed",     // shop confirmed
        "preparing",     // shop is preparing
        "out_for_delivery",
        "delivered",
        "ready_for_pickup",
        "picked_up",
        "rider_assigned",
        "cancelled",
        "refund_initiated",
        "refunded",
      ],
      default: "pending",
    },
 
    // Optional: special instructions from customer
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
 
    // Timeline tracking
    confirmedAt: Date,
    preparingAt: Date,
    outForDeliveryAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
 
    cancelReason: {
      type: String,
      trim: true,
    },
 
    // Delivery agent (if you add that feature later)
    deliveryAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "deliveryPartner",
      default: null,
    },

    assignedTo:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "deliveryPartner",
        default: null,
    },
    deliveryAssignment:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "deliveryAssignment",
        default: null,
    },
  },
  { timestamps: true }                      // createdAt = order placed time
);
 
// ── Indexes for common queries ──
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ shop: 1, status: 1 });
 
const OrderModel =
  mongoose.models.Order || mongoose.model("Order", orderSchema);
 
export default OrderModel;