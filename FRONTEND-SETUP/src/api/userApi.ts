import { axiosErrorHandler } from "../utils/axiosErrorHandler";
import axiosInstance from "../utils/axiosInstance";



//===================================== API TO GET NEARBY HOTELS AND ITEMS ================================
export const FETCH_NEARBY_SHOP_AND_ITEMS = async (latitude: number, longitude: number) =>{
    try {
        const res = await axiosInstance.get(`/api/shops/nearby?lat=${latitude}&lng=${longitude}`);
        return res?.data;
    } catch (error:unknown) {
        return axiosErrorHandler(error);
    }
}