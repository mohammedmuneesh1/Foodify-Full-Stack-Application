import { Route, Routes } from 'react-router-dom'
import './App.css'
import SignupPage from './pages/SignupPage'
import SignInPage from './pages/SignInPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import AuthRedirectMiddleware from './middlewares/AuthRedirectMiddleware'
import HomePage from './pages/HomePage'
import useUserDetails from './hooks/useUserDetails'
import ProtectedRouteMiddleware from './middlewares/ProtectedRouteMiddleware'
import useGetCity from './hooks/useGetCity'
import HotelOwnerDashboardPage from './pages/dashboards/HotelOwnerDashboardPage'
import RoleProtectedMiddleware from './middlewares/RoleProtectedMiddleware'
import useGetHotelOwnerShops from './hooks/useGetHotelOwnerShops'
import HotelOwnerDashboardLayout from './components/HotelOwnersDashboard/HotelOwnerDashboardLayout'
import HotelOwnerMenuPage from './pages/dashboards/hotelOwner/HotelOwnerMenuPage'
import HotelOwnerSettingsPage from './pages/dashboards/hotelOwner/HotelOwnerSettingsPage'
import AddToCartModal from './components/UserDashboard/UserCartToModal'
import useGetCart from './hooks/useGetCarts'
import CartPage from './pages/dashboards/customer/CustomerCartPage'
import ShopBySlugPage from './pages/ShopBySlugPage'

function App() {

  
  const { data } = useUserDetails(); // loading handled inside
  useGetCity(!!data?.data);
  useGetHotelOwnerShops();
  const isCustomer = data?.data?.role === "Customer";
  useGetCart(!!data?.data && isCustomer);




    




//     if (isLoading) {
//     dispatch(setLoading(isLoading));
//    }

//   useEffect(() => {
//   if (isLoading) {
//     dispatch(setLoading(isLoading));
//   }
// }, [isLoading]);
  

  return (
    <>
  <Routes>

    {/*PROTECTIVE ROUTE START */}
      <Route element={<AuthRedirectMiddleware/>}>
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/signin" element={<SignInPage />} />

    </Route>

      <Route element={<ProtectedRouteMiddleware/>}>
      <Route path="/" element={<HomePage />} />

{/* HOTEL OWNER DASHBOARD LAYOUT START */}
      <Route element={<RoleProtectedMiddleware 
      role='Hotel Owner'
      role2="Customer"
      />}>
      <Route element = {<HotelOwnerDashboardLayout/>}>
      <Route path="/hotel-owner-dashboard/:shopId" element={<HotelOwnerDashboardPage />}/>
      <Route path="/hotel-owner-dashboard/:shopId/orders" element={<HotelOwnerDashboardPage />}/>
      <Route path="/hotel-owner-dashboard/:shopId/menu" element={<HotelOwnerMenuPage />}/>
      <Route path="/hotel-owner-dashboard/:shopId/settings" element={<HotelOwnerSettingsPage />}/>
      </Route>
      </Route>

{/* HOTEL OWNER DASHBOARD LAYOUT END */}

      <Route element={<RoleProtectedMiddleware 
      role='Customer'
      />}
      >


         <Route element={<CustomerLayout />}>
    <Route
      path="/shops/:slug"
      element={<ShopBySlugPage />}
    />

    <Route
      path="/cart"
      element={<CartPage />}
    />
  </Route>

   

      </Route>


{/* HOTEL OWNER DASHBOARD LAYOUT END */}





    </Route>




  {/*PROTECTIVE ROUTE START */}
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
  </Routes>

      <AddToCartModal />


    </>
  )
}

export default App


//   {/* Public (auth pages) */}
//   <Route element={<AuthRedirect />}>
//     <Route path="/signup" element={<SignupPage />} />
//     <Route path="/signin" element={<SignInPage />} />
//   </Route>

//   {/* Protected routes */}
//   <Route element={<ProtectedRoute />}>
//     <Route path="/dashboard" element={<DashboardPage />} />
//     <Route path="/profile" element={<ProfilePage />} />
//   </Route>

//   {/* Open route */}
//   <Route path="/forgot-password" element={<ForgotPasswordPage />} />

// </Routes>



import { Outlet } from "react-router-dom";
import NavBar from './components/NavBar'

const CustomerLayout = () => {
  return (
    <>
      <NavBar />

      <main>
        <Outlet />
      </main>
    </>
  );
};
