import { axiosErrorHandler } from "../utils/axiosErrorHandler";
import axiosInstance from "../utils/axiosInstance";

export const  ADD_OR_REPLACE_CART_ITEM  =async (obj:object)=>{
       try {
        const res = await axiosInstance.post('/api/carts/',obj);
        return res?.data;
    } catch (error:unknown) {
        return axiosErrorHandler(error);
    }
}



export const GET_MY_CART = async ()=>{
    try {
        const res = await axiosInstance.get('/api/carts/');
        return res?.data;
    } catch (error:unknown) {
        return axiosErrorHandler(error);
    }
}
export const REMOVE_CART_ITEM = async (cartItemId:string)=>{
    try {
        const res = await axiosInstance.delete(`/api/carts/item/${cartItemId}`);
        return res?.data;
    } catch (error:unknown) {
        return axiosErrorHandler(error);
    }
}



export const UPDATE_CART_ITEM_QUANTITY = async (cartItemId:string,quantity:number)=>{
    try {
        const res = await axiosInstance.patch(`/api/carts/item/${cartItemId}`,{quantity});
        return res?.data;
    } catch (error:unknown) {
        console.log("Error updating cart item quantity:", error);
        return axiosErrorHandler(error);
    }
}