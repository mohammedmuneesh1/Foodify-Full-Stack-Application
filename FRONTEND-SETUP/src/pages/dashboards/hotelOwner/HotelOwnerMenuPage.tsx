import { useQuery } from '@tanstack/react-query'
import React from 'react'

const HotelOwnerMenuPage = () => {


    const {data,isLoading} = useQuery({queryKey:['allShops'],queryFn:GET_OWNER_ALL_SHOPS})
  return (
    <div>HotelOwnerMenuPage</div>
  )
}

export default HotelOwnerMenuPage