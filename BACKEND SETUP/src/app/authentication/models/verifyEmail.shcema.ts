import mongoose from "mongoose"


const verifyEmailSchema = new mongoose.Schema ({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    token:{
        type:String,
        required:true,
    },
    expiresAt:{
        type:Date,
        required:true,
        default: () => new Date(Date.now() + 1000 * 60 * 5),
    },
    isLinkPurposeMet:{  
        type:Boolean,
        default:false,
        description:"if user reset the password successfully, then we set this field  true, so can't reset password more than one time."
        // default:false;
    }
},{timestamps:true});

 const verifyEmailModel = mongoose.models.verifyEmailModel || mongoose.model("verifyEmail",verifyEmailSchema);
 export default verifyEmailModel;
