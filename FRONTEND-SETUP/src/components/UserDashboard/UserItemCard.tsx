import { FiClock, FiShoppingBag, FiStar } from "react-icons/fi";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import type { UserItemInterface } from "../../types/userTypes";



const getDisplayPrice = (item: UserItemInterface): string => {
  if (item.variants?.length) {
    return `₹${Math.min(...item.variants.map((v) => v.price))}+`;
  }
  return `₹${item.discountPrice ?? item.price}`;
};

const VegBadge = ({ isVeg }: { isVeg: boolean }) => (
  <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 ${isVeg ? "border-emerald-500" : "border-red-400"}`}>
    <div className={`w-2 h-2 rounded-full ${isVeg ? "bg-emerald-500" : "bg-red-400"}`} />
  </div>
);



const ItemCard = ({ item }: { item: UserItemInterface }) => {
  const hasDiscount = item.discountPrice && item.discountPrice < (item.price ?? Infinity);
  const discountPct = hasDiscount
    ? Math.round(((item.price! - item.discountPrice!) / item.price!) * 100)
    : 0;

  return (
    <div className="item-card bg-white rounded-2xl border border-gray-100 shadow-sm flex overflow-hidden cursor-pointer h-full">
      {/* Text side */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <VegBadge isVeg={item.isVeg} />
            {item.rating.count > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-500">
                <FiStar size={9} className="fill-amber-400" />
                {item.rating.average.toFixed(1)}
              </span>
            )}
          </div>

          <h4 className="font-bold text-gray-900 text-sm leading-tight truncate">{item.name}</h4>

          {item.description && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
 
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-gray-900">{getDisplayPrice(item)}</span>
            {hasDiscount && (
              <>
                <span className="text-xs text-gray-400 line-through">₹{item.price}</span>
                <span className="text-[10px] font-bold text-[#ff4d2d] bg-red-50 px-1.5 py-0.5 rounded-full">
                  {discountPct}% off
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 mt-1">
            <FiShoppingBag size={10} className="text-gray-300" />
            <span className="text-[10px] text-gray-400">{item.shop?.name}</span>
            {item.shop?.deliveryTime && (
              <>
                <span className="text-gray-200">·</span>
                <FiClock size={10} className="text-gray-300" />
                <span className="text-[10px] text-gray-400">{item.shop.deliveryTime} min</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Image + Add button */}
      <div className="relative w-28 flex-shrink-0">
        {item.image?.url ? (
          <img src={item.image.url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center">
            <MdOutlineRestaurantMenu size={28} className="text-orange-200" />
          </div>
        )}

        {/* Add button */}
  
      </div>

        <button className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border-2 border-[#ff4d2d] text-[#ff4d2d] text-xs font-bold px-4 py-1 rounded-lg shadow-sm hover:bg-[#ff4d2d] hover:text-white transition">
          ADD
        </button>
    </div>
  );
};
export default ItemCard;