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



export const CREATE_MENU_ITEM = async (id:string,data:FormData)=>{

    try {
        const res = await axiosInstance.post(`/api/shops/${id}/items`,data,{
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res?.data;
    } catch (error:unknown) {
        return axiosErrorHandler(error);
    }
}

export const EDIT_MENU_ITEM = async (id:string,itemId:string,data:FormData)=>{
    try {
        const res = await axiosInstance.put(`/api/shops/${id}/items/${itemId}`,data,{
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res?.data;
    } catch (error:unknown) {
        return axiosErrorHandler(error);
    }
}


export const DELETE_MENU_ITEM = async (id:string,itemId:string)=>{
    try {
        const res = await axiosInstance.delete(`/api/shops/${id}/items/${itemId}`);
        return res?.data;
    } catch (error:unknown) {
        return axiosErrorHandler(error);
    }
}
export const GET_SHOP_DATA_BY_ID = async (id:string,)=>{
    try {
        const res = await axiosInstance.get(`/api/shops/${id}`);
        return res?.data;
    } catch (error:unknown) {
        return axiosErrorHandler(error);
    }
}

export const UPDATE_SHOP_API  = async (id:string,data:FormData)=>{
    try {
        const res = await axiosInstance.put(`/api/shops/${id}`,data,{
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res?.data;
    } catch (error:unknown) {
        return axiosErrorHandler(error);
    }
}