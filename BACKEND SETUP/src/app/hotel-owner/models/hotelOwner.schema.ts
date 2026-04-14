import mongoose from "mongoose";

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
        required: true,
    },
    mobile:{
        type:String,
        required:true
    },
    image:{
        type:{
            type:String,
            enum:["Google","Cloudinary"],    
            required:true,
        },
        url:{
            type:String,
            required:true
        }
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
 