import axiosInstance from "../utils/axiosInstance";
import { axiosErrorHandler } from "../utils/axiosErrorHandler";



export async function APP_REGISTRATION_API(role:string,data:object){
    try {
        
    let api;

    if(role.toLowerCase() === "customer"){
        api = '/api/customers/registration';
    }
    else if(role.toLowerCase() === "delivery partner"){
        api = '/api/deliverypartners/registration';
    }
    else if (role.toLowerCase() === "hotel owner"){
        api = '/api/hotelowners/registration';

    }


    if(!api){
        // throw new Error("Invalid role");
        return{
            success:false,
            response:"api route has not been defined"
        }
    }

//     app.use('/api/auth', AuthRoute);
// app.use('/api/customer', CustomerRoute);
// app.use('/api/deliveryPartner', DeliveryPartnerRoutes);
    const res = await axiosInstance.post(api,data);
    return res?.data;
    } catch (error:unknown) {
        return axiosErrorHandler(error);
    }
}


export async function APP_LOGIN_API(role:string,data:object){
    try {
        
    let api;

    if(role.toLowerCase() === "customer"){
        api = '/api/customers/login';
    }
    else if(role.toLowerCase() === "delivery partner"){
        api = '/api/deliverypartners/login';
    }
    else if (role.toLowerCase() === "hotel owner"){
        api = '/api/hotelowners/login';

    }


    if(!api){
        // throw new Error("Invalid role");
        return{
            success:false,
            response:"api route has not been defined"
        }
    }

//     app.use('/api/auth', AuthRoute);
// app.use('/api/customer', CustomerRoute);
// app.use('/api/deliveryPartner', DeliveryPartnerRoutes);
    const res = await axiosInstance.post(api,data);
    return res?.data;
    } catch (error:unknown) {
        return axiosErrorHandler(error);
    }
}

export async function SEND_EMAIL_OTP_API(obj:object){
}





//  router.route('/email/forget-password/send-otp').post(tryCatch(SEND_EMAIL_OTP_CONTROLLER));
//  router.route('/email/verify/otp').post(tryCatch(VERIFY_EMAIL_OTP_CONTROLLER));
//  router.route('/email/otp/update-password').post(tryCatch(UPDATE_PASSWORD_BY_EMAIL_CONTROLLER));
