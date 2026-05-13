import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { HOTEL_OWNER_MENU_BY_ID } from "../../../api/hotelOwnerApi";
import type { ItemFormData, MenuCategoryInterface } from "../../../types/DashboardTypes";
import ItemFormModal from "../../../components/HotelOwnersDashboard/ItemFormModal";
import HoitemCard from "../../../components/HotelOwnersDashboard/HoitemCard";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import { FiFilter, FiPlus, FiSearch } from "react-icons/fi";


/*eslint-disabl */

const HotelOwnerMenuPage = () => {
  const { shopId } = useParams();
 
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ItemFormData | null>(null);
  const [search, setSearch] = useState("");
  const [vegFilter, setVegFilter] = useState<"all" | "veg" | "nonveg">("all");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
 
  const { data, isLoading } = useQuery({
    queryKey: ["shopMenu", shopId],
    queryFn: () => HOTEL_OWNER_MENU_BY_ID(shopId as string),
    enabled: !!shopId,
  });
 
  const menu: MenuCategoryInterface[] = data?.data ?? [];
 console.log('menu',menu)
  // Filter logic
  const filteredMenu = menu
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => {
        const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.description?.toLowerCase().includes(search.toLowerCase());
        const matchVeg = vegFilter === "all" || (vegFilter === "veg" && item.isVeg) || (vegFilter === "nonveg" && !item.isVeg);
        return matchSearch && matchVeg;   //   return true ONLY IF:  search condition passes AND  veg filter condition passes
      }),
    }))
    .filter((cat) => cat.items.length > 0);
 
  const totalItems = menu.reduce((sum, cat) => sum + cat.count, 0);
 
const toggleCategory = (cat: string) => {
  setExpandedCategories((prev) => {
    const next = new Set(prev);

    if (next.has(cat)) {
      next.delete(cat);
    } else {
      next.add(cat);
    }
    return next;
  });
};
 
  const handleOpenCreate = () => {
    setEditItem(null);
    setModalOpen(true);
  };
 
  const handleOpenEdit = 
  //eslint-disable-next-line
  (item: any) => {
    setEditItem({
      _id: item._id,
      name: item.name,
      description: item.description ?? "",
      price: item.price ?? "",
      discountPrice: item.discountPrice ?? "",
      category: item.category,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      variants: item.variants ?? [],
      addons: item.addons ?? [],
      existingImage: item.image ?? null,
      preparationTime: item.preparationTime ?? 0,
    });
    setModalOpen(true);
  };
 


 
  const handleToggleAvail = (itemId: string, val: boolean) => {
    // Wire to SET_ITEM_AVAILABILITY_API
    console.log("Toggle availability:", itemId, val);
  };
 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .item-card { transition: box-shadow .2s, transform .15s; }
        .item-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,.07); transform: translateY(-1px); }
        .cat-header { transition: background .15s; }
        .cat-header:hover { background: #fff4f1; }
        .filter-btn { transition: all .15s; }
      `}</style>
 
      <div className="min-h-full" style={{ fontFamily: "'DM Sans', sans-serif" }}>
 
        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif" }}
              className="text-2xl font-extrabold text-gray-900">
              Menu
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {totalItems} items across {menu.length} categories
            </p>
          </div>
 
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-[#ff4d2d] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#e63d1f] transition shadow-sm shadow-orange-200"
          >
            <FiPlus size={18} />
            Add New Item
          </button>
        </div>
 
        {/* ── Search + Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/30 focus:border-[#ff4d2d] transition placeholder:text-gray-400"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
 
          {/* Veg filter */}
          <div className="flex gap-2">
            {(["all", "veg", "nonveg"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setVegFilter(f)}
                className={`filter-btn px-4 py-2.5 rounded-xl text-xs font-semibold border transition ${
                  vegFilter === f
                    ? f === "veg"
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : f === "nonveg"
                      ? "bg-red-500 text-white border-red-500"
                      : "bg-[#ff4d2d] text-white border-[#ff4d2d]"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
              >
                {f === "all" ? "All" : f === "veg" ? "🟢 Veg" : "🔴 Non-Veg"}
              </button>
            ))}
          </div>
        </div>
 
        {/* ── Loading ── */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-32 animate-pulse border border-gray-100" />
            ))}
          </div>
        )}
 
        {/* ── Empty state ── */}
        {!isLoading && menu.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center mb-4">
              <MdOutlineRestaurantMenu size={36} className="text-orange-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-700">No items yet</h3>
            <p className="text-sm text-gray-400 mt-1 mb-5">Start building your menu by adding your first dish</p>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 bg-[#ff4d2d] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#e63d1f] transition"
            >
              <FiPlus size={16} /> Add First Item
            </button>
          </div>
        )}
 
        {/* ── No results from filter ── */}
        {!isLoading && menu.length > 0 && filteredMenu.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <FiFilter size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No items match your filters</p>
            <button onClick={() => { setSearch(""); setVegFilter("all"); }}
              className="text-sm text-[#ff4d2d] mt-2 hover:underline">
              Clear filters
            </button>
          </div>
        )}
 
        {/* ── Category sections ── */}
        <div className="space-y-4">
          {filteredMenu.map((cat) => {
            const isExpanded = !expandedCategories.has(cat.category);
            return (
              <div key={cat.category} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(cat.category)}
                  className="cat-header w-full flex items-center justify-between px-5 py-3.5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-gray-900">{cat.category}</span>
                    <span className="text-xs bg-orange-50 text-[#ff4d2d] border border-orange-100 px-2 py-0.5 rounded-full font-semibold">
                      {cat.items.length}
                    </span>
                  </div>
                  <span className={`text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                    ▾ 
                  </span>
                </button>
 
                {/* Items grid */}
                {isExpanded && (
                  <div className="px-4 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {cat.items.map((item) => (
                      <HoitemCard
                        key={item._id}
                        item={item}
                        onEdit={handleOpenEdit}
                        onToggleAvail={handleToggleAvail}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
 
      {/* ── Modal ── */}
      <ItemFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editItem={editItem}
      />
    </>
  );
};
 
export default HotelOwnerMenuPage;