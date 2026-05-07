import { Navigate, Outlet } from "react-router-dom"
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store/store";

const AuthRedirectMiddleware  = () => {

  const {userData,loading} = useSelector((state:RootState) => state.user);
   if (loading) return null;

  if (userData) {
    return <Navigate to="/" replace />
  }
   return <Outlet />
}

export default AuthRedirectMiddleware;