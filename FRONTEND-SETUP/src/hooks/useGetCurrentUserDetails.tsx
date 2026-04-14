import React, { useEffect } from 'react'
import { USER_DETAILS_FETCH_API } from '../api/commonRoutes';

const useGetCurrentUserDetails = () => {
    useEffect(()=>{
        const fetchData = ()=>{
            const result = await USER_DETAILS_FETCH_API();

        }
        fetchData();
    },[]);
}

export default useGetCurrentUserDetails