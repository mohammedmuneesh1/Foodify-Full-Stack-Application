import React from 'react'
import {FaLocationDot} from 'react-icons/fa6';
import { MdOutlineSearch } from "react-icons/md";
import { FiShoppingCart } from "react-icons/fi";
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../redux/store/store';
import { splitFirstLetters } from '../utils/basicUtils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LOGOUT_API } from '../api/authApi';
import { logout } from '../redux/reducers/userSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';


function NavBar() {
    const userData = useSelector((state:RootState) => state.user.userData);
    const city = useSelector((state:RootState) => state.user.city);
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    const navigate = useNavigate();


  const { mutate: logoutFn, isPending } = useMutation({
    mutationFn: LOGOUT_API,

    onSuccess: () => {
        // ✅ clear redux state
        dispatch(logout())
      // ✅ clear RTK/tanstack cache
      queryClient.removeQueries({ queryKey: ['userDetails'] })
      toast.success('Logged out successfully!');
      // ✅ redirect to signin
      localStorage.removeItem('city');
      setTimeout(()=>{
          navigate('/signin')
      },2000);
    },
    onError: (error) => {
      console.log('Logout failed:', error)
    }
  });


    const refreshTheLocation = () => {
        window.location.reload();
      };



  return (
<div className="w-full fixed top-0 z-50 bg-white shadow-sm ">
  <div className="max-w-7xl mx-auto px-4 h-[70px] flex items-center justify-between gap-4">

    {/* LOGO */}
    <h1 className="text-2xl font-bold text-[#ff4d2d] cursor-pointer">
      Foodify
    </h1>

    {/* SEARCH + LOCATION */}
    <div className="hidden md:flex flex-1 max-w-2xl items-center bg-[#f9f9f9] rounded-xl px-3 py-2 gap-3 border">

      {/* LOCATION */}
      <div className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
        <FaLocationDot
        onClick={refreshTheLocation}
        className="text-[#ff4d2d]" />
        <span className="truncate">{city ?? "Location"}</span>
      </div>

      <div className="h-5 w-px bg-gray-300" />

      {/* SEARCH */}
      <div className="flex items-center w-full gap-2">
        <MdOutlineSearch className="text-gray-500" />
        <input
          type="text"
          placeholder="Search delicious food..."
          className="bg-transparent outline-none w-full text-sm"
        />
      </div>
    </div>

    {/* RIGHT SECTION */}
    <div className="flex items-center gap-4">

      {/* CART */}
      <div className="relative cursor-pointer">
        <FiShoppingCart className="text-xl" />
        <span className="absolute -top-2 -right-2 bg-[#ff4d2d] text-white text-xs px-1.5 rounded-full">
          0
        </span>
      </div>

      {/* ORDERS */}
      <button className="hidden md:block px-3 py-1.5 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium hover:bg-[#ff4d2d]/20 transition">
        My Orders
      </button>

      {/* PROFILE + DROPDOWN MENU START*/}
      <div className="relative group">

      <div
      tabIndex={0}
      className="w-10 h-10 rounded-full bg-[#ff4d2d] text-white flex items-center justify-center font-semibold shadow-md cursor-pointer">
        {splitFirstLetters(userData?.fullName || "—")}
      </div>

 {/* DROPDOWN */}
  <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg 
  opacity-0 invisible 
  group-hover:opacity-100 group-hover:visible
  group-focus-within:opacity-100 group-focus-within:visible
  transition-all duration-200">


    <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
      My Orders
    </button>


    {
        userData ? (
       <button
    onClick={()=>logoutFn()}
    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">
       {isPending ? 'Logging out...' : 'Logout'}
    </button>
        ):(
     <button
    onClick={()=>navigate("/signin")}
    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">
       Signin
    </button>
    

        )
    }

    

  </div>



      </div>
      {/* PROFILE + DROPDOWN MENU END*/}

    </div>

  </div>

  {/* MOBILE SEARCH START */}
  <div className="md:hidden px-4 pb-3">
    <div className="flex items-center bg-[#f9f9f9] rounded-lg px-3 py-2 gap-2 border">
      <MdOutlineSearch className="text-gray-500" />
      <input
        type="text"
        placeholder="Search..."
        className="bg-transparent outline-none w-full text-sm"
      />
    </div>
  </div>
  {/* MOBILE SEARCH END */}

</div>
  )
}

export default NavBar