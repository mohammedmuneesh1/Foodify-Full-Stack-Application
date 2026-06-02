import { axiosErrorHandler } from "../utils/axiosErrorHandler";
import axiosInstance from "../utils/axiosInstance";


export const GET_SHOP_DATA_WITH_ITEMS_USING_SLUG = async (slug: string) => {
    try {
        const res = await axiosInstance.get(`/api/shops/slug/${slug}`);
        return res?.data;
    } catch (error: unknown) {
        return axiosErrorHandler(error);
    }
};
