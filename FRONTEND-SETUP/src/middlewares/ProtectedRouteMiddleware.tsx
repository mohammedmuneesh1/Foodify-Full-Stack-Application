import { Navigate, Outlet } from "react-router-dom"
import type { RootState } from "../redux/store/store";
import { useSelector } from "react-redux";

const ProtectedRouteMiddleware = () => {

  const {userData,loading} = useSelector((state:RootState) => state.user);

 if (loading) return null;
  // Not logged in → go to signin
  if (!userData) {
    return <Navigate to="/signin" replace />
  }

  // Logged in → allow
  return <Outlet />
}
export default ProtectedRouteMiddleware;