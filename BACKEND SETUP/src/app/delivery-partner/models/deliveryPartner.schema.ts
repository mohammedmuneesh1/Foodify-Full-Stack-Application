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



const DeliveryPartnerSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    mobile: { type: String },
    image: { type: imageSchema, required: false },
    cloudinaryKey: { type: String },
    isEmailVerified: { type: Boolean, default: true },
    role: {
        type: String,
        enum: ['Delivery Partner', 'Admin', 'Customer'],
        default: 'Delivery Partner'
    },

    // 👇 New fields for location & availability
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    },
    isAvailable: {
        type: Boolean,
        default: false // toggled on/off by the partner in their app
    }
}, { timestamps: true });

// Required for geospatial "find nearby" queries
DeliveryPartnerSchema.index({ location: "2dsphere" });

const DeliveryPartnerModel = mongoose.models?.deliveryPartner || mongoose.model("deliveryPartner", DeliveryPartnerSchema);
export default DeliveryPartnerModel;