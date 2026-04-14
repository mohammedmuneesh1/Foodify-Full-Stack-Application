import { Request,Response } from "express";
import ResponseHandler from "../../utils/Response-Error-Handler/responseHandler";
import ErrorHandler from "../../utils/Response-Error-Handler/errorHandler";
import UserModel from "./models/user.schema";
import bcrypt from 'bcrypt'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { isAdminExistDB } from "./services/authentication.service";
import { verifyEmailTemplate } from "./services/email-templates/verifyEmailTemplate";
import ForgetPasswordModel from "./models/forgetpassword.schema";
import { forgetPasswordEmail } from "./services/email-templates/forgetPasswordMail";
import verifyEmailModel from "./models/verifyEmail.shcema";
import { getUserGeoLocationFn, userDeviceTrackingFn } from "./services/helper.function";
import { hashTokenFn } from "../../utils/hash/hashToken";
import LoginHistoryModel from "./models/loginHistory.schema";
import CustomerModel from "../customer/models/customer.schema";
import DeliveryPartnerModel from "../delivery-partner/models/deliveryPartner.schema";
import HotelownerModel from "../hotel-owner/models/hotelOwner.schema";
import { generateOTP } from "../../utils/generateOTP";
import { COMPARE_PASSWORD_UTILS, HASHPASSWORD_UTILS } from "../../utils/bcrypt.utils";
import { sendResetPasswordOTPEmailTemplateFn } from "../../email-template/sendResetPasswordOTPEmailTemplate";
// import { forgetPasswordEmail } from "../../utils/email-templates/forgetPasswordMail";






// ===============================================================  USER START  ============================================================================================


//----------------------------------------------------------- demo test --------------------------------------------------------------------------------------


export async function demoFn (req: Request, res: Response): Promise<void> {
     
  
  // const userDeviceData = userDeviceTrackingFn(req);
  // const geoData = await getUserGeoLocationFn(req)
  


    // try {
    //     const val =await new Promise((resolve,reject)=>{
    //         setTimeout(() => {
    //             reject('rejected for demo');
    //         }, 3000);
    //     })
        
    // } catch (error) {
    //     console.error ("error", (error as Error).message);
    // }
     ResponseHandler(res, 200, true, null, 'This is demo route.');
    }


//----------------------------------------------------------- USER REGISTRATION --------------------------------------------------------------------------------------
export async function userRegisterFn(req: Request, res: Response): Promise<Response> {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return ResponseHandler(res, 400, false, null, 'Name, email, and password are required.');
    }
    const isUserExist = await UserModel.findOne({ email });
    if (isUserExist) {
      return ResponseHandler(res, 409, false, null, 'User already exists with this email.');
    }
   const genSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, genSalt);
    const newUser = await UserModel.create({
      name,
      email,
      // password:hashedPassword,
      isEmailVerified: true, // Set to false if you're doing email verification flow
    });
    return ResponseHandler(res, 201, true, { userId: newUser._id }, 'User registered successfully.');
  }


//----------------------------------------------------------- USER LOGIN --------------------------------------------------------------------------------------
export async function userLoginFn(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;
    if (!email || !password) {
      return ResponseHandler(res, 400, false, null, 'Email and password are required.');
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      return ResponseHandler(res, 401, false, null, 'Invalid email or password.');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return ResponseHandler(res, 401, false, null, 'Invalid email or password.');
    }
    const token = jwt.sign(
        { uId: user._id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: '7d' }
      );
    
    const deviceInfo = userDeviceTrackingFn(req);
    const hashedToken = hashTokenFn(token);


    await LoginHistoryModel.create({
       user: user._id,
       token: hashedToken,
       deviceInfo:deviceInfo,
       loginTime:new Date()
    });

    return ResponseHandler(res, 200, true, { token, user: { name: user.name, email: user.email, role: user.role } }, 'Login successful.');
  }


//----------------------------------------------------------- UPDATE PASSWORD FROM DASHBOARD --------------------------------------------------------------------------------------
  export async function updatePasswordByEmailFn(req: Request, res: Response): Promise<Response> {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return ResponseHandler(res, 400, false, null, 'Email and new password are required.');
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      return ResponseHandler(res, 404, false, null, 'User not found.');
    }
    const genSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, genSalt);
    user.password = hashedPassword;
    await user.save();
    return ResponseHandler(res, 200, true, null, 'Password updated successfully.');
  }

//----------------------------------------------------------- FORGET PASSWORD EMAIL SEND  --------------------------------------------------------------------------------------
export async function userForgetPasswordEmailVerifyFn(req:Request,res:Response):Promise<Response> {
    const {email} = req.body;
    if(!email) return ResponseHandler(res,400,false,null,'email is required.');
    const isUserExist = await UserModel.findOne({ email });
   if(!isUserExist) return ResponseHandler(res,404,false,null,'User not found.');
    if(isUserExist){
        const resetToken = jwt.sign({uId:isUserExist?._id},process.env.FORGET_PASSWORD_RESET_KEY as string,{expiresIn:'5m'});
        const forgetPasswordDocument = await ForgetPasswordModel.create({
            userId:isUserExist._id,
            token:resetToken,
        });
        const link = `http://localhost:3000/auth/portal/forget-password/${forgetPasswordDocument?._id}/${resetToken}/reset-password`;
         await forgetPasswordEmail(email,link);
        }
      return ResponseHandler(res,200,true,null,'We received a request to reset your password. If an account is associated with this email, you will receive a reset link shortly.');
}
//----------------------------------------------------------- USER VERIFY LINK BEFORE SHOWING FORM   --------------------------------------------------------------------------------------

export async function userVerifyLinkBeforeFormShowingFn(req:Request,res:Response):Promise<any> {
    try {
        const token = req.params.token;
        const forgetPasswordDocumentId = req.params.id;
        const isForgetPasswordDocumentExist = await ForgetPasswordModel.findOne({_id:forgetPasswordDocumentId,token:token});
        if(!isForgetPasswordDocumentExist){
            return ResponseHandler(res,400,false,null,'Invalid Link. Please request a new reset link.');
        }
        if(isForgetPasswordDocumentExist?.isLinkPurposeMet){
            return ResponseHandler(res,400,false,null,'This link has already been used. Please request a new one to reset your password again.');
        }
        const isTokenValid = jwt.verify(token, process.env.FORGET_PASSWORD_RESET_KEY as string) as JwtPayload;
        return ResponseHandler(res,200,true,null,"Link is valid.");
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return ResponseHandler(res, 400, false, null, "Reset link has expired. Please request a new one.");
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return ResponseHandler(res, 400, false, null, "Invalid Link. Please request a new reset link.");
        }
        return ErrorHandler(res,error,'verifyTokenBeforeFormShowingFn Fn');
    }
}

//----------------------------------------------------------- USER RESET PASSWORD   --------------------------------------------------------------------------------------




export async function userResetPassword(req:Request,res:Response):Promise<any> {
    try {
        const forgetpasswordDocumentId = req.params.id;
        const token = req.params.token;
        const {newPassword,confirmPassword} = req.body;
        if(!forgetpasswordDocumentId || !token || !newPassword || !confirmPassword){
            return ResponseHandler(res,400,false,null,'All fields are required.');
        };
        const isForgetPasswordDocumentExist = await ForgetPasswordModel.findOne({_id:forgetpasswordDocumentId,token:token});
        if(!isForgetPasswordDocumentExist){
            return ResponseHandler(res,400,false,null,'Invalid link. Please request a new link to reset your password.')
        }
        if(isForgetPasswordDocumentExist?.isLinkPurposeMet){
            return ResponseHandler(res,400,false,null,'This link has already been used. Please request a new one to reset your password again.')
        }
        const isTokenValidDecoded = jwt.verify(token,process.env.FORGET_PASSWORD_RESET_KEY as string) as JwtPayload;
        const genSalt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword,genSalt);
        await UserModel.updateOne(
        {_id:isTokenValidDecoded?.uId},
        {$set:{password:hashedPassword}}
        );
        await ForgetPasswordModel.updateOne({_id:forgetpasswordDocumentId},{$set:{isLinkPurposeMet:true}});
        return ResponseHandler(res,200,true,null,'Your Password has been resetted successfully.')
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return ResponseHandler(res, 400, false, null, "Reset link has expired. Please request a new one.");
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return ResponseHandler(res, 400, false, null, "Invalid Link. Please request a new reset link.");
        }
        console.error(`error occured at AdminResetPasswordFn Fn ${error instanceof Error ? error?.message :error}`,);
        return ErrorHandler(res,error,'AdminResetPasswordFn Fn');
    }
}








// ===============================================================  USER START  ============================================================================================


// ===============================================================  SEND OTP TO MAIL   ============================================================================================
export async function SEND_EMAIL_OTP_CONTROLLER(
  req: Request,
  res: Response
): Promise<Response> {
  const { email, role } = req.body;

  if (!email || !role) {
    return ResponseHandler(res, 200, false, null, "All fields are required.");
  }

  const roleConfig = {
  Customer: {
    model: CustomerModel,
    
    idField: "customerId",
    notFoundMsg: "Customer not found with provided email.",
  },
  "Delivery Partner": {
    model: DeliveryPartnerModel,
    idField: "deliveryPartnerId",
    notFoundMsg: "Delivery Partner not found with provided email.",
  },
  "Hotel Owner": {
    model: HotelownerModel,
    idField: "hotelOwnerId",
    notFoundMsg: "Hotel Owner not found with provided email.",
  },
} as const;

  const config = roleConfig[role as keyof typeof roleConfig];

  if (!config) {
    return ResponseHandler(res, 400, false, null, "Invalid role has been detected.");
  }

  const { model, idField, notFoundMsg } = config;
  const user = await model.findOne({ email });

  if (!user) {
    return ResponseHandler(res, 200, false, null, notFoundMsg);
  }

  const otp = generateOTP();

  console.log('otp',otp);


    // dynamic field assignment
  await ForgetPasswordModel.create({
    [idField]: user._id,
    email,
    otp: await HASHPASSWORD_UTILS(otp.toString(), "10"),
  });


  const sendEmail = await sendResetPasswordOTPEmailTemplateFn(
    email,
    otp.toString()
  );
  console.log('sendEmail',sendEmail);

  if (!sendEmail?.success) {
    return ResponseHandler(
      res,
      200,
      false,
      null,
      "Technical issue while sending email. Try again later."
    );
  }


  return ResponseHandler(
    res,
    200,
    true,
    null,
    "OTP has been sent to your email."
  );
}

// ===============================================================  VERIFY OTP  ============================================================================================
export async function VERIFY_EMAIL_OTP_CONTROLLER(req: Request, res: Response) {
  const {email,otp,role} = req.body;
  if(!email) {
    return ResponseHandler(res, 200, false, null, "Email is required.");
  }
  if(!otp) {
    return ResponseHandler(res, 200, false, null, "OTP is required.");
  }

  const roleConfig = {
  "Customer": {
    model: CustomerModel,
    idField: "customerId",
    notFoundMsg: "Customer not found with provided email.",
  },
  "Delivery Partner": {
    model: DeliveryPartnerModel,
    idField: "deliveryPartnerId",
    notFoundMsg: "Delivery Partner not found with provided email.",
  },
  "Hotel Owner": {
    model: HotelownerModel,
    idField: "hotelOwnerId",
    notFoundMsg: "Hotel Owner not found with provided email.",
  },
} as const;
  const config = roleConfig[role as keyof typeof roleConfig];
  if (!config) {
    return ResponseHandler(res, 400, false, null, "Invalid role has been detected.");
  }
  const { model, idField, notFoundMsg } = config;
  const user = await model.findOne({ email });
  if (!user) {
    return ResponseHandler(res, 200, false, null, notFoundMsg);
  }
  const forgetpasswordDocument = await ForgetPasswordModel.findOne({
    [idField]: user._id,
    email,
  }).sort({createdAt:-1});

  if(!forgetpasswordDocument) {
    return ResponseHandler(res, 200, false, null, "OTP has been expired.");
  }

  if(forgetpasswordDocument.isOtpVerified){
    return ResponseHandler(res, 200, false, null, "OTP has already been verified. If you want to reset your password, please request to otp.");
  }
  const isOtpMatch =await  COMPARE_PASSWORD_UTILS(otp.toString(),forgetpasswordDocument.otp);

  if(!isOtpMatch) {
    return ResponseHandler(res, 200, false, null, "OTP does not match.");
  }

  if(forgetpasswordDocument.expiredAt < new Date()){
    return ResponseHandler(res, 200, false, null, "OTP has been expired. Please request a new one.");
  }

  forgetpasswordDocument.isOtpVerified = true;
  await forgetpasswordDocument.save();
  return ResponseHandler(res, 200, true, null, "OTP has been verified.");
}



export async function UPDATE_PASSWORD_BY_EMAIL_CONTROLLER(req:Request,res:Response):Promise<Response> {
  const {email,role,password,confirmPassword} = req.body;

  if(!email) {
    return ResponseHandler(res, 200, false, null, "Email is required.");
  }

  if(!role) {
    return ResponseHandler(res, 200, false, null, "OTP is required.");
  }

  if(!password){
    return ResponseHandler(res, 200, false, null, "Password is required.");
  }

  if(!confirmPassword){
    return ResponseHandler(res, 200, false, null, "Confirm Password is required.");
  }

  if(password !== confirmPassword){
    return ResponseHandler(res, 200, false, null, "Password and confirm password should be same.");
  }


  const roleConfig = {
  Customer: {
    model: CustomerModel,
    idField: "customerId",
    notFoundMsg: "Customer not found with provided email.",
  },
  "Delivery Partner": {
    model: DeliveryPartnerModel,
    idField: "deliveryPartnerId",
    notFoundMsg: "Delivery Partner not found with provided email.",
  },
  "Hotel Owner": {
    model: HotelownerModel,
    idField: "hotelOwnerId",
    notFoundMsg: "Hotel Owner not found with provided email.",
  },
} as const;

  const config = roleConfig[role as keyof typeof roleConfig];

  if (!config) {
    return ResponseHandler(res, 400, false, null, "Invalid role has been detected.");
  }

  const { model, idField, notFoundMsg } = config;

  const user = await model.findOne({ email });

  if (!user) {
    return ResponseHandler(res, 200, false, null, notFoundMsg);
  }
  
  const hashPassword = await HASHPASSWORD_UTILS(password,"10");

  user.password = hashPassword;
  await user.save();
  return ResponseHandler(res,200,true,null,"Password has been updated.");
}











// // ===============================================================  ADMIN START ============================================================================================

// export async function superAdminLogin(req: Request,res: Response):Promise<Response> {
//     const {email,password} = req.body;
//     if(!email || !password) return ResponseHandler(res,400,false,null,'email or password missing')
//     const isAdminExist = await isAdminExistDB(email);
//     if(!isAdminExist) return ResponseHandler(res,400,false,null,'Email/Password not match');
//     const isPasswordMatch = await bcrypt.compare(password,isAdminExist.password);
//     if(!isPasswordMatch) return ResponseHandler(res,400,false,null,'Email/Password not match');

//     if(!isAdminExist?.isEmailVerified){
//         const resetToken = jwt.sign({uId:isAdminExist?._id},process.env.ADMIN_VERIFY_EMAIL_KEY as string,{expiresIn:'5m'});
//         const forgetPasswordDocument = await verifyEmailModel.create({
//             userId:isAdminExist._id,
//             token:resetToken,
//         });
//         // /auth/portal/verify/email/123456/token
//         const link = `http://localhost:3000/auth/portal/verify/email/${forgetPasswordDocument._id}/${resetToken}`;
//         await verifyEmailTemplate(isAdminExist?.email,link);
//         return ResponseHandler(res,200,true,{type:'verifyEmail'},'Verification Email has been sent to your email. Please verify your email.');
//     }
//     const jwtVal = jwt.sign({email:isAdminExist.email,uId:isAdminExist._id,schoolId:isAdminExist.schoolId},process.env.ADMIN_SECRET_KEY as string,{expiresIn:'15d'});
//     return ResponseHandler(res,200,true,{
//       token:jwtVal,
//       sId:isAdminExist.schoolId,
//       uId:isAdminExist._id
//     },'Admin logged in successfully.');
//   }













// //------------------------------------------------------------------------- FORGET PASSWORD LINK  EMAIL VERIFY --------------------------------------------------------------------------------------
// export async function adminForgetPasswordEmailVerifyFn(req:Request,res:Response):Promise<Response> {
//     const {email} = req.body;
//     if(!email) return ResponseHandler(res,400,false,null,'email is required.');
//     const isAccountExist = await isAdminExistDB(email);
//     if(isAccountExist){
//         const resetToken = jwt.sign({uId:isAccountExist?._id},process.env.ADMIN_FORGET_PASSWORD_RESET_KEY as string,{expiresIn:'5m'});
//         const forgetPasswordDocument = await ForgetPasswordModel.create({
//             userId:isAccountExist._id,
//             token:resetToken,
//         });
//         const link = `http://localhost:3000/auth/portal/forget-password/${forgetPasswordDocument?._id}/${resetToken}/reset-password`;
//          await forgetPasswordEmail(email,link);
//         }
//       return ResponseHandler(res,200,true,null,'We received a request to reset your password. If an account is associated with this email, you will receive a reset link shortly.');
// }





// //------------------------------------------------------------------------- VERIFYING RESET PASSWORD PAGE TOKEN  BEFORE SHOWING THE FORM --------------------------------------------------------------------------------------
// export async function verifyTokenBeforeFormShowingFn(req:Request,res:Response):Promise<any> {

//     try {
//         const token = req.params.token;
//         const forgetPasswordDocumentId = req.params.id;
//         const isForgetPasswordDocumentExist = await ForgetPasswordModel.findOne({_id:forgetPasswordDocumentId,token:token});
//         if(!isForgetPasswordDocumentExist){
//             return ResponseHandler(res,400,false,null,'Invalid Link. Please request a new reset link.');
//         }

//         if(isForgetPasswordDocumentExist?.isLinkPurposeMet){
//             return ResponseHandler(res,400,false,null,'This link has already been used. Please request a new one to reset your password again.');
//         }


//         const isTokenValid = jwt.verify(token, process.env.ADMIN_FORGET_PASSWORD_RESET_KEY as string) as JwtPayload;
//         return ResponseHandler(res,200,true,null,"Link is valid.");
//     } catch (error) {
//         if (error instanceof jwt.TokenExpiredError) {
//             return ResponseHandler(res, 400, false, null, "Reset link has expired. Please request a new one.");
//         }
//         if (error instanceof jwt.JsonWebTokenError) {
//             return ResponseHandler(res, 400, false, null, "Invalid Link. Please request a new reset link.");
//         }
//         return ErrorHandler(res,error,'verifyTokenBeforeFormShowingFn Fn');
//     }
// }



// export async function verifyAdminEmailUsingIdAndToken(req:Request,res:Response):Promise<any> {
//     try {
//         const  verifyEmailDocumentId = req.params.id;
//         const token = req.params.token;
//         const isVerifyEmailDocumentExist = await verifyEmailModel.findOne({_id:verifyEmailDocumentId,token:token});
//         if(!isVerifyEmailDocumentExist){
//             return ResponseHandler(res,400,false,null,'Link has been expired');
//         }
//         if(isVerifyEmailDocumentExist?.isLinkPurposeMet){
//             return ResponseHandler(res,200,true,null,'Email has been verified successfully.');
//         }
//         const isTokenValid = jwt.verify(token, process.env.ADMIN_VERIFY_EMAIL_KEY as string) as JwtPayload;

//        await UserModel.updateOne(
//         {_id:isTokenValid?.uId},
//         {$set:{isEmailVerified:true}}
//         );

//         await verifyEmailModel.updateOne({_id:verifyEmailDocumentId},{$set:{isLinkPurposeMet:true}});
//         return ResponseHandler(res,200,true,null,'Email has been verified successfully.');
//     } catch (error) {
//         if (error instanceof jwt.TokenExpiredError) {
//             return ResponseHandler(res, 400, false, null, "Reset link has expired. Please request a new one.");
//         }
//         if (error instanceof jwt.JsonWebTokenError) {
//             return ResponseHandler(res, 400, false, null, "Invalid Link. Please request a new reset link.");
//         }
//         return ErrorHandler(res,error,'verifyAdminEmailUsingIdAndToken Fn');
//     }
// }





// export async function AdminResetPasswordFn(req:Request,res:Response):Promise<any> {
//     try {
//         const forgetpasswordDocumentId = req.params.id;
//         const token = req.params.token;
//         const {newPassword,confirmPassword} = req.body;
//         if(!forgetpasswordDocumentId || !token || !newPassword || !confirmPassword){
//             return ResponseHandler(res,400,false,null,'All fields are required.');
//         };
//         const isForgetPasswordDocumentExist = await ForgetPasswordModel.findOne({_id:forgetpasswordDocumentId,token:token});
//         if(!isForgetPasswordDocumentExist){
//             return ResponseHandler(res,400,false,null,'Invalid link. Please request a new link to reset your password.')
//         }
//         if(isForgetPasswordDocumentExist?.isLinkPurposeMet){
//             return ResponseHandler(res,400,false,null,'This link has already been used. Please request a new one to reset your password again.')
//         }
//         const isTokenValidDecoded = jwt.verify(token,process.env.ADMIN_FORGET_PASSWORD_RESET_KEY as string) as JwtPayload;
//         const genSalt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(newPassword,genSalt);
//         await UserModel.updateOne(
//         {_id:isTokenValidDecoded?.uId},
//         {$set:{password:hashedPassword}}
//         );
//         await ForgetPasswordModel.updateOne({_id:forgetpasswordDocumentId},{$set:{isLinkPurposeMet:true}});

//         return ResponseHandler(res,200,true,null,'Your Password has been resetted successfully.')
//     } catch (error) {
//         if (error instanceof jwt.TokenExpiredError) {
//             return ResponseHandler(res, 400, false, null, "Reset link has expired. Please request a new one.");
//         }
//         if (error instanceof jwt.JsonWebTokenError) {
//             return ResponseHandler(res, 400, false, null, "Invalid Link. Please request a new reset link.");
//         }
//         console.error(`error occured at AdminResetPasswordFn Fn ${error instanceof Error ? error?.message :error}`,);
//         return ErrorHandler(res,error,'AdminResetPasswordFn Fn');
//     }
// }



// // ===============================================================  ADMIN END ============================================================================================

