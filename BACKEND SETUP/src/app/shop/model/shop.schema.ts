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


const dayScheduleSchema = new mongoose.Schema({
  isOpen: {
    type: Boolean,
    default: true        // false = holiday/leave for that day
  },
  shifts: [             // ✅ supports split shifts (lunch break etc)
    {
      open: {
        type: String,   // "09:00"
      },
      close: {
        type: String,   // "14:00"
      }
    }
  ]
}, { _id: false })


const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      unique: true
    },

    description: {
      type: String
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hotelOwner",
      required: true
    },

    // 🔥 Location (important for food apps)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      },
      address: {
        type: String,
        required: true
      },
      city: String,
      state: String,
      pincode: String
    },

    // 🔥 Categories (fast filtering)
    categories: [
      {
        type: String // "Biryani", "Pizza", etc.
      }
    ],

    // 🔥 Shop image / banner
    image: {
      type: imageSchema,
      required: false,
    },

    // 🔥 Ratings
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

    // 🔥 Delivery details
    deliveryTime: {
      type: Number // in minutes
    },

    deliveryFee: {
      type: Number,
      default: 0
    },

    minOrderAmount: {
      type: Number,
      default: 0
    },

    // 🔥 Open/Close timing
  schedule: {
    monday:    { type: dayScheduleSchema, default: () => ({}) },
    tuesday:   { type: dayScheduleSchema, default: () => ({}) },
    wednesday: { type: dayScheduleSchema, default: () => ({}) },
    thursday:  { type: dayScheduleSchema, default: () => ({}) },
    friday:    { type: dayScheduleSchema, default: () => ({}) },
    saturday:  { type: dayScheduleSchema, default: () => ({}) },
    sunday:    { type: dayScheduleSchema, default: () => ({}) },
  },


    isOpen: {
      type: Boolean,
      default: true
    },

    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted:{
      type:Boolean,
      default:false,
    },

  },
  { timestamps: true }
);

shopSchema.index({ location: "2dsphere" });

const shopModel = mongoose.models.shop || mongoose.model("shop", shopSchema);
export default shopModel;