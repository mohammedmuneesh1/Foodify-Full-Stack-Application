import { useState, useEffect, useCallback, } from "react";
import { FiX, FiPlus, FiMinus } from "react-icons/fi";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import type { CartPayloadInterface, UserItemInterface } from "../../types/userTypes";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/store/store";
import { closeCartModal, setCart } from "../../redux/reducers/userSlice";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ReplaceCartModal from "./ReplaceCartModal";
import { ADD_OR_REPLACE_CART_ITEM } from "../../api/cartApi";
 
// ─── Types ────────────────────────────────────────────────────────────────────
 
interface AddonSelection {
  addonId: string;
  name: string;
  price: number;
  quantity: number;
  pricingMode: "fixed" | "per_item";
}
 

 
// interface AddToCartModalProps {
//   item: UserItemInterface;
//   isOpen: boolean;
//   onClose: () => void;
//   onAddToCart: (payload: CartPayloadInterface) => Promise<{ status: number; data?: { shopName?: string } }>;
// }
 
 
// ─── Stepper ──────────────────────────────────────────────────────────────────
 
const Stepper = ({
  value,
  min = 0,
  max = 20,
  onChange,
  size = "md",
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  size?: "sm" | "md";
}) => {
  const btn = size === "sm" ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm";
  const num = size === "sm" ? "text-xs w-5" : "text-sm w-7";
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`${btn} rounded-lg border-2 border-[#ff4d2d] text-[#ff4d2d] flex items-center justify-center font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#ff4d2d] hover:text-white transition`}
      >
        <FiMinus size={size === "sm" ? 10 : 12} />
      </button>
      <span className={`${num} text-center font-bold text-gray-900`}>{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={`${btn} rounded-lg border-2 border-[#ff4d2d] text-[#ff4d2d] flex items-center justify-center font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#ff4d2d] hover:text-white transition`}
      >
        <FiPlus size={size === "sm" ? 10 : 12} />
      </button>
    </div>
  );
};
 
// ─── Main Component ───────────────────────────────────────────────────────────
 
const AddToCartModal = () => {



  //⚠️⚠️ CART MODAL DATA BELOW 

  const {cartModal,cart} = useSelector((state:RootState) => state.user);  
  const hasVariants = (cartModal?.item?.variants?.length ?? 0) > 0;
  const hasAddons = (cartModal?.item?.addons?.length ?? 0) > 0;

  
 
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);
  const [addonSelections, setAddonSelections] = useState<Record<string, AddonSelection>>({});
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const queryClient = useQueryClient();
 
  // Replace-cart modal state
  const [replaceModal, setReplaceModal] = useState<{
    show: boolean;
    existingShopName: string;
    pendingPayload: CartPayloadInterface | null;
  }>({ show: false, existingShopName: "", pendingPayload: null });
 
  // Reset state when item changes / modal opens
  useEffect(() => {
    if (cartModal?.isOpen) {
      setSelectedVariantIdx(0);
      setQuantity(1);
      setAddonSelections({});
      setLoading(false);
    }
  }, [cartModal?.isOpen, cartModal?.item._id]);
 
  const selectedVariant = hasVariants ? cartModal?.item.variants![selectedVariantIdx] : undefined;
 
  // ── Pricing helpers ──────────────────────────────────────────────────────
 
  const basePrice = selectedVariant?.price ?? cartModal?.item.discountPrice ?? cartModal?.item.price ?? 0;
 
  const addonTotal = Object.values(addonSelections).reduce((sum, sel) => {
    const addonQty = sel.pricingMode === "per_item" ? sel.quantity * quantity : sel.quantity;
    return sum + sel.price * addonQty;
  }, 0);
 
  const grandTotal = basePrice * quantity + addonTotal;
 
  // ── Addon helpers ─────────────────────────────────────────────────────────
 
  //eslint-disable-next-line
  const toggleAddon = (addon: UserItemInterface["addons"][number]) => {
    setAddonSelections((prev) => {
      if (prev[addon._id]) {
        const next = { ...prev };
        delete next[addon._id];
        return next;
      }
      return {
        ...prev,
        [addon._id]: {
          addonId: addon._id,
          name: addon.name,
          price: addon.price,
          quantity: 1,
          pricingMode: "fixed",
        },
      };
    });
  };
 
  const updateAddonQty = (addonId: string, qty: number) => {
    setAddonSelections((prev) => ({ ...prev, [addonId]: { ...prev[addonId], quantity: qty } }));
  };
 
  const updateAddonMode = (addonId: string, mode: "fixed" | "per_item") => {
    setAddonSelections((prev) => ({ ...prev, [addonId]: { ...prev[addonId], pricingMode: mode } }));
  };
 
  // ── Submit ───────────────────────────────────────────────────────────────
 
  const buildPayload = useCallback(
    (forceReplaceCart = false): CartPayloadInterface => ({
      itemId: cartModal?.item._id ?? "",
      quantity,
      ...(selectedVariant ? { ...selectedVariant,_id:selectedVariantIdx } : {}),
      variantId: selectedVariant
      //eslint-disable-next-line
        ? (cartModal?.item.variants!.find((v) => v.price === selectedVariant.price) as any)?._id ??
          String(selectedVariantIdx)
        : undefined,
      addons: Object.values(addonSelections).map((sel) => ({
        addonId: sel.addonId,
        quantity: sel.pricingMode === "per_item" ? sel.quantity * quantity : sel.quantity,
        applyType: sel.pricingMode,
        price: sel.price,
      })),
      forceReplaceCart,
    }),
    [cartModal?.item, quantity, selectedVariant, selectedVariantIdx, addonSelections]
  );
 

  //------------------------ HANDLE SUBMIT FUNCTION START ------------------------

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { mutateAsync, isPending } =
  useMutation(
    {
    mutationFn: (val: object) =>{
      return ADD_OR_REPLACE_CART_ITEM(val)
    },
    onSuccess: (data) => {
      console.log(data);
    },
  });





  const handleSubmit = async (forceReplace = false) => {
    setLoading(true);
    const payload = buildPayload(forceReplace);
    try {
      const result = await mutateAsync(payload);

      if(result?.success){

        //if cart is null then refetch the cart api 
        if(cart === null){
            await queryClient.refetchQueries({queryKey: ["getCart"],});
        }
        else{
//             dispatch(setCart({
//                 ...cart,

//                 //ITEMS MAPPING START

//                 items: cart.items.find((item) => {
//                     return item._id === payload.itemId
//                 }) ? 
//                 //case 1 if item is already in cart , then just update the quantity
//                 [
//                     ...cart.items.map((item) => {
//                         if(item._id === payload.itemId){
//                             return {
//                                 ...item,
//                                 quantity: item.quantity + payload.quantity
//                             }
//                         }
//                     })
//                 ]: (() => {

// const createCartItem = () => ({
//   _id: crypto.randomUUID(),

//   item: {
//     _id: cartModal?.item._id,
//     name: cartModal?.item.name,
//     isAvailable: cartModal?.item?.isAvailable ?? true,
//     image: cartModal?.item.image,
//   },

//   shop: cartModal?.item.shop,

//   quantity: payload.quantity,

//   addons: payload.addons ?? [],

//   ...(hasVariants
//     ? { variant: payload.selectedVariant }
//     : {}),

//   basePrice,

//   totalPrice: grandTotal,
// });




//       return [
//         ...cart.items,
//         createCartItem(),
 
//       ];
//     })()
//                 //ITEMS MAPPING END

//             }))
   dispatch(setCart(result?.data ?? null));

        }

      }

      if (result && result.statusCode === 409) {
        setReplaceModal({
          show: true,
          existingShopName: result.data?.shopName ?? "another restaurant",
          pendingPayload: payload,
        });
        setLoading(false);
        return;
      }

 

      //⚠️ if will return 409 on 

      if(result?.statusCode !== 409 && !result?.success){
        return toast.error(result?.response ?? "Something went wrong.");
    }


      // success
      dispatch(closeCartModal());
    } catch {
      setLoading(false);
    }
    setLoading(false);
  };
  //------------------------ HANDLE SUBMIT FUNCTION END ------------------------


  //------------------------ REPLACE THE EXISTING CART FORCEFULLY IF THE ITEM FROM ANOTHER SHOP START  ------------------------
  
  const handleReplace = async () => {
      setReplaceModal((p) => ({ ...p, show: false }));
      await handleSubmit(true);
    };

  
    //------------------------ REPLACE THE EXISTING CART FORCEFULLY IF THE ITEM FROM ANOTHER SHOP START  ------------------------




 


//   if(!result) return null;
  if (!cartModal || !cartModal.isOpen) return null;
 
  // ── Render ────────────────────────────────────────────────────────────────




 
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={()=>dispatch(closeCartModal())}
        />
 
        {/* Sheet */}
        <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
          {/* Header image strip */}
          <div className="relative h-36 flex-shrink-0">
            {cartModal?.item.image?.url ? (
              <img src={cartModal?.item.image.url} alt={cartModal?.item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center">
                <MdOutlineRestaurantMenu size={48} className="text-orange-200" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <button
              onClick={()=>dispatch(closeCartModal())}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/40 transition"
            >
              <FiX size={16} />
            </button>
            <div className="absolute bottom-3 left-4 right-14">
              <h2 className="text-white font-bold text-lg leading-tight">{cartModal?.item.name}</h2>
              {cartModal?.item.description && (
                <p className="text-white/75 text-xs mt-0.5 line-clamp-1">{cartModal?.item.description}</p>
              )}
            </div>
          </div>
 
          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-4 py-4 space-y-5">
 
            {/* ── Variants ── */}
            {hasVariants && (
              <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                  Choose Variant
                </h3>
                <div className="space-y-2">
                  {cartModal?.item.variants!.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedVariantIdx(i)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border-2 transition ${
                        selectedVariantIdx === i
                          ? "border-[#ff4d2d] bg-red-50"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedVariantIdx === i ? "border-[#ff4d2d]" : "border-gray-300"
                          }`}
                        >
                          {selectedVariantIdx === i && (
                            <div className="w-2 h-2 rounded-full bg-[#ff4d2d]" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{v.name}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">₹{v.price}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}
 
            {/* ── Addons ── */}
            {hasAddons && (
              <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                  Add-ons <span className="text-gray-300 font-normal normal-case">(optional)</span>
                </h3>
                <div className="space-y-3">
                  {cartModal?.item.addons!.map((addon) => {
                    const sel = addonSelections[addon._id];
                    const isSelected = !!sel;
                    const effectiveQty =
                      isSelected && sel.pricingMode === "per_item"
                        ? sel.quantity * quantity
                        : sel?.quantity ?? 1;
 
                    return (
                      <div
                        key={addon._id}
                        className={`rounded-xl border-2 transition overflow-hidden ${
                          isSelected ? "border-[#ff4d2d]" : "border-gray-100"
                        }`}
                      >
                        {/* Top row */}
                        <div className="flex items-center justify-between px-3.5 py-2.5">
                          <button
                            onClick={() => toggleAddon(addon)}
                            className="flex items-center gap-2.5 flex-1 text-left"
                          >
                            <div
                              className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center flex-shrink-0 w-[18px] h-[18px] ${
                                isSelected ? "border-[#ff4d2d] bg-[#ff4d2d]" : "border-gray-300"
                              }`}
                            >
                              {isSelected && (
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                  <path
                                    d="M1 4L3.5 6.5L9 1"
                                    stroke="white"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-800">{addon.name}</span>
                          </button>
                          <span className="text-sm font-bold text-gray-900 ml-2">
                            +₹{addon.price}
                          </span>
                        </div>
 
                        {/* Expanded controls */}
                        {isSelected && (
                          <div className="bg-gray-50 px-3.5 pb-3 pt-2 space-y-2.5 border-t border-gray-100">
                            {/* Qty stepper */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 font-medium">Quantity</span>
                              <Stepper
                                size="sm"
                                value={sel.quantity}
                                min={1}
                                onChange={(v) => updateAddonQty(addon._id, v)}
                              />
                            </div>
 
                            {/* Pricing mode */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 font-medium">Pricing</span>
                              <div className="flex rounded-lg overflow-hidden border border-gray-200 text-[11px] font-semibold">
                                {(["fixed", "per_item"] as const).map((mode) => (
                                  <button
                                    key={mode}
                                    onClick={() => updateAddonMode(addon._id, mode)}
                                    className={`px-2.5 py-1 transition ${
                                      sel.pricingMode === mode
                                        ? "bg-[#ff4d2d] text-white"
                                        : "text-gray-500 hover:bg-gray-100"
                                    }`}
                                  >
                                    {mode === "fixed" ? "Fixed" : "Per item"}
                                  </button>
                                ))}
                              </div>
                            </div>
 
                            {/* Summary line */}
                            {sel.pricingMode === "per_item" && (
                              <p className="text-[11px] text-[#ff4d2d] font-medium bg-red-50 rounded-lg px-2.5 py-1.5">
                                {sel.quantity} add-on × {quantity} item
                                {quantity > 1 ? "s" : ""} ={" "}
                                <strong>{effectiveQty} total</strong> × ₹{addon.price} = ₹
                                {effectiveQty * addon.price}
                              </p>
                            )}
                            {sel.pricingMode === "fixed" && (
                              <p className="text-[11px] text-gray-400">
                                {sel.quantity} × ₹{addon.price} = ₹{sel.quantity * addon.price}{" "}
                                (regardless of item quantity)
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
 
          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-4 flex-shrink-0 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Total</span>
                <span className="text-xl font-bold text-gray-900">₹{grandTotal}</span>
              </div>
              <Stepper value={quantity} min={1} onChange={setQuantity} />
            </div>
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#ff4d2d] text-white font-bold text-sm shadow-lg shadow-red-100 hover:bg-[#e63d1f] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Adding…" : `Add to Cart · ₹${grandTotal}`}
            </button>
          </div>
        </div>
      </div>
 
      {/* Replace cart confirmation */}
      {replaceModal.show && (
        <ReplaceCartModal
          shopName={replaceModal.existingShopName}
          newShopName={cartModal?.item.shop.name ?? "Restaurant"}
          onCancel={() => setReplaceModal((p) => ({ ...p, show: false }))}
          onReplace={handleReplace}
        />
      )}
 
      {/* Animations */}
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.92); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        .animate-slide-up  { animation: slide-up  0.28s cubic-bezier(.22,.68,0,1.2) both; }
        .animate-scale-in  { animation: scale-in  0.22s cubic-bezier(.22,.68,0,1.2) both; }
      `}</style>
    </>
  );
};
 
export default AddToCartModal;










//CARTMODAL data without addd on 

// {
  
// "item": {
// "rating": {
// "average": 0,
// "count": 0
// },
// "clicks": 0,
// "_id": "69fcb748110bcec5292ba597",
// "shop": "69fb29af3d061eac524b85e7",
// "name": "Chicken Biriyani",
// "description": "Chicken Briyani discription",
// "price": 100,
// "discountPrice": null,
// "category": "Main Course",
// "isVeg": false,
// "isAvailable": true,
// "image": {
// "dimension": {
// "width": 183,
// "height": 275
// },
// "type": "Cloudinary",
// "url": "https://res.cloudinary.com/mblog-cloud/image/upload/v1778169671/FOODIFY/item/v9odgxsnasugafg7v4t7.webp",
// "publicId": "FOODIFY/item/v9odgxsnasugafg7v4t7",
// "mimeType": "image/webp",
// "mediaType": "itemImage"
// },
// "isDeleted": false,
// "preparationTime": 0,
// "variants": [],
// "addons": [],
// "createdAt": "2026-05-07T16:01:12.533Z",
// "updatedAt": "2026-05-07T16:01:12.533Z",
// "__v": 0
// },
// "isOpen": true
// }