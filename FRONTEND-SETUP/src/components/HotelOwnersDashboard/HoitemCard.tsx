import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiEdit2, FiStar, FiToggleLeft, FiToggleRight, FiTrash2 } from "react-icons/fi";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import { DELETE_MENU_ITEM } from "../../api/hotelOwnerApi";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

const HoitemCard = ({
  item,
  onEdit,
  onToggleAvail,
}: {
//eslint-disable-next-line
  item: any;
  //eslint-disable-next-line
  onEdit: (item: any) => void;
  onToggleAvail: (id: string, val: boolean) => void;
}) => {

  const {shopId} = useParams();
  const hasVariants = item.variants?.length > 0;
  const queryClient = useQueryClient();


  const displayPrice = hasVariants
  //eslint-disable-next-line
    ? `₹${Math.min(...item.variants.map((v: any) => v.price))}+`
    : item.discountPrice
    ? null
    : `₹${item.price}`;

//=====CREATE ITEMS =====
  const { mutate,isPending } = useMutation({
  mutationFn: () =>DELETE_MENU_ITEM(shopId as string,item?._id as string),

    onMutate: () => {
    toast.loading("Deleting Item...", {
      id: "delete-item",
    });
  },
  onSuccess: (data) => {
  toast.dismiss("delete-item");
  if (!data?.success) {
    // ❌ API returned error (400, 401, etc.)
    toast.error(data?.response || "Something went wrong.");
    return;
  }
  // ✅ actual success
  queryClient.invalidateQueries({ queryKey: ['shopMenu'] });
  toast.success(data?.response);
  },
  onError: (error) => {
    toast.dismiss("edit-item");
    toast.error(error.message);
  }
})
    


const onDeleteFn = ()=>{

    const confirmDelete = window.confirm( "Are you sure you want to delete this item?");
  if (!confirmDelete) return;
  mutate();
}
 



  return (
    <div className={`item-card bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex ${!item.isAvailable ? "opacity-60" : ""}`}>
      {/* Image */}
      <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center overflow-hidden">
        {item.image?.url ? (
          <img src={item.image.url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <MdOutlineRestaurantMenu size={28} className="text-orange-200" />
        )}
      </div>
 
      {/* Content */}
      <div className="flex-1 p-3 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <VegDot isVeg={item.isVeg} />
            <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
          </div>
          {!item.isAvailable && (
            <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full flex-shrink-0 font-medium">
              Off
            </span>
          )}
        </div>
 
        {item.description && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.description}</p>
        )}
 
        {/* Price */}
        <div className="flex items-center gap-2 mt-1.5">
          {item.discountPrice && !hasVariants ? (
            <>
              <span className="text-sm font-bold text-[#ff4d2d]">₹{item.discountPrice}</span>
              <span className="text-xs text-gray-400 line-through">₹{item.price}</span>
            </>
          ) : (
            <span className="text-sm font-bold text-gray-900">{displayPrice}</span>
          )}
 
          {item.rating?.count > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-amber-500 ml-auto">
              <FiStar size={10} className="fill-amber-400" />
              {item.rating.average.toFixed(1)}
              <span className="text-gray-400">({item.rating.count})</span>
            </span>
          )}
        </div>
 
        {/* Variants pills */}
        {hasVariants && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {item.variants.slice(0, 3).map(
                //eslint-disable-next-line
                (v: any, i: number) => (
              <span key={i} className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-1.5 py-0.5 rounded-full font-medium">
                {v.name} ₹{v.price}
              </span>
            ))}
            {item.variants.length > 3 && (
              <span className="text-xs text-gray-400">+{item.variants.length - 3} more</span>
            )}
          </div>
        )}
 
        {/* Actions */}
        <div className="flex items-center gap-2 mt-2">
          {/* Toggle availability */}
          <button
            onClick={() => onToggleAvail(item._id, !item.isAvailable)}
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition ${
              item.isAvailable
                ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                : "text-gray-400 bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {item.isAvailable ? <FiToggleRight size={13} /> : <FiToggleLeft size={13} />}
            {item.isAvailable ? "Available" : "Unavailable"}
          </button>
 
          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => onEdit(item)}
              className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 hover:bg-blue-100 transition"
            >
              <FiEdit2 size={12} />
            </button>
            <button
            disabled={isPending}
              onClick={() => onDeleteFn()}
              className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition"
            >
              <FiTrash2 size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoitemCard;

//eslint-disable-next-line
const VegDot = ({ isVeg }: { isVeg: boolean }) => (
  <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 ${isVeg ? "border-emerald-500" : "border-red-400"}`}>
    <div className={`w-2 h-2 rounded-full ${isVeg ? "bg-emerald-500" : "bg-red-400"}`} />
  </div>
);