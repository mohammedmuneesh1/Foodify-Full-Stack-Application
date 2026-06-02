


import  { useEffect, useState } from 'react'
import { FiBell, FiClipboard, FiHome, FiLogOut, FiMenu, FiX, FiZap } from 'react-icons/fi';
import { MdOutlineRestaurantMenu } from 'react-icons/md';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { splitFirstLetters } from '../../utils/basicUtils';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../redux/store/store';
import LiveClock from '../LiveClock';
import { FcSettings } from 'react-icons/fc';
import { useMutation } from '@tanstack/react-query';
import { LOGOUT_API } from '../../api/authApi';
import { logout } from '../../redux/reducers/userSlice';

function HotelOwnerDashboardLayout() {

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const {shopId} = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
   const location = useLocation().pathname;
   const {userData,loading} = useSelector((state:RootState)=>state.user);
   const {shopData,shopLoading} = useSelector((state:RootState) => state.shop);


   


   //========================= selected shop start ================================
   //eslint-disable-next-line
     const selectedShop:any = shopData?.shops?.find(
     //eslint-disable-next-line
       (val: any) => val?._id === shopId
   );
   
   useEffect(() => {
     if (loading || shopLoading) return; // ✅ returns from useEffect itself, not a nested function
   
     if (!selectedShop) {
       navigate("/");
     }
   
   }, [loading, shopId, navigate,shopLoading]);
   
   

   const isActive = (route: string) => {
  // normalize both by removing trailing slash
  const normalize = (p: string) => p.replace(/\/$/, "");
  return normalize(location) === normalize(route);
};



   //========================= selected shop end ================================
   
    const menuItems = [
      { name: "Dashboard", icon: <FiHome size={18} />,               id: "dashboard" ,route:`/hotel-owner-dashboard/${shopId}` },
      { name: "Orders",    icon: <FiClipboard size={18} />,          id: "orders",    badge: 18 , route:`/hotel-owner-dashboard/${shopId}/orders`   },
      { name: "Menu",      icon: <MdOutlineRestaurantMenu size={18}/>,id: "menu" , route:`/hotel-owner-dashboard/${shopId}/menu` },
      { name: "Settings",      icon: <FcSettings size={18}/>,id: "menu" , route:`/hotel-owner-dashboard/${shopId}/settings` },
    //   { name: "Delivery",  icon: <RiMotorbikeFill size={18} />,      id: "delivery" , route:`/hotel-owner-dashboard/${shopId}/delivery`},
    //   { name: "Customers", icon: <FiUsers size={18} />,              id: "customers"  ,route:`/hotel-owner-dashboard/${shopId}/customers` },
    //   { name: "Analytics", icon: <FiTrendingUp size={18} />,         id: "analytics" },
    //   { name: "Settings",  icon: <FiSettings size={18} />,           id: "settings" },
    ];



    
    //======================================= LOGOUT FN START =============================================== 

    const {mutate:logoutFn, isPending} = useMutation({
      mutationFn: LOGOUT_API,
      onSuccess: () => {
        dispatch(logout());
        navigate("/signin");
        localStorage.removeItem('city');
        window.location.reload();
      },
    })
    //======================================= LOGOUT FN END =============================================== 
   if(loading || shopLoading) return null;

  return (
        <div className="min-h-screen flex bg-[#f7f8fc]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');

        .stat-card { transition: transform .2s, box-shadow .2s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,.09); }

        .order-row { transition: background .15s; }
        .order-row:hover { background: #fafbff; }

        .nav-btn { transition: all .18s; }
        .nav-btn:hover { background: rgba(255,77,45,.08); color: #ff4d2d; }
        .nav-btn.active { background: #ff4d2d; color: #fff; box-shadow: 0 4px 14px rgba(255,77,45,.35); }

        .badge-pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }

        .progress-bar { transition: width 1s ease; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e2e2; border-radius: 99px; }
      `}</style>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)} />
      )}





   {/* ══════════════════════════════ SIDEBAR ══════════════════════════════ */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50  w-64 bg-white flex flex-col
        border-r border-gray-100 shadow-xl
        transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen   lg:shadow-none
      `}>

        {/* Logo */}
        <div className="flex items-center justify-between px-6 h-[72px] border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#ff4d2d] flex items-center justify-center">
              <FiZap size={16} className="text-white" />
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif" }}
              className="text-xl font-extrabold tracking-tight text-gray-900">
              FOODIFY
            </span>
          </div>
          <button className="lg:hidden text-gray-400 hover:text-gray-700"
            onClick={() => setSidebarOpen(false)}>
            <FiX size={22} />
          </button>
        </div>

        {/* Shop pill */}
        <div className="mx-4 mt-4 mb-2 px-3 py-2.5 rounded-xl bg-orange-50 border border-orange-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#ff4d2d] to-[#ff8c42] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            S
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-800 truncate">{selectedShop?.name ?? ""}</p>
            <p className="text-xs text-gray-400">{selectedShop?.address ?? ""}</p>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 badge-pulse" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
            to={item?.route ?? "/"}
            key={item.id}
            //   onClick={() => setActive(item?.route ?? "")}
              className={`nav-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                 font-medium text-gray-600 ${isActive(item.route) ? "active" : ""}`}
            >
              {item.icon}
              <span>{item.name}</span>
              {item.badge && (
                <span className={`ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full ${isActive(item.route) ? "bg-white/25 text-white" : "bg-[#ff4d2d] text-white"}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Logout start */}
        <div className="p-3 border-t border-gray-100">
          <button
          disabled={isPending}
          onClick={()=>logoutFn()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 transition">
            <FiLogOut size={18} />
            <span>{isPending ? "Logging out...":"Logout"}</span>
          </button>
        {/* Logout end */}
        </div>
      </aside>
    {/* ══════════════════════════════ SIDEBAR ══════════════════════════════ */}


      {/* ══════════════════════════════ MAIN ════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">

{/* ══════════════════════════════ HEADER ════════════════════════════════ */}
 <header className=" h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-500" onClick={() => setSidebarOpen(true)}>
              <FiMenu size={24} />
            </button>
            <div>
              <h2 style={{ fontFamily: "'Syne', sans-serif" }}
                className="text-lg font-extrabold text-gray-900 leading-tight">
                Good evening, {userData?.fullName ?? ""} 👋
              </h2>

<div className="text-xs text-gray-400 hidden sm:block">
  <LiveClock/>
</div> 

  </div>
          </div>

            {/* LIVE BADGE START */}
          <div className="flex items-center gap-3">
            {

                !selectedShop?.isOpen ? (
                <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 badge-pulse" />
              <span className="text-xs font-semibold text-emerald-600">Shop Open</span>
            </div>
                ):(
                <div className="hidden sm:flex items-center gap-1.5 bg-red-50 border-2 border-red-600 border-dotted  px-3 py-1.5 rounded-full animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-400 badge-pulse" />
              <span className="text-xs font-semibold text-red-600">Shop Closed</span>
            </div>
                )


            }
            

            {/* Notification */}
            <button className="relative w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition">
              <FiBell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff4d2d] rounded-full" />
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff4d2d] to-[#ff8c42] flex items-center justify-center text-white text-sm font-bold uppercase">
                {splitFirstLetters(userData?.fullName ?? "")} 
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 leading-none">{userData?.fullName ?? ""}</p>
                <p className="text-xs text-gray-400 mt-0.5">Owner</p>
              </div>
            </div>
          </div>
          {/* LIVE BADGE END */}

</header>
{/* ══════════════════════════════ HEADER ════════════════════════════════ */}

{/* ══════════════════════════════ HEADER ════════════════════════════════ */}
<div className="w-full h-full max-w-full px-4 py-3"> 
<Outlet/>
</div>
{/* ══════════════════════════════ HEADER ════════════════════════════════ */}

</div>
{/* ══════════════════════════════ MAIN ════════════════════════════════ */}







      </div>
  )
}

export default HotelOwnerDashboardLayout