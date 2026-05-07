import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {  useSelector } from 'react-redux';
import useGetHotelOwnerShops from '../../hooks/useGetHotelOwnerShops';
import CreateShopModal from '../../components/HotelOwnersDashboard/CreateShopModal';
import type { RootState } from '../../redux/store/store';

const HotelOwnerHomePage = () => {
  useGetHotelOwnerShops();
  const navigate = useNavigate();
  const {shopData} = useSelector((state:RootState) => state.shop);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // ✅ No shops → open create modal
  useEffect(() => {
    const hasNoShopsFn = ()=>{
      if (shopData && shopData?.shops?.length === 0) {
        setShowCreateModal(true);
      }
    }
    hasNoShopsFn();
  }, [shopData]);


  return (
    <div>

      {/* No shops case — modal */}
      <CreateShopModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Multiple shops case */}

      {/*HOTEL MAPPING START HERE */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
  {shopData?.shops?.map(
    //eslint-disable-next-line
    (shop: any) => (
    <div
      key={shop._id}
      onClick={() => navigate(`/hotel-owner-dashboard/${shop._id}`)}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={shop.image?.url}
          alt={shop.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Status */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
              shop.isOpen ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {shop.isOpen ? "Open" : "Closed"}
          </span>
        </div>

        {/* Shop Name */}
        <div className="absolute bottom-4 left-4 text-white">
          <h2 className="text-xl font-bold line-clamp-1">
            {shop.name}
          </h2>

          <p className="text-sm text-gray-200 mt-1">
            {shop.categories?.join(" • ")}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Address */}
        <div className="flex items-start gap-2 text-gray-600 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>

          <p className="line-clamp-2">
            {shop.location?.address}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mt-5">
          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1">
              ⭐ {shop.rating?.average || 0}
            </div>

            <span className="text-sm text-gray-500">
              ({shop.rating?.count || 0} reviews)
            </span>
          </div>

          {/* Delivery */}
          <div className="text-sm text-gray-500">
             {shop?.deliveryTime  ?  `🚚 ${shop?.deliveryTime} mins`: ""} 
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-start gap-3">
          {/* <div>
            <p className="text-xs text-gray-400">
              Minimum Order
            </p>

            <p className="font-semibold text-gray-800">
              ₹{shop.minOrderAmount || 0}
            </p>
          </div> */}

          <button
            className="px-4 py-2 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition"
            onClick={(e) => {
              e.stopPropagation();
              
            }}
          >
          Manage Shop Info
          </button>

          <button
            className="px-4 py-2 rounded-xl bg-green-400 text-white text-sm font-medium hover:bg-green-500 transition"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/hotel-owner-dashboard/${shop._id}`);
            }}
          >
          View Dashboard
          </button>

        </div>
      </div>
    </div>
  ))}
</div>
      {/*HOTEL MAPPING END HERE */}

    </div>
  );
};

export default HotelOwnerHomePage;