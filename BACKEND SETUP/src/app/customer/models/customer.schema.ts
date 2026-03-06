import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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
    role:{
        type:String,
        enum:['Delivery Partner','Admin','Customer'],
        default:'Customer'
    }
},{
    timestamps:true
});


const CustomerModel = mongoose.models?.Customer || mongoose.model("Customer", userSchema);
export default CustomerModel;
 