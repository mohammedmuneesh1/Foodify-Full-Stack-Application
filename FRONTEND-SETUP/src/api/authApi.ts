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
    try {
        const res = await axiosInstance.post('/api/auth/email/forget-password/send-otp',obj);
        return res?.data;
    } catch (error:unknown) {
        return axiosErrorHandler(error);
    }
}


export async function VERIFY_FORGET_PASSWORD_OTP_API(obj:object){
    try {
        const res = await axiosInstance.post('/api/auth/email/verify/otp',obj);
        return res?.data;
    } catch (error) {
        return axiosErrorHandler(error);
    }
}



export async function UPDATE_PASSWORD_FOR_FORGET_PASSWORD_API(obj:object){
    try {
        const res = await axiosInstance.post('/api/auth/email/otp/update-password',obj);
        return res?.data;
    } catch (error) {
        return axiosErrorHandler(error);
    }
}

export async function LOGOUT_API(){
    try {
        const res = await axiosInstance.post('/api/auth/logout');
        return res?.data;
    } catch (error) {
        return axiosErrorHandler(error);
    }
}




export async function APP_GOOGLE_SIGNIN_API(role:string,data:object){
    try {
    let api;
    if(role.toLowerCase() === "customer"){
        api = '/api/customers/google-signin';
    }
    else if(role.toLowerCase() === "delivery partner"){
        api = '/api/deliverypartners/google-signin';
    }
    else if (role.toLowerCase() === "hotel owner"){
        api = '/api/hotelowners/google-signin';
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

