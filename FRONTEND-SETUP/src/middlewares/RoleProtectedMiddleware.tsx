

import React from 'react'
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store/store';
import { Navigate, Outlet } from 'react-router-dom';

/*eslint-disable*/
const RoleProtectedMiddleware = ({role,role2}:
  {role:"Hotel Owner" | "Delivery Partner" | "Customer",
  role2?:"Hotel Owner" | "Delivery Partner" | "Customer"}
) => {
    const {userData} = useSelector((state:RootState) => state.user);

if(userData?.role !== role){
  return <Navigate to="/" replace />;
}
// if(role2 && userData?.role !== role2){
//   return <Navigate to="/" replace />;
// }
   return <Outlet/>;
}
export default RoleProtectedMiddleware