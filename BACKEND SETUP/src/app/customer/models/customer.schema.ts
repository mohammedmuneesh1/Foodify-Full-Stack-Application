import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
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
        // required: true,
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
    mobile:{
        type:String,
        // required:true
    },
    role:{
        type:String,
        enum:['Delivery Partner','Admin','Customer',"Hotel Owner"],
        default:'Customer'
    }
},{
    timestamps:true
});


const CustomerModel = mongoose.models?.Customer || mongoose.model("Customer", CustomerSchema);
export default CustomerModel;
 