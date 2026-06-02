import { useState, useEffect } from "react";
import { FiX, FiPlus, FiTrash2, FiUpload } from "react-icons/fi";
import type { Addon, ItemFormData, ItemFormModalProps, Variant } from "../../types/DashboardTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CREATE_MENU_ITEM, EDIT_MENU_ITEM } from "../../api/hotelOwnerApi";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

/*eslint-disable */

const CATEGORIES = [
  "Snacks","Main Course","Desserts","Pizza","Burgers",
  "Sandwiches","South Indian","North Indian","Chinese","Fast Food","Others",
];

const EMPTY_FORM: ItemFormData = {
  name: "", description: "", price: "", discountPrice: "",
  category: "", isVeg: false, isAvailable: true,
  variants: [], addons: [], image: null, existingImage: null,
  preparationTime:0,
};

// ─── Component ────────────────────────────────────────────────────────────────
const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen, onClose, editItem, isSubmitting = false,
}) => {
  const [form, setForm] = useState<ItemFormData>(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "variants" | "addons">("basic");
  const {shopId} = useParams();
  const isEdit = !!editItem?._id;

  // Populate form when editing
  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setForm({ ...EMPTY_FORM, ...editItem, image: null });
        setImagePreview(editItem.existingImage?.url ?? null);
      } else {
        setForm(EMPTY_FORM);
        setImagePreview(null);
      }
      setActiveTab("basic");
    }
  }, [isOpen, editItem]);


  // ── Helpers ─────────────────────────────────────────────────────────────────
  const set = (key: keyof ItemFormData, val: any) =>
    setForm((p) => ({ ...p, [key]: val }));

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    set("image", file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  // Variants
  const addVariant = () =>
    set("variants", [...form.variants, { name: "", price: "", discount: { isActive: false } }]);

  const updateVariant = (i: number, key: keyof Variant, val: any) => {
    const updated = [...form.variants];
    updated[i] = { ...updated[i], [key]: val };
    set("variants", updated);
  };

  const removeVariant = (i: number) =>
    set("variants", form.variants.filter((_, idx) => idx !== i));

  // Addons
  const addAddon = () =>
    set("addons", [...form.addons, { name: "", price: "" }]);

  const updateAddon = (i: number, key: keyof Addon, val: any) => {
    const updated = [...form.addons];
    updated[i] = { ...updated[i], [key]: val };
    set("addons", updated);
  };

  const removeAddon = (i: number) =>
    set("addons", form.addons.filter((_, idx) => idx !== i));




  //------------------------- mutation query for edit/add item ----------------------------
  
  const queryClient = useQueryClient();

//=====CREATE ITEMS =====
  const { mutate:createItemMutate,isPending:isCreateItemPending } = useMutation({
  mutationFn: (data:FormData) =>CREATE_MENU_ITEM(shopId as string,data),
  
    onMutate: () => {
    toast.loading("Creating Item...", {
      id: "create-item",
    });
  },
  onSuccess: (data) => {
  toast.dismiss("create-item");
  if (!data?.success) {
    // ❌ API returned error (400, 401, etc.)
    toast.error(data?.response || "Something went wrong.");
    return;
  }
  // ✅ actual success
  queryClient.invalidateQueries({ queryKey: ['shopMenu'] });
  toast.success(data?.response);
  onClose();
  },
  onError: (error) => {
    toast.dismiss("create-item");
    toast.error(error.message);
  }
})
//=====CREATE ITEMS =====
  const { mutate:editItemMutate,isPending:isEditItemPending } = useMutation({
  mutationFn: (data:FormData) =>EDIT_MENU_ITEM(shopId as string,editItem?._id as string, data),
    onMutate: () => {
    toast.loading("Editing Item...", {
      id: "edit-item",
    });
  },
  onSuccess: (data) => {
  toast.dismiss("edit-item");
  if (!data?.success) {
    // ❌ API returned error (400, 401, etc.)
    toast.error(data?.response || "Something went wrong.");
    return;
  }
  // ✅ actual success
  queryClient.invalidateQueries({ queryKey: ['shopMenu'] });
  toast.success(data?.response);
  onClose();
  },
  onError: (error) => {
    toast.dismiss("edit-item");
    toast.error(error.message);
  }
})



  //------------------------- mutation query for edit/add item ----------------------------











  const handleSubmit = () =>{

    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("category", form.category);
    formData.append("price", String(form.price));
    formData.append("isVeg", String(form.isVeg));
    if(form.image){
      formData.append("itemImage", form.image);
    }
    formData.append("isAvailable", String(form.isAvailable));
    formData.append("discountPrice", String(form.discountPrice));
    formData.append("variants", JSON.stringify(form.variants));
    formData.append("addons", JSON.stringify(form.addons));
    formData.append("preparationTime", String(form.preparationTime));
if(isEdit){
  editItemMutate(formData);
}else{
  createItemMutate(formData);
}
  };

  const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/30 focus:border-[#ff4d2d] transition placeholder:text-gray-400";
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

if (!isOpen) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .modal-tab { transition: all .18s; }
        .modal-tab.tab-active { color: #ff4d2d; border-bottom: 2px solid #ff4d2d; }
        .modal-tab:not(.tab-active) { color: #9ca3af; border-bottom: 2px solid transparent; }
        .toggle-track { transition: background .2s; }
        .toggle-thumb { transition: transform .2s; }
        .item-row { transition: background .15s; }
        .item-row:hover { background: #fff8f6; }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="bg-white w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <div>
              <h2 style={{ fontFamily: "'Syne', sans-serif" }}
                className="text-lg font-extrabold text-gray-900">
                {isEdit ? "Edit Item" : "Add New Item"}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {isEdit ? "Update your menu item details" : "Fill in the details to add a new dish"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
            >
              <FiX size={16} />
            </button>
          </div>

          {/* ── Tabs ── */}
          <div className="flex border-b border-gray-100 px-6 flex-shrink-0">
            {(["basic", "variants", "addons"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`modal-tab py-3 mr-6 text-sm font-semibold capitalize ${activeTab === tab ? "tab-active" : ""}`}
              >
                {tab}
                {tab === "variants" && form.variants.length > 0 && (
                  <span className="ml-1.5 text-xs bg-[#ff4d2d] text-white px-1.5 py-0.5 rounded-full">
                    {form.variants.length}
                  </span>
                )}
                {tab === "addons" && form.addons.length > 0 && (
                  <span className="ml-1.5 text-xs bg-[#ff4d2d] text-white px-1.5 py-0.5 rounded-full">
                    {form.addons.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Body ── */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* ════ BASIC TAB ════ */}
            {activeTab === "basic" && (
              <>
                {/* Image upload */}
                <div>
                  <label className={labelCls}>Item Photo</label>
                  <label className="flex items-center gap-4 cursor-pointer">
                    <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0 hover:border-[#ff4d2d] transition">
                      {imagePreview ? (
                        <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <FiUpload size={20} className="text-gray-300" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {imagePreview ? "Change photo" : "Upload photo"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">JPG, PNG up to 5MB</p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                  </label>
                </div>

                {/* Name */}
                <div>
                  <label className={labelCls}>Item Name *</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. Chicken Biryani"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    rows={2}
                    className={inputCls + " resize-none"}
                    placeholder="Short description of the dish..."
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className={labelCls}>Category *</label>
                  <select
                    className={inputCls}
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Price row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Price (₹) {form.variants.length === 0 && "*"}</label>
                    <input
                      type="number"
                      className={inputCls}
                      placeholder="0.00"
                      value={form.price}
                      disabled={form.variants.length > 0}
                      onChange={(e) => set("price", e.target.value)}
                    />
                    {form.variants.length > 0 && (
                      <p className="text-xs text-amber-500 mt-1">Set per variant</p>
                    )}
                  </div>
 
                  {/* 
                  ⚠️⚠️ temporarly disabled  discount price section
                  <div>
                    <label className={labelCls}>Discount Price (₹)</label>
                    <input
                      type="number"
                      className={inputCls}
                      placeholder="0.00"
                      value={form.discountPrice}
                      onChange={(e) => set("discountPrice", e.target.value)}
                    />
                  </div> 
                  ⚠️⚠️ temporarly disabled discount price section 
                  */}
                </div>

                {/* Toggles row */}
                <div className="flex items-center gap-6">
                  {/* Veg toggle */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => set("isVeg", !form.isVeg)}
                      className={`toggle-track relative w-10 h-5 rounded-full flex-shrink-0 ${form.isVeg ? "bg-emerald-400" : "bg-gray-200"}`}
                    >
                      <span className={`toggle-thumb absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow ${form.isVeg ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center ${form.isVeg ? "border-emerald-500" : "border-red-400"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${form.isVeg ? "bg-emerald-500" : "bg-red-400"}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{form.isVeg ? "Veg" : "Non-Veg"}</span>
                    </div>
                  </div>

                  {/* Available toggle */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => set("isAvailable", !form.isAvailable)}
                      className={`toggle-track relative w-10 h-5 rounded-full flex-shrink-0 ${form.isAvailable ? "bg-[#ff4d2d]" : "bg-gray-200"}`}
                    >
                      <span className={`toggle-thumb absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow ${form.isAvailable ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                      {form.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* ════ VARIANTS TAB ════ */}
            {activeTab === "variants" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Variants</p>
                    <p className="text-xs text-gray-400">e.g. Small / Medium / Large, Half / Full</p>
                  </div>
                  <button
                    onClick={addVariant}
                    className="flex items-center gap-1.5 bg-[#ff4d2d] text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-[#e63d1f] transition"
                  >
                    <FiPlus size={13} /> Add
                  </button>
                </div>

                {form.variants.length === 0 && (
                  <div className="text-center py-10 text-gray-300">
                    <p className="text-sm">No variants yet</p>
                    <p className="text-xs mt-1">Add variants if your item has size/portion options</p>
                  </div>
                )}

                {form.variants.map((v, i) => (
                  <div key={i} className="item-row border border-gray-100 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-400 uppercase">Variant {i + 1}</span>
                      <button
                        onClick={() => removeVariant(i)}
                        className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Name</label>
                        <input
                          className={inputCls}
                          placeholder="e.g. Large"
                          value={v.name}
                          onChange={(e) => updateVariant(i, "name", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Price (₹)</label>
                        <input
                          type="number"
                          className={inputCls}
                          placeholder="0.00"
                          value={v.price}
                          onChange={(e) => updateVariant(i, "price", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Variant discount */}

                      {/*⚠️⚠️⚠️  TEMPORARLY DISABLED PRICING SECTION */}
                    {/* <div className="border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => updateVariant(i, "discount", { ...v.discount, isActive: !v.discount?.isActive })}
                          className={`toggle-track relative w-8 h-4 rounded-full flex-shrink-0 ${v.discount?.isActive ? "bg-[#ff4d2d]" : "bg-gray-200"}`}
                        >
                          <span className={`toggle-thumb absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow ${v.discount?.isActive ? "translate-x-4" : "translate-x-0"}`} />
                        </button>
                        <span className="text-xs font-medium text-gray-500">Discount</span>
                      </div>

                      {v.discount?.isActive && (
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className={labelCls}>Disc. Price</label>
                            <input type="number" className={inputCls} placeholder="₹"
                              value={v.discount?.price ?? ""}
                              onChange={(e) => updateVariant(i, "discount", { ...v.discount, price: e.target.value })} />
                          </div>
                          <div>
                            <label className={labelCls}>Valid From</label>
                            <input type="date" className={inputCls}
                              value={v.discount?.validFrom ?? ""}
                              onChange={(e) => updateVariant(i, "discount", { ...v.discount, validFrom: e.target.value })} />
                          </div>
                          <div>
                            <label className={labelCls}>Valid Upto</label>
                            <input type="date" className={inputCls}
                              value={v.discount?.validUpto ?? ""}
                              onChange={(e) => updateVariant(i, "discount", { ...v.discount, validUpto: e.target.value })} />
                          </div>
                        </div>
                      )}
                    </div> */}
                    {/*⚠️⚠️⚠️  TEMPORARLY DISABLED PRICING SECTION */}
                  </div>
                ))}
              </div>
            )}

            {/* ════ ADDONS TAB ════ */}
            {activeTab === "addons" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Add-ons</p>
                    <p className="text-xs text-gray-400">e.g. Extra Cheese, Garlic Bread</p>
                  </div>
                  <button
                    onClick={addAddon}
                    className="flex items-center gap-1.5 bg-[#ff4d2d] text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-[#e63d1f] transition"
                  >
                    <FiPlus size={13} /> Add
                  </button>
                </div>

                {form.addons.length === 0 && (
                  <div className="text-center py-10 text-gray-300">
                    <p className="text-sm">No add-ons yet</p>
                    <p className="text-xs mt-1">Add extras customers can optionally include</p>
                  </div>
                )}

                {form.addons.map((a, i) => (
                  <div key={i} className="item-row flex items-center gap-3 border border-gray-100 rounded-xl p-3">
                    <div className="flex-1">
                      <input
                        className={inputCls}
                        placeholder="Add-on name e.g. Extra Cheese"
                        value={a.name}
                        onChange={(e) => updateAddon(i, "name", e.target.value)}
                      />
                    </div>
                    <div className="w-28">
                      <input
                        type="number"
                        className={inputCls}
                        placeholder="₹ Price"
                        value={a.price}
                        onChange={(e) => updateAddon(i, "price", e.target.value)}
                      />
                    </div>
                    <button
                      onClick={() => removeAddon(i)}
                      className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition flex-shrink-0"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-[#ff4d2d] text-white text-sm font-semibold hover:bg-[#e63d1f] transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isEdit ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ItemFormModal;