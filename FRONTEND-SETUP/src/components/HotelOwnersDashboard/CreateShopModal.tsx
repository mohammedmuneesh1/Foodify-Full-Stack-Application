import React, { useState } from "react";
import LocationPicker from "../map/LocationPicker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CREATE_SHOP_API } from "../../api/hotelOwnerApi";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Shift {
  open: string;
  close: string;
}

interface DaySchedule {
  isOpen: boolean;
  shifts: Shift[];
}

type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

type Schedule = Record<DayKey, DaySchedule>;

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DAYS: DayKey[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const DEFAULT_SHIFT: Shift = { open: "09:00", close: "21:00" };

const buildDefaultSchedule = (): Schedule =>
  Object.fromEntries(
    DAYS.map((day) => [
      day,
      {
        isOpen: day !== "sunday", // Mon–Sat open, Sunday closed by default
        shifts: [{ ...DEFAULT_SHIFT }],
      },
    ])
  ) as Schedule;

// ─── Props ────────────────────────────────────────────────────────────────────
interface CreateShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const CreateShopModal: React.FC<CreateShopModalProps> = ({ isOpen, onClose }) => {

  const [step, setStep] = useState<"welcome" | "form">("welcome");

  const [form, setForm] = useState({
    name: "",
    description: "",
    categories: [] as string[],
    categoryInput: "",
     location: {
    address: "",
    city: "",
    state: "",
    pincode: "",
    coordinates: [0, 0] as [number, number], // [longitude, latitude]  
  },
    image: null as File | null,
    deliveryTime: "",
    isOpen: false,
    schedule: buildDefaultSchedule(),
  });

  
  const queryClient = useQueryClient();
  
  const { mutate,isPending } = useMutation({
  mutationFn: (data:FormData) =>CREATE_SHOP_API(data),
    onMutate: () => {
    toast.loading("Creating shop...", {
      id: "create-shop",
    });
  },
  onSuccess: (data) => {
  toast.dismiss("create-shop");
  if (!data?.success) {
    // ❌ API returned error (400, 401, etc.)
    toast.error(data?.response || "Something went wrong.");
    return;
  }
  // ✅ actual success
  queryClient.invalidateQueries({ queryKey: ['hotelOwnerShops'] });
  toast.success("Shop created successfully.");
  onClose();
  },
  onError: (error) => {
    toast.dismiss("create-shop");
    toast.error(error.message);
  }
})

  const finalCreationApiFn = ()=>{
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('categories', JSON.stringify(form.categories));
    formData.append('location', JSON.stringify(form.location));
    formData.append('shopImage', form.image as Blob);
    formData.append('deliveryTime', form.deliveryTime);
    formData.append('schedule', JSON.stringify(form.schedule));
    mutate(formData);

  }




  if (!isOpen) return null;

  // ── Category helpers ───────────────────────────────────────────────────────
  const addCategory = () => {
    if (!form.categoryInput.trim()) return;
    setForm({ ...form, categories: [...form.categories, form.categoryInput.trim()], categoryInput: "" });
  };

  const removeCategory = (index: number) => {
    const updated = [...form.categories];
    updated.splice(index, 1);
    setForm({ ...form, categories: updated });
  };

  // ── Schedule helpers ───────────────────────────────────────────────────────
  const toggleDay = (day: DayKey) => {
    setForm((prev) => ({
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

  const updateShift = (day: DayKey, shiftIndex: number, field: "open" | "close", value: string) => {
    const updatedShifts = [...form.schedule[day].shifts];
    updatedShifts[shiftIndex] = { ...updatedShifts[shiftIndex], [field]: value };
    setForm((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: { ...prev.schedule[day], shifts: updatedShifts },
      },
    }));
  };

  const addShift = (day: DayKey) => {
    setForm((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          shifts: [...prev.schedule[day].shifts, { ...DEFAULT_SHIFT }],
        },
      },
    }));
  };

  const removeShift = (day: DayKey, shiftIndex: number) => {
    const updatedShifts = form.schedule[day].shifts.filter((_, i) => i !== shiftIndex);
    setForm((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: { ...prev.schedule[day], shifts: updatedShifts },
      },
    }));
  };

  // ── Apply to all open days ─────────────────────────────────────────────────
  //eslint-disable-next-line
  const applyShiftToAll = (sourceDay: DayKey) => {
    const sourceShifts = form.schedule[sourceDay].shifts;
    setForm((prev) => {
      const newSchedule = { ...prev.schedule };
      DAYS.forEach((day) => {
        if (newSchedule[day].isOpen) {
          newSchedule[day] = { ...newSchedule[day], shifts: sourceShifts.map((s) => ({ ...s })) };
        }
      });
      return { ...prev, schedule: newSchedule };
    });
  };






  return (
    <div className="fixed inset-0 bg-black/40 flex flex-col items-center justify-center z-50 py-10 px-4">
      <div className="bg-white w-full max-w-2xl rounded-xl p-6 relative shadow-lg overflow-y-auto max-h-full">
        {/* Close */}
        {/* <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 text-xl">
          ✕
        </button> */}

        {/* ── STEP 1: WELCOME ── */}
        {step === "welcome" && (
          <div className="text-center space-y-6 py-6">
            <h2 className="text-2xl font-bold text-[#ff4d2d]">Get started with your shop 🚀</h2>
            <p className="text-gray-600">Create your shop and start selling your delicious food today.</p>
            <button
              onClick={() => setStep("form")}
              className="bg-[#ff4d2d] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#e63d1f] transition"
            >
              Get Started
            </button>
          </div>
        )}

        {/* ── STEP 2: FORM ── */}
        {step === "form" && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-gray-800">Create Your Shop</h2>

            {/* Shop Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name *</label>
              <input
                className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/40"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/40 resize-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Categories */}
            <div>
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
                {form.categories.map((cat, i) => (
                  <span key={i} className="bg-orange-50 border border-orange-200 text-orange-700 text-sm px-3 py-1 rounded-full flex items-center gap-1.5">
                    {cat}
                    <button onClick={() => removeCategory(i)} className="text-orange-400 hover:text-orange-700">✕</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="border border-gray-200 p-4 rounded-xl space-y-3">
              <h3 className="font-semibold text-gray-800">Location</h3>

              <div>
              <h3 className="font-medium text-gray-400 mb-1">Address</h3>
              <input
                placeholder="Address *"
                className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/40"
                value={form?.location?.address}
                onChange={(e) => setForm({ ...form, location:{...form.location, address: e.target.value} })}
              />
              </div>

              
              <div className="flex gap-2">
                <div>
              <h3 className="font-medium text-gray-400 mb-1">City</h3>  
                <input
                  placeholder="City"
                  className="border border-gray-300 p-2 rounded-lg w-full focus:outline-none"
                  value={form?.location?.city}
                 onChange={(e) => setForm({ ...form, location:{...form.location, city: e.target.value} })}
                />
                </div>

                <div>
                <h3 className="font-medium text-gray-400 mb-1">State</h3>  
                <input
                  placeholder="State"
                  className="border border-gray-300 p-2 rounded-lg w-full focus:outline-none"
                   value={form?.location?.state}
                 onChange={(e) => setForm({ ...form, location:{...form.location, state: e.target.value} })}
                />
                </div>

              </div>
              <div>
           <h3 className="font-medium text-gray-400 mb-1">Pincode</h3>  
              <input
                placeholder="Pincode"
                className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none"
               value={form?.location?.pincode}
                onChange={(e) => setForm({ ...form, location:{...form.location, pincode: e.target.value} })}
                
              />
              </div>


              {/*longitude && latitude START */}
                         <div className="flex gap-2">
                <div>
              <h3 className="font-medium text-gray-400 mb-1">Longitude</h3>  
                <input
                type="number"
                placeholder="Longitude"
                className="border border-gray-300 p-2 rounded-lg w-full focus:outline-none"
                value={form?.location?.coordinates[0]}
                onChange={(e) => setForm({ ...form, location:{...form.location, coordinates: [Number(e.target.value), form.location.coordinates[1]]}} )}
                />
                </div>

                <div>
                <h3 className="font-medium text-gray-400 mb-1">Latitude</h3>  
                <input
                type="number"
                placeholder="Latitude"
                className="border border-gray-300 p-2 rounded-lg w-full focus:outline-none"
                value={form?.location?.coordinates[1]}
                onChange={(e) => setForm({ ...form, location:{...form.location, coordinates: [ form.location.coordinates[0],Number(e.target.value)] }} )}
                />
                </div>

              </div>
              {/*langitude && latitude END */}




              {/*LOCATION SEARCHING OR CURRENT LOCATION GETING START */}
              <div>

              <h3 className="font-medium text-gray-400 mb-1">Select Location </h3>  
              <div className="h-120 bg-gray-100 flex items-center justify-center text-sm text-gray-400 rounded-lg overflow-hidden">
                <LocationPicker
  value={form.location}
  onChange={(locationData) => setForm({ ...form, location: locationData })}
/>


              </div>
              </div>
              {/*LOCATION SEARCHING OR CURRENT LOCATION GETING END */}
             
            </div>

            {/* Image */}
            <div>
              <h1 className="block text-sm font-medium text-gray-700 mb-1">Shop Image</h1>

              <label htmlFor= "image1" 
                >
                  <div
                 className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl  
                cursor-pointer hover:border-black transition flex flex-col items-center justify-center text-center" >
      <p className="text-sm text-gray-600">
        Click to upload image
      </p>
      <p className="text-xs text-gray-400 mt-1">
        PNG, JPG, JPEG
      </p>
      </div>

    </label>



              <input
              id="image1"
                type="file"
                accept="image/*"
                onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
                className="hidden"
              />
              {form.image && (
                <img src={URL.createObjectURL(form.image)} alt="preview" className="w-32 mt-2 rounded-lg" />
              )}
            </div>

            {/* Delivery Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time (minutes)</label>
              <input
                type="number"
                placeholder="e.g. 30"
                className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/40"
                value={form.deliveryTime}
                onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })}
              />
            </div>

            {/* Open Now toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Open Now</span>
              <button
                onClick={() => setForm({ ...form, isOpen: !form.isOpen })}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.isOpen ? "bg-[#ff4d2d]" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isOpen ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>

            {/* ── SCHEDULE ──────────────────────────────────────────────────── */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Weekly Schedule</h3>
                <p className="text-xs text-gray-500 mt-0.5">Set opening hours for each day. You can add split shifts (e.g. lunch break).</p>
              </div>

              <div className="divide-y divide-gray-100">
                {DAYS.map((day) => {
                  const dayData = form.schedule[day];
                  return (
                    <div key={day} className={`px-4 py-3 ${!dayData.isOpen ? "bg-gray-50/60" : ""}`}>
                      {/* Day header row */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {/* Toggle */}
                          <button
                            onClick={() => toggleDay(day)}
                            className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${dayData.isOpen ? "bg-[#ff4d2d]" : "bg-gray-300"}`}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${dayData.isOpen ? "translate-x-5" : "translate-x-0"}`} />
                          </button>

                          <span className={`text-sm font-semibold capitalize w-24 ${dayData.isOpen ? "text-gray-800" : "text-gray-400"}`}>
                            {day}
                          </span>

                          {!dayData.isOpen && (
                            <span className="text-xs text-gray-400 italic">Holiday / Closed</span>
                          )}
                        </div>

                        {/* Apply to all button — only on first open day */}
                        {/* {dayData.isOpen && (
                          <button
                            onClick={() => applyShiftToAll(day)}
                            className="text-xs text-[#ff4d2d] hover:underline"
                          >
                            Apply to all open days
                          </button>
                        )} */}
                      </div>

                      {/* Shifts */}
                      {dayData.isOpen && (
                        <div className="space-y-2 ml-[3.25rem]">
                          {dayData.shifts.map((shift, shiftIdx) => (
                            <div key={shiftIdx} className="flex items-center gap-2">
                              {/* Shift label */}
                              {dayData.shifts.length > 1 && (
                                <span className="text-xs text-gray-400 w-14 flex-shrink-0">
                                  {shiftIdx === 0 ? "Morning" : shiftIdx === 1 ? "Evening" : `Shift ${shiftIdx + 1}`}
                                </span>
                              )}

                              {/* Open time */}
                              <input
                                type="time"
                                value={shift.open}
                                onChange={(e) => updateShift(day, shiftIdx, "open", e.target.value)}
                                className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/40"
                              />
                              <span className="text-gray-400 text-sm">to</span>

                              {/* Close time */}
                              <input
                                type="time"
                                value={shift.close}
                                onChange={(e) => updateShift(day, shiftIdx, "close", e.target.value)}
                                className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/40"
                              />

                              {/* Remove shift */}
                              {dayData.shifts.length > 1 && (
                                <button
                                  onClick={() => removeShift(day, shiftIdx)}
                                  className="text-gray-400 hover:text-red-500 text-sm ml-1"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}

                          {/* Add split shift */}
                          {dayData.shifts.length < 3 && (
                            <button
                              onClick={() => addShift(day)}
                              className="text-xs text-[#ff4d2d] hover:underline mt-1 flex items-center gap-1"
                            >
                              + Add split shift
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <button 
            onClick={()=>finalCreationApiFn()}
            className="w-full bg-[#ff4d2d] text-white py-2.5 rounded-xl font-semibold hover:bg-[#e63d1f] transition">
                {isPending ? "Creating..." : "Create Shop"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateShopModal;