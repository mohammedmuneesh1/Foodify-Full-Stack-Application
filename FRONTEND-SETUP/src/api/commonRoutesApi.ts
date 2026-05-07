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


// const { data, isLoading, error } = useQuery({
//   queryKey: ["userDetails"],
//   queryFn: USER_DETAILS_FETCH_API,
//   staleTime: 1000 * 60 * 5, // 5 minutes
//   retry: 1,
// });

