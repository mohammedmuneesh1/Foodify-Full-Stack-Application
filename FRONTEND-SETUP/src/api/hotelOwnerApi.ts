import { axiosErrorHandler } from "../utils/axiosErrorHandler";
import axiosInstance from "../utils/axiosInstance";


export const GET_OWNER_ALL_SHOPS = async ()=>{
    try {
        const res = await axiosInstance.get('/api/shops?isOwner=true');
        return res?.data;
    } catch (error:unknown) {
        return axiosErrorHandler(error);
    }
}


export const CREATE_SHOP_API = async (data:FormData)=>{
    try {
        const res = await axiosInstance.post('/api/shops',data,{
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res?.data;
    } catch (error:unknown) {
        return axiosErrorHandler(error);
    }
}

export const HOTEL_OWNER_MENU_BY_ID= async (id:string)=>{
    try {
        const res = await axiosInstance.get(`/api/shops/${id}/items/menu`);
        return res?.data;
    } catch (error:unknown) {
        return axiosErrorHandler(error);
    }
}