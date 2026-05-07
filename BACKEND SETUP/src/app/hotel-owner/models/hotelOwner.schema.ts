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

const hotelownerSchema = new mongoose.Schema({
    fullName:{
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    mobile:{
        type:String,
    },
image: {
    type:imageSchema,
    required:false,
},
    cloudinaryKey:{
        type: String,
    },
    isEmailVerified:{
        type: Boolean,
        default: true,
    },
    role:{
        type:String,
        enum:['Delivery Partner','Admin','Hotel Owner'],
        default:'Hotel Owner'
    }
},{
    timestamps:true
});


const HotelownerModel = mongoose.models?.hotelOwner || mongoose.model("hotelOwner", hotelownerSchema);
export default HotelownerModel;
 