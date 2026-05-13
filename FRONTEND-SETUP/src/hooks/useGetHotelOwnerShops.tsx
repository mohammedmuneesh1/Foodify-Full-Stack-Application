import { useQuery } from '@tanstack/react-query';
import { GET_OWNER_ALL_SHOPS } from '../api/hotelOwnerApi';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setShopData, setShopLoading } from '../redux/reducers/shopSlice';


//api just to get the shop data of the owner 
const useGetHotelOwnerShops = () => {

   const dispatch = useDispatch()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['hotelOwnerShops'],
    queryFn: GET_OWNER_ALL_SHOPS,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
  
    useEffect(() => {
      dispatch(setShopLoading(isLoading));
    }, [isLoading]);


  useEffect(() => {
    if (data?.success && data?.data) {
      dispatch(setShopData(data?.data ?? null))
    }
  }, [data, dispatch]);



  return {
    shopsData:data?.data,
    isLoading,
    isError,
  };
};

export default useGetHotelOwnerShops;