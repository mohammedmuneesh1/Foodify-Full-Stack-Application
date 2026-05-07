import { useSelector } from "react-redux";
import type { RootState } from "../redux/store/store";
import UserDashboardPage from "./dashboards/UserDashboardPage";
import DeliveryBoyDashboardPage from "./dashboards/DeliveryBoyDashboardPage";
import HotelOwnerHomePage from "./dashboards/HotelOwnerHomePage";
import NavBar from "../components/NavBar";

 const HomePage = () => {

    const user = useSelector((state: RootState) => state.user.userData);



  return (

    <div className="max-w-full w-full min-h-screen flex flex-col items-center  ">
        <NavBar/>
        <div className="min-h-screen w-full max-w-full pt-[100px] px-4">
        {user && user?.role === "Customer" && <UserDashboardPage/>}
        {user && user?.role === "Delivery Partner" && <DeliveryBoyDashboardPage/>}
        {user && user?.role === "Hotel Owner" && <HotelOwnerHomePage/>}
        </div>
    </div>

  )
}
export default HomePage



    // <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6 border">
      
    //   <h2 className="text-xl font-semibold mb-4 text-gray-800">
    //     User Details
    //   </h2>

    //   <div className="space-y-3">

    //     <div>
    //       <p className="text-sm text-gray-500">Full Name</p>
    //       <p className="text-gray-800 font-medium">
    //         {user && user?.fullName ? user?.fullName : "—"}
    //       </p>
    //     </div>

    //     <div>
    //       <p className="text-sm text-gray-500">Email</p>
    //       <p className="text-gray-800 font-medium">
            
    //         {user && user?.email ? user?.email : "—"}
    //       </p>
    //     </div>

    //     <div>
    //       <p className="text-sm text-gray-500">Mobile</p>
    //       <p className="text-gray-800 font-medium">
    //         {user && user.mobile ? user.mobile : "—"}
    //       </p>
    //     </div>

    //     <div>
    //       <p className="text-sm text-gray-500">Role</p>
    //       <p className="text-gray-800 font-medium">
    //         {user && user.role ? user.role : "—"}
    //       </p>
    //     </div>

    //   </div>

    //   <Link to="/signin">signin first</Link>
    // </div>