import { axiosErrorHandler } from "../utils/axiosErrorHandler";
import axiosInstance from "../utils/axiosInstance";


export const PLACE_ORDER_API =async (obj:object)=>{
    try {
        const res =await axiosInstance.post('/api/orders/',obj);
        return res?.data;
    } catch (error:unknown) {
        return axiosErrorHandler(error);
    }
}


export const GET_ALL_ORDER_API = async ()=>{
    try {
        const res =await axiosInstance.get('/api/orders/');
        return res?.data;
    } catch (error:unknown) {
        return axiosErrorHandler(error);
    }
}


//eslint-disable-next-line
export const GET_HOTEL_OWNERS_ORDER_API = async (shopId:string,query:object | null )=>{
    try {
          const res = await axiosInstance.get(
      `/api/orders/shops/${shopId}/orders`,
      {
        params: query,
      }
    );
        return res?.data;
    } catch (error:unknown) {
        return axiosErrorHandler(error);
    }
}

export const UPDATE_ORDER_STATUS_API = async (orderId:string, status:string)=>{
    try {
        const res =await axiosInstance.put(`/api/orders/${orderId}/status`,{status});
        return res?.data;
    } catch (error:unknown) {
        return axiosErrorHandler(error);
    }
}