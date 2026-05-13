/*eslint-disable */
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store/store";
import { useQuery } from "@tanstack/react-query";
import { FETCH_NEARBY_SHOP_AND_ITEMS } from "../../api/userApi";
import {
  FiStar, FiClock, FiShoppingBag, FiMapPin,
  FiTruck, FiChevronRight, FiZap, FiHeart,
} from "react-icons/fi";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import type { UserItemInterface, UserShopInterface } from "../../types/userTypes";
import ItemCard from "../../components/UserDashboard/UserItemCard";

// ─── Types ────────────────────────────────────────────────────────────────────

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const ShopSkeleton = () => (
  <div className="flex-shrink-0 w-64 rounded-2xl overflow-hidden bg-white border border-gray-100 animate-pulse">
    <div className="h-36 bg-gray-200" />
    <div className="p-3 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="flex gap-2 mt-2">
        <div className="h-3 bg-gray-100 rounded w-16" />
        <div className="h-3 bg-gray-100 rounded w-16" />
      </div>
    </div>
  </div>
);

const ItemSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 flex overflow-hidden animate-pulse">
    <div className="flex-1 p-4 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
    <div className="w-28 h-28 bg-gray-200 flex-shrink-0" />
  </div>
);

// ─── UserShopInterface Card ────────────────────────────────────────────────────────────────
const ShopCard = ({ shop }: { shop: UserShopInterface }) => (
  <div className="shop-card flex-shrink-0 w-64 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm cursor-pointer">
    {/* Image */}
    <div className="relative h-36 bg-gradient-to-br from-orange-50 to-amber-100 overflow-hidden">
      {shop.image?.url ? (
        <img src={shop.image.url} alt={shop.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <MdOutlineRestaurantMenu size={40} className="text-orange-200" />
        </div>
      )}

      {/* Overlay badges */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {!shop.isOpen && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <span className="bg-white/90 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-full">
            Currently Closed
          </span>
        </div>
      )}

      <button className="absolute top-2.5 right-2.5 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-gray-400 hover:text-red-400 transition">
        <FiHeart size={13} />
      </button>

      {shop.deliveryFee === 0 && (
        <div className="absolute bottom-2.5 left-2.5 bg-[#ff4d2d] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <FiZap size={9} /> FREE DELIVERY
        </div>
      )}
    </div>

    {/* Info */}
    <div className="p-3">
      <div className="flex items-start justify-between gap-1">
        <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">{shop.name}</h3>
        <div className="flex items-center gap-0.5 bg-emerald-500 text-white text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0">
          <FiStar size={9} className="fill-white" />
          {shop.rating.average.toFixed(1)}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-0.5 truncate">
        {shop.categories.slice(0, 3).join(" · ")}
      </p>

      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100">
        <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
          <FiClock size={11} className="text-gray-400" />
          {shop.deliveryTime ?? "—"} min
        </span>
        <span className="text-gray-200">·</span>
        <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
          <FiTruck size={11} className="text-gray-400" />
          {shop.deliveryFee === 0 ? "Free" : `₹${shop.deliveryFee}`}
        </span>
        {shop.minOrderAmount ? (
          <>
            <span className="text-gray-200">·</span>
            <span className="text-xs text-gray-400">Min ₹{shop.minOrderAmount}</span>
          </>
        ) : null}
      </div>
    </div>
  </div>
);

// ─── UserItemInterface Card ────────────────────────────────────────────────────────────────


// ─── No Location State ────────────────────────────────────────────────────────
const NoLocationState = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center px-6">
    <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center mb-4">
      <FiMapPin size={34} className="text-[#ff4d2d]" />
    </div>
    <h3 className="text-xl font-bold text-gray-800">Where are you?</h3>
    <p className="text-sm text-gray-400 mt-2 max-w-xs leading-relaxed">
      We need your location to show shops and dishes near you. Allow location access from the top bar.
    </p>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <MdOutlineRestaurantMenu size={40} className="text-gray-200 mb-3" />
    <p className="text-sm font-medium text-gray-400">No {label} nearby right now</p>
    <p className="text-xs text-gray-300 mt-1">Try expanding your search radius</p>
  </div>
);



// ─── Main Page ────────────────────────────────────────────────────────────────
const UserDashboardPage = () => {
  const userCoordinates = useSelector((state: RootState) => state.user.userCoordinates);
  const city = useSelector((state: RootState) => state.user.city);
  const userData = useSelector((state: RootState) => state.user.userData);

  // Only fetch if city (coordinates) is available

  const { data, isLoading } = useQuery({
    queryKey:["nearbyFeed", userCoordinates?.lat, userCoordinates?.lng],
    queryFn: () => FETCH_NEARBY_SHOP_AND_ITEMS(
       userCoordinates!.lat,
       userCoordinates!.lng,
    ),
    enabled: !!userCoordinates, 
    staleTime: 1000 * 60 * 5,
  });
  const shops: UserShopInterface[] = data?.data?.shops?.data ?? [];
  const items: UserItemInterface[] = data?.data?.items?.data ?? [];

console.log(" user coordinates", userCoordinates);


  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

    if (!userCoordinates) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-10 h-10 border-4 border-[#ff4d2d] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Getting your location...</p>
        <p className="text-xs text-gray-400">Allow location access if prompted</p>
        <p className="text-xs text-gray-400">We need your location to show shops and dishes near you</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Syne:wght@700;800&display=swap');

        .shop-card { transition: transform .2s ease, box-shadow .2s ease; }
        .shop-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,.1); }

        
        .fade-in { animation: fadeIn .4s ease forwards; }
        .fade-in-up { animation: fadeInUp .5s ease forwards; opacity: 0; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        .stagger-1 { animation-delay: .05s; }
        .stagger-2 { animation-delay: .1s; }
        .stagger-3 { animation-delay: .15s; }
        .stagger-4 { animation-delay: .2s; }
        .stagger-5 { animation-delay: .25s; }
        .stagger-6 { animation-delay: .3s; }

        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="min-h-screen max-w-7xl mx-auto " style={{ fontFamily: "'DM Sans', sans-serif" }}>

       

        {/* ── Feed ── */}
        {userCoordinates && (
          <div className=" mx-auto px-4 sm:px-6 py-6 space-y-10">

            {/* ════ SHOPS NEARBY ════════════════════════════════════════════ */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="fade-in-up stagger-1">
                  <h2 style={{ fontFamily: "'Syne', sans-serif" }}
                    className="text-lg font-extrabold text-gray-900">
                    Shops near you
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Open and ready to deliver</p>
                </div>
                <button className="fade-in-up stagger-1 flex items-center gap-1 text-xs font-semibold text-[#ff4d2d] hover:underline">
                  See all <FiChevronRight size={13} />
                </button>
              </div>

              {/* Horizontal scroll */}
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                {isLoading
                  ? Array(4).fill(0).map((_, i) => <ShopSkeleton key={i} />)
                  : shops.length === 0
                  ? <EmptyState label="shops" />
                  : shops.map((shop, i) => (
                    <div
                      key={shop._id}
                      className={`fade-in-up stagger-${Math.min(i + 1, 6)}`}
                    >
                      <ShopCard shop={shop} />
                    </div>
                  ))
                }
              </div>
            </section>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Dishes for you
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* ════ ITEMS ════════════════════════════════════════════════════ */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="fade-in-up stagger-2">
                  <h2 style={{ fontFamily: "'Syne', sans-serif" }}
                    className="text-lg font-extrabold text-gray-900">
                    What's good today 🔥
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Highly rated dishes from nearby restaurants
                  </p>
                </div>
                <button className="fade-in-up stagger-2 flex items-center gap-1 text-xs font-semibold text-[#ff4d2d] hover:underline">
                  See all <FiChevronRight size={13} />
                </button>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array(6).fill(0).map((_, i) => <ItemSkeleton key={i} />)}
                </div>
              ) : items.length === 0 ? (
                <EmptyState label="dishes" />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3   gap-4 pb-6 items-stretch">
                  {items.map((item, i) => (
                    <div
                      key={item._id}
                      className={`fade-in-up stagger-${Math.min(i + 1, 6)}`}
                    >
                      <ItemCard item={item} />
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>
        )}
      </div>
    </>
  );
};

export default UserDashboardPage;