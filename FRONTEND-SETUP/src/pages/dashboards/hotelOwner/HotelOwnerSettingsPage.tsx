import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  FiEdit2,
  FiSave,
  FiClock,
  FiMapPin,
  FiTag,
  FiTruck,
  FiDollarSign,
} from "react-icons/fi";
import { IoMdRemoveCircleOutline } from "react-icons/io";
import toast from "react-hot-toast";


import LocationPicker from "../../../components/map/LocationPicker";
import { GET_SHOP_DATA_BY_ID,UPDATE_SHOP_API  } from "../../../api/hotelOwnerApi";

/* eslint-disable */

const HotelOwnerSettingsPage = () => {

  const { shopId } = useParams();

  const [isEdit, setIsEdit] = useState(false);

const [form, setForm] = useState<any>({
  name: "",
  description: "",
  categories: [],
  deliveryTime: "",
  deliveryFee: "",
  categoryInput: "",
  minOrderAmount: "",
  location: {
    address: "",
    city: "",
    state: "",
    pincode: "",
    coordinates: [0, 0], // [longitude, latitude]
  },
  schedule: {},
  // ✅ image fields
  image: null,
  existingImage: null,
});

  // ─── Fetch Shop ──────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["shop-details", shopId],
    queryFn: () =>
      GET_SHOP_DATA_BY_ID(shopId as string),
    enabled: !!shopId,
  });
console.log('dadta',data);


  // ─── Update Mutation ────────────────────────────────
  const { mutate, isPending } = useMutation({
    mutationFn:(val:{shopId:string,data: FormData})=> UPDATE_SHOP_API(val?.shopId,val?.data),


    onMutate: () => {
      toast.loading("Updating shop...", {
        id: "update-shop",
      });
    },

    onSuccess: () => {
      toast.success("Shop updated successfully", {
        id: "update-shop",
      });

      setIsEdit(false);
    },

    onError: (error: any) => {
      toast.error(error.message, {
        id: "update-shop",
      });
    },
  });

  // ─── Save ───────────────────────────────────────────
  const handleSave = () => {
const formData = new FormData();
formData.append("name", form.name);

formData.append(
  "description",
  form.description
);
formData.append(
  "deliveryTime",
  form.deliveryTime
);
formData.append(
  "deliveryFee",
  form.deliveryFee
);

formData.append(
  "location",
  JSON.stringify(form.location)
);

formData.append(
  "schedule",
  JSON.stringify(form.schedule)
);

formData.append(
  "categories",
  JSON.stringify(form.categories)
);

if (form.image) {
  formData.append("shopImage", form.image);
}


    mutate({
    shopId:shopId as string,
      data: formData,
    });

  };

      // ─── Populate Form ──────────────────────────────────
useEffect(() => {
  if (data?.data) {
    setForm({
      ...data.data?.shop,
      image: null,
      existingImage: data?.data?.shop?.image,
    });
  }
}, [data]);



  if (isLoading) {
    return (
      <div className="p-10 text-center text-gray-400">
        Loading shop settings...
      </div>
    );
  }



  //======================== CATEGORY FUNCTION START ==========================================
  const addCategory = () => {
    if (!form.categoryInput.trim()) return;
    setForm({ ...form, categories: [...form.categories, form.categoryInput.trim()], categoryInput: "" });
  };

const removeCategory = (index: number) => {
    const updated = [...form.categories];
    updated.splice(index, 1);
    setForm({ ...form, categories: updated });
  };


  //======================== CATEGORY FUNCTION END==========================================
  
  
  //======================== SCHEDULE FUNCTION START==========================================



  //⚠️⚠️schedule structure ⚠️⚠️
//   schedule: {
//   monday: {
//     isOpen: true,
//     shifts: [
//       {
//         open: "09:00",
//         close: "18:00",
//       },
//     ],
//   },

//   tuesday: {
//     isOpen: false,
//     shifts: [],
//   },
// }
  //⚠️⚠️schedule structure ⚠️⚠️

  const toggleDayStatus = (day: string) => {
  setForm((prev: any) => ({
    ...prev,
    schedule: {
      ...prev.schedule,
      [day]: {
        ...prev.schedule[day],
        isOpen: !prev.schedule[day].isOpen,
      },
    },
  }));
};

const changeShiftTime = (
  day:string,
  shiftIndex:number,
  field:"open" | "close",
  value:string
) => {
  setForm((prev:any) => {
    const updatedShifts = [
      ...prev.schedule[day].shifts,
    ];
    updatedShifts[shiftIndex] = {
      ...updatedShifts[shiftIndex],
      [field]: value,
    };

    return {
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          shifts: updatedShifts,
        },
      },
    };
  });
};



// const addOrRemoveShift = (type:"add"|"remove",day:string,shiftFrom:string,shiftTo:string,)=>{
const addOrRemoveShift = (type:"add"|"remove",day:string,currentIndex?:number)=>{
  switch(type){

    case "add":
     setForm((prev:any)=>{
      const selectedShift = prev.schedule[day];
      const updatedShifts = [
        ...selectedShift.shifts,
        { open: "09:00", close: "18:00"},
      ];
      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          [day]: {
            ...prev.schedule[day],
            shifts: updatedShifts,
          },
        },
      };
    });
    break;

    case "remove":
    const selectedShift = form.schedule[day];

    if(!selectedShift || selectedShift.shifts.length <= 1){
     toast.error("You can't remove last shift. Please disable the day.");
    }
    else if (currentIndex === undefined) {
      toast.error("Please select a shift to remove.");
    }

    else{
      setForm((prev:any)=>{
        return {
          ...prev,
          schedule:{
            ...prev.schedule,
            [day]:{
              ...prev.schedule[day],
              shifts:prev.schedule[day].shifts.filter((_:any,index:number)=>{
                return index !== currentIndex
              })
            }
          }
        }
      });

    }
     break;





    default:
      return toast.error("invalid type found for schedule. Please provide valid type. ")
      break;
  


  }

  



}

  //======================== SCHEDULE FUNCTION END==========================================



  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>
          <h1 className="text-3xl font-black text-gray-900">
            Shop Settings
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            Manage your restaurant details and preferences
          </p>
        </div>

        <button
          onClick={() => {
            if (isEdit) {
              handleSave();
            } else {
              setIsEdit(true);
            }
          }}
          disabled={isPending}
          className="h-11 px-5 rounded-xl bg-black text-white flex items-center justify-center gap-2 text-sm font-semibold hover:bg-gray-800 transition"
        >
          {isEdit ? (
            <>
              <FiSave size={16} />
              {isPending ? "Saving..." : "Save Changes"}
            </>
          ) : (
            <>
              <FiEdit2 size={16} />
              Edit Settings
            </>
          )}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left */}
        <div className="xl:col-span-2 space-y-6">

          {/* Basic Info */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">

            <h2 className="text-lg font-bold text-gray-900 mb-5">
              Basic Information
            </h2>

            <div className="space-y-5">


 {/* Shop Image Upload  start */}
<div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">

  <h2 className="text-lg font-bold text-gray-900 mb-5">
    Shop Image
  </h2>

  {/* Preview */}
  <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">

    {form.image ? (

      <img
        src={URL.createObjectURL(form.image)}
        alt="preview"
        className="w-full h-full object-cover"
      />

    ) : form.existingImage?.url ? (

      <img
        src={form.existingImage.url}
        alt="shop"
        className="w-full h-full object-cover"
      />

    ) : (

      <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
        No image selected
      </div>

    )}

  </div>

  {/* Upload */}
  {isEdit && (

    <label
      htmlFor="shopImage"
      className="mt-4 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-black transition"
    >

      <p className="text-sm font-medium text-gray-700">
        Click to upload new image
      </p>

      <p className="text-xs text-gray-400 mt-1">
        PNG, JPG, JPEG, WEBP
      </p>

      <input
        id="shopImage"
        type="file"
        accept="image/*"
        className="hidden"

        onChange={(e) => {

          const file = e.target.files?.[0];

          if (!file) return;

          setForm({
            ...form,
            image: file,
          });

        }}
      />

    </label>

  )}

</div>
{/* Shop Image Upload  end */}











              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Shop Name
                </label>

                <input
                  disabled={!isEdit}
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  className="mt-2 w-full h-12 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Description
                </label>

                <textarea
                  disabled={!isEdit}
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-orange-200"
                />
              </div>

              {/* =================================== CATEGORIES START =============================================*/}
            <div
            title={`${isEdit ? "Click Edit changes to activate category sections" : "Edit category sections and make save chanages "}`}
            className={` ${isEdit ? "opacity-100":"pointer-events-none opacity-50"}`}
            
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
              
              <div className="flex gap-2">
                <input
                  className="border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/40"
                  placeholder="e.g. Biryani"
                  value={form.categoryInput}
                  onChange={(e) => setForm({ ...form, categoryInput: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && addCategory()}
                />
                <button
                  onClick={addCategory}
                  className="bg-[#ff4d2d] text-white px-4 rounded-lg hover:bg-[#e63d1f] transition"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {form.categories.map(
                    (cat:string, i:number) => (
                  <span key={i} className="bg-orange-50 border border-orange-200 text-orange-700 text-sm px-3 py-1 rounded-full flex items-center gap-1.5">
                    {cat}
                    <button onClick={() => removeCategory(i)} className="text-orange-400 hover:text-orange-700">✕</button>
                  </span>
                ))}
              </div>
            </div>


                {/* =================================== CATEGORIES START =============================================*/}

            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">

            <div className="flex items-center gap-2 mb-5">
              <FiMapPin className="text-orange-500" />

              <h2 className="text-lg font-bold text-gray-900">
                Shop Location
              </h2>
            </div>

            <div className="space-y-4">

              <input
                disabled={!isEdit}
                value={form.location?.address || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    location: {
                      ...form.location,
                      address: e.target.value,
                    },
                  })
                }
                className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm outline-none"
              />

              {/* Map */}
              <div className="h-[500px] rounded-2xl overflow-hidden border border-gray-100">

                <LocationPicker
                  value={form.location}
                  onChange={(locationData) =>
                    setForm({
                      ...form,
                      location: locationData,
                    })
                  }
                />

              </div>

            </div>
          </div>

          {/* SCHEDULE START HERE */}
          <div
title={`${isEdit ? "Click Edit changes to activate category sections" : "Edit category sections and make save chanages "}`}
            className={`space-y-4 ${isEdit ? "opacity-100":"pointer-events-none opacity-50"}`}
           >


              <div className=" gap-2 mb-5">
              <div className="flex items-center gap-2 ">
              <FiClock className="text-orange-500" />
              <h2 className="text-lg font-bold text-gray-900">
                Opening Schedule
              </h2>
                </div>  
          <div>

      <p className="text-xs text-yellow-700 mt-1">
        {isEdit
          ? "You can now modify category sections and update details. Make sure to save your changes."
          : "Click 'Edit Changes' to enable category section editing."}
      </p>

    </div>
            </div>

  {Object.entries(form.schedule || {}).map(
    ([day, value]:[day:string,value:any]) => (
      <div
        key={day}
        className="border rounded-2xl p-4 space-y-3"
      >

        {/* Top Row */}
        <div className="flex items-center justify-between">

          <div>
            <p className="font-semibold capitalize">
              {day}
            </p>

            <p className="text-xs text-gray-400">
              Manage opening hours
            </p>
          </div>

          <button
            type="button"
            onClick={() => toggleDayStatus(day)}
            className={`px-4 py-1 rounded-full text-sm font-medium transition ${
              value?.isOpen
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {value?.isOpen ? "Open" : "Closed"}
          </button>

        </div>

        {/* Shift Inputs */}
        {value?.isOpen &&
          value?.shifts?.map((shift:any, index:number) => (
            <div
              key={index}
              className="flex items-center gap-3"
            >
              <input
                type="time"
                value={shift.open}
                onChange={(e) =>
                  changeShiftTime(
                    day,
                    index,
                    "open",
                    e.target.value
                  )
                }
                className="border rounded-xl px-3 py-2 w-full"
              />

              <span className="text-gray-400">
                to
              </span>

              <input
                type="time"
                value={shift.close}
                onChange={(e) =>
                  changeShiftTime(
                    day,
                    index,
                    "close",
                    e.target.value
                  )
                }
                className="border rounded-xl px-3 py-2 w-full"
              />

              {/* ⚠️⚠️ DONT DELETE <button
              onClick={()=>addOrRemoveShift("remove",day,index)}
               className="p-1 rounded-full bg-red-500 hover:bg-red-700 cursro-pointer"
               >
                <IoMdRemoveCircleOutline className="text-white"/>
              </button> */}
            </div>

          ))}



          {/* ⚠️⚠️ DONT DELETE <button
          onClick={()=>addOrRemoveShift("add",day)}
          className="px-3 py-2 bg-green-500 rounded-md cursor-pointer  text-white block ml-auto">
            Add Shift
          </button> */}

      </div>

    )
  )}

</div>
          {/* SCHEDULE END HERE */}


        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">

          {/* Shop Image */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">


                {form.image ? (

      <img
        src={URL.createObjectURL(form.image)}
        alt="preview"
        className="w-full h-full object-cover"
      />

    ) : form.existingImage?.url ? (

      <img
        src={form.existingImage.url}
        alt="shop"
        className="w-full h-full object-cover"
      />

    ) : (

      <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
        No image selected
      </div>

    )}



            <div className="p-5">

              <h2 className="text-xl font-black text-gray-900">
                {form.name}
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                {form.location?.city}, {form.location?.state}
              </p>

            </div>
          </div>

          {/* Delivery Settings */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">

            <h2 className="text-lg font-bold text-gray-900 mb-5">
              Delivery Settings
            </h2>

            <div className="space-y-5">

              {/* Delivery Time */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
                  <FiTruck />
                  Delivery Time
                </label>

                <input
                  disabled={!isEdit}
                  value={form.deliveryTime || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      deliveryTime: e.target.value,
                    })
                  }
                  className="mt-2 w-full h-11 rounded-xl border border-gray-200 px-4 text-sm"
                />
              </div>

              {/* Delivery Fee */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
                  <FiDollarSign />
                  Delivery Fee
                </label>

                <input
                  disabled={!isEdit}
                  value={form.deliveryFee}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      deliveryFee: e.target.value,
                    })
                  }
                  className="mt-2 w-full h-11 rounded-xl border border-gray-200 px-4 text-sm"
                />
              </div>

              {/* Min Order */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
                  <FiTag />
                  Minimum Order
                </label>

                <input
                  disabled={!isEdit}
                  value={form.minOrderAmount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      minOrderAmount: e.target.value,
                    })
                  }
                  className="mt-2 w-full h-11 rounded-xl border border-gray-200 px-4 text-sm"
                />
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default HotelOwnerSettingsPage;