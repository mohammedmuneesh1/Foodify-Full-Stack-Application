import { axiosErrorHandler } from "../utils/axiosErrorHandler";
import axiosInstance from "../utils/axiosInstance";


export const USER_DETAILS_FETCH_API = async ()=>{
    try {
        const res = await axiosInstance.get('/api/common/details');
        return res?.data;
    } catch (error:unknown) {
        return axiosErrorHandler(error);
    }
}