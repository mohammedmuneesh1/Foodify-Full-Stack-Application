import mongoose, { Document, Schema } from "mongoose";


interface User extends Document {
    name:string;
    email: string;
    password: string;
    isEmailVerified: boolean;
    role:'User'|'Admin';
  }

  


const UserSchema = new Schema<User>({
    name:{type:String,required:true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: true }, 
    role: { type: String, enum: ['User', 'Admin'], default: 'User' },
  },{
    timestamps:true,
  });

 const UserModel =  mongoose.models.Admin || mongoose.model<User>("User", UserSchema);
export default UserModel;
