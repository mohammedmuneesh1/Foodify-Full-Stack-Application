"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../redux/store/store";
import type { CartAddonInterface } from "../../../types/userTypes";
import { RiDeleteBin6Line } from "react-icons/ri";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { REMOVE_CART_ITEM, UPDATE_CART_ITEM_QUANTITY } from "../../../api/cartApi";
import {  setCart } from "../../../redux/reducers/userSlice";
import UserLocationPicker from "../../../components/map/UserLocationPicker";

// interface Props {
//   cart: CartInterface | null;
// }

export default function CartPage() {

const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
const {cart} = useSelector((state:RootState) => state.user);

const dispatch = useDispatch();
//eslint-disable-next-line
const queryClient = useQueryClient();


  const [paymentMethod, setPaymentMethod] = useState<
    "cod" | "prepaid"
  >("cod");








  const {mutate:updateItemQuantityFn,isPending:isUpdatingQuantity} = useMutation({
    mutationFn(payload:{cartItemId:string,action:"increase" | "decrease"}) {
      const {cartItemId,action} = payload;
      return   UPDATE_CART_ITEM_QUANTITY(cartItemId,action === "increase" ? 1 : -1);
    },
    onSuccess:(data) => {
        if (!data?.success) {
          toast.error(data?.response || "Something went wrong.");
          return;
        }
        dispatch(setCart(data?.data ?? null)); // Update cart in Redux with latest from server
    },
    onError: (error) => {
        toast.error(error.message);
    },
    onSettled: () => {
        setUpdatingItemId(null);
    }
  });




  const manageQuantity = (itemId: string, action: "increase" | "decrease") => {
    setUpdatingItemId(itemId);
    updateItemQuantityFn({ cartItemId: itemId, action });
  }





    const { mutate:deleteItemFn, } = useMutation({
  mutationFn: (cartItemId:string) =>REMOVE_CART_ITEM(cartItemId),
  
    onMutate: () => {
    toast.loading("Removing Item...", {
      id: "cart-remove-item",
    });
  },
  onSuccess:(data,) => {  // onSuccess(response, itemId)
  toast.dismiss("cart-remove-item");
  if (!data?.success) {
    // ❌ API returned error (400, 401, etc.)
    toast.error(data?.response || "Something went wrong.");
    return;
  }

  // ✅ actual success
//   queryClient.invalidateQueries({ queryKey: ['getCart'] });
  toast.success(data?.response);
  dispatch(setCart(data?.data ?? null)); // Update cart in Redux with latest from server
  },
  onError: (error) => {
    toast.dismiss("cart-remove-item");
    toast.error(error.message);
  }
})






  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Your cart is empty
          </h1>
          <p className="text-gray-500 mt-2">
            Add some delicious food first.
          </p>
        </div>
      </div>
    );
  }


  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Your Cart
        </h1>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">

          {/* LEFT */}


          <section className="space-y-4">







            {cart?.items && cart?.items?.map(
                //eslint-disable-next-line
                (item:any) => (
<div
  key={item._id}
  className="bg-white rounded-2xl p-5 shadow-sm"
>
  <div className="flex gap-4">

    {/* IMAGE */}
    <div className="relative w-24 h-24 flex-shrink-0">
      <img
        src={item?.item?.image?.url}
        alt={item?.item?.name}
        className="w-full h-full object-cover rounded-xl"
      />

      {/* QUANTITY CONTROLS */}
      <div
        className="
          absolute
          -bottom-3
          left-1/2
          -translate-x-1/2
          bg-white
          border
          rounded-lg
          shadow-md
          flex
          items-center
          gap-3
          px-3
          py-1
        "
      >
        <button
        disabled={isUpdatingQuantity && updatingItemId === item._id}
          className="text-orange-500 font-bold text-lg"
          onClick={() => manageQuantity(item._id, "decrease")}
        >
          −
        </button>

        <span className="font-semibold">
            {
                updatingItemId === item._id ? (
                    <svg  className="animate-spin h-5 w-5 text-gray-500 mx-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"                  ></path>
                    </svg>
                ):(
                    item?.quantity
                )
            }
        </span>

        <button
        disabled={isUpdatingQuantity && updatingItemId === item._id}
          className="text-orange-500 font-bold text-lg"
          onClick={() => manageQuantity(item._id, "increase")}
        >
          +
        </button>
      </div>
    </div>

    {/* DETAILS */}
    <div className="flex-1">

        <div className="flex items-center gap-2 justify-between">
      <h2 className="font-semibold text-lg text-gray-900">
        {item?.item?.name}
      </h2>

      <RiDeleteBin6Line 
      onClick={()=>deleteItemFn(item._id)}
      className="text-rose-500 cursor-pointer
       hover:text-rose-600" />


        </div>

      {item.variant && (
        <p className="text-sm text-gray-500 mt-1">
          Variant: {item?.variant?.name}
        </p>
      )}

      {item.addons?.length > 0 && (
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-700">
            Addons
          </p>

          <ul className="mt-1 space-y-1">
            {item.addons.map(
              (
                addon: CartAddonInterface,
                index: number
              ) => (
                <li
                  key={index}
                  className="text-sm text-gray-500"
                >
                  {addon.name} × {addon.quantity} = ₹{addon.price} {addon.applyType === "per-item" ? "Per Item" : "Fixed"}
                </li>
              )
            )}
          </ul>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="font-semibold text-orange-500">
          ₹{item.totalPrice}
        </span>

        <span className="text-sm text-gray-500">
          Base ₹{item.basePrice}
        </span>
      </div>
    </div>
  </div>
</div>
            ))}
          </section>

          {/* RIGHT */}
          <aside className="space-y-5">





            {/*ADDRESS/LOCATION START */}
            <UserLocationPicker/>
            {/*ADDRESS/LOCATION END */}



            {/* Payment */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-semibold text-lg mb-4">
                Payment Method
              </h2>

              <div className="space-y-3">

                <label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer">
                  <input
                    type="radio"
                    checked={paymentMethod === "cod"}
                    onChange={() =>
                      setPaymentMethod("cod")
                    }
                  />
                  <div>
                    <p className="font-medium">
                      Cash on Delivery
                    </p>
                    <p className="text-sm text-gray-500">
                      Pay when food arrives
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer">
                  <input
                    type="radio"
                    checked={paymentMethod === "prepaid"}
                    onChange={() =>
                      setPaymentMethod("prepaid")
                    }
                  />
                  <div>
                    <p className="font-medium">
                      Online Payment
                    </p>
                    <p className="text-sm text-gray-500">
                      Razorpay / Stripe coming soon
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-semibold text-lg mb-4">
                Bill Details
              </h2>

              <div className="space-y-3">

                <div className="flex justify-between">
                  <span>Total Items</span>
                  <span>{cart?.items?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Item Total</span>
                  <span>₹{cart.totalAmount}</span>
                </div>

                {/* <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹40</span>
                </div> */}

                {/* <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span>₹5</span>
                </div> */}

                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>To Pay</span>
                  <span>
                    ₹{cart.totalAmount + 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Place Order */}
            <button
              className="
                w-full
                bg-orange-500
                hover:bg-orange-600
                transition-colors
                text-white
                font-semibold
                py-4
                rounded-2xl
              "
            >
              Place Order
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}






{/*ITEMS STRUCTURE START */}


{/* {
    "variant": {
        "_id": "69fca4bbcd9ac7d256be71d7",
        "name": "Qtr",
        "price": 180
    },
    "item": {
        "_id": "69fca4bbcd9ac7d256be71d6",
        "name": "Chicken Mandhi",
        "isAvailable": true,
        "image": {
            "dimension": {
                "width": 225,
                "height": 224
            },
            "type": "Cloudinary",
            "url": "https://res.cloudinary.com/mblog-cloud/image/upload/v1778164922/FOODIFY/item/b1bamlblrmjdakhxnr12.webp",
            "publicId": "FOODIFY/item/b1bamlblrmjdakhxnr12",
            "mimeType": "image/webp",
            "mediaType": "itemImage"
        }
    },
    "shop": {
        "_id": "69fb29af3d061eac524b85e7",
        "name": "Tavuk Danyasi",
        "image": {
            "dimension": {
                "width": 390,
                "height": 280
            },
            "type": "Cloudinary",
            "url": "https://res.cloudinary.com/mblog-cloud/image/upload/v1778067885/FOODIFY/shop/c7zlulw3mmtpvayu3cyn.webp",
            "publicId": "FOODIFY/shop/c7zlulw3mmtpvayu3cyn",
            "mimeType": "image/webp",
            "mediaType": "shopImage"
        },
        "deliveryTime": 30
    },
    "quantity": 1,
    "addons": [
        {
            "name": "Extra-Mayonise",
            "quantity": 1,
            "price": 50,
            "applyType": "fixed",
            "_id": "6a05c3248c4d30420a14f1e8"
        }
    ],
    "basePrice": 180,
    "totalPrice": 230,
    "_id": "6a05c3248c4d30420a14f1e7"
}
 */}



