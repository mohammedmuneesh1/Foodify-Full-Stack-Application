import mongoose from "mongoose";




const imageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Google", "Cloudinary"],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  publicId:{
    type:String,
  },
  mimeType:{
    type:String,
  },
  mediaType:{
    type:String,
  },
  dimension:{
    width: Number,
    height: Number,
  },
}, { _id: false });


const itemSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "shop",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String
    },

      price: {
      type: Number,
       required: function (this: any) {
    return (this.variants?.length ?? 0) === 0;
  },
  },

    discountPrice: {
      type: Number
    },

    category: {
      type: String, // "Biryani", "Pizza", "Drinks"
      // enum:["Snacks","Main Course", "Desserts", "Pizza", "Burgers", "Sandwiches","South Indian","North Indian","Chinese","Fast Food","Others"],
      required: true,
    },
    isVeg: {
      type: Boolean,
      default: false
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    image: {
      type:imageSchema,
      required:false,
    },
    isDeleted:{
      type:Boolean,
      default:false,
    },
      clicks: {
    type: Number,
    default: 0,
  },
  
    preparationTime:{
      type:Number,
      default:0
    },
    rating: {
      average: {
        type: Number,
        default: 0
      },
      count: {
        type: Number,
        default: 0
      }
    },

    // 🔥 Variants (important for real apps)
 // ✅ variants with proper validation
    variants: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },

        // ✅ discount per variant too
        discount: {
          price: { type: Number },
          validFrom: { type: Date },
          validUpto: { type: Date },
          isActive: { type: Boolean, default: false }
        }
      }
    ],
    // 🔥 Add-ons (extra cheese, etc.)

    addons: [
      {
        name: {
          type: String,
          required: true
        },
        price: {
          type: Number,
          required: true
        }
      }
    ],

  },
  { timestamps: true }
);
const ItemModel = mongoose.models.Item || mongoose.model("Item", itemSchema);
export default ItemModel;