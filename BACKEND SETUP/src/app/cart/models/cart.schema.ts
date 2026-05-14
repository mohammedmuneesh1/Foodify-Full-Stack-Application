
import mongoose from "mongoose";



const cartItemSchema = new mongoose.Schema(
  {

    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    // selected variant snapshot
variant: {
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  price: Number,
},
    // selected addons snapshot
    addons: [
      {
        name: String,
        quantity: Number,
        price: Number,
        applyType: {
          type: String,
          enum: ['per-item', 'fixed'],
          default: 'fixed',
        },
      },
    ],
    // optional price snapshot
    basePrice: Number,
    totalPrice: Number,
  },
  { _id: true }
);



const cartSchema = new mongoose.Schema(

  {

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

cartSchema.index({ user: 1 }, { unique: true });

const CartModel = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
export default CartModel;

