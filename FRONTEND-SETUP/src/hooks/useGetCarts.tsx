// hooks/useGetCart.ts
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { GET_MY_CART } from "../api/cartApi";
import { setCart } from "../redux/reducers/userSlice";

const useGetCart = (enabled: boolean) => {
  const dispatch = useDispatch();
  const { data } = useQuery({
    queryKey: ["getCart"],
    queryFn: GET_MY_CART,
    staleTime: Infinity,
    enabled,           // only runs when true
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    if (data) dispatch(setCart(data?.data));
  }, [data]);
};

export default useGetCart;







//refetchOnWindowFocus: false,

// It means:

// When user leaves browser tab/window
// and comes back again


// opens your app
// switches to YouTube tab
// comes back after 20 seconds

// When browser window/tab becomes active again:
// refetchOnWindowFocus





//stale:infinity




// fetch
// → cache
// → after staleTime expires
// → mark stale
// → may refetch later


// But with:

// staleTime: Infinity

// the cached data is considered: