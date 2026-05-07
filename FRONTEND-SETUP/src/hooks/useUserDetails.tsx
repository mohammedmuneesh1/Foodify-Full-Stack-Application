import { useQuery } from '@tanstack/react-query'

import { useDispatch } from 'react-redux'
import {  setLoading, setuserData } from '../redux/reducers/userSlice'
import { useEffect } from 'react'
import { USER_DETAILS_FETCH_API } from '../api/commonRoutesApi'

const useUserDetails = () => {
  const dispatch = useDispatch()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['userDetails'],
    queryFn: USER_DETAILS_FETCH_API,
    retry: false,
    staleTime: 1000 * 60 * 5,
    // ✅ No enabled check needed — let the API tell you if logged in or not
  })


  useEffect(() => {
    dispatch(setLoading(isLoading));
  }, [isLoading]);



  // onSuccess was removed in v5 — sync to Redux via useEffect
  useEffect(() => {
    if (data?.success && data?.data) {
      dispatch(setuserData(data?.data ?? null))
    }
  }, [data, dispatch]);

  return { data, isLoading, isError }
}

export default useUserDetails;


//⚠️⚠️ INCASE THE "invalidateQueries" triggerred, the redux dont udpate immediately

// t = 0      → invalidateQueries()
// t = +10ms  → query marked stale
// t = +100ms → API request sent
// t = +300ms → response received
// t = +301ms → React Query updates data
// t = +302ms → useEffect fires
// t = +303ms → Redux updated

