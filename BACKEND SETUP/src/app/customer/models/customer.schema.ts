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
        required: true,
    },
    mobile:{
        type:String,
        required:true
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
 