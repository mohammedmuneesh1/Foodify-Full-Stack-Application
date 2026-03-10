import mongoose from "mongoose";

const DeliveryPartnerSchema = new mongoose.Schema({
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


const DeliveryPartnerModel = mongoose.models?.deliveryPartner || mongoose.model("deliveryPartner", DeliveryPartnerSchema);
export default DeliveryPartnerModel;
 