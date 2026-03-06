import UserModel from "../models/user.schema";




export async function isAdminExistDB(email:string) {
    const isAdminExist = await UserModel.findOne({email:email});
    return isAdminExist;
}