import {   FiClipboard, FiTrendingUp, FiClock, FiStar, FiChevronRight, FiArrowUp, FiArrowDown} from "react-icons/fi";

// ── Dummy data ────────────────────────────────────────────────────────────────
const orders = [
  { id: "3421", customer: "Arjun Menon",    items: "Chicken Biryani × 2, Raita",       amount: "₹640",  status: "Delivered",  time: "2m ago",  avatar: "AM" },
  { id: "3420", customer: "Priya Nair",     items: "Veg Thali × 1, Gulab Jamun × 2",  amount: "₹310",  status: "On the way", time: "8m ago",  avatar: "PN" },
  { id: "3419", customer: "Rohan Das",      items: "Paneer Butter Masala, Naan × 3",   amount: "₹520",  status: "Preparing",  time: "14m ago", avatar: "RD" },
  { id: "3418", customer: "Sneha Pillai",   items: "Masala Dosa × 2, Filter Coffee",   amount: "₹280",  status: "Delivered",  time: "31m ago", avatar: "SP" },
  { id: "3417", customer: "Kiran Kumar",    items: "Fish Curry, Appam × 4",            amount: "₹490",  status: "Cancelled",  time: "1h ago",  avatar: "KK" },
];

const statusStyle: Record<string, string> = {
  "Delivered":  "bg-emerald-50 text-emerald-600 border border-emerald-200",
  "On the way": "bg-blue-50 text-blue-600 border border-blue-200",
  "Preparing":  "bg-amber-50 text-amber-600 border border-amber-200",
  "Cancelled":  "bg-red-50 text-red-500 border border-red-200",
};

const topDishes = [
  { name: "Chicken Biryani",       orders: 284, trend: +12, rating: 4.8 },
  { name: "Paneer Butter Masala",  orders: 196, trend: +5,  rating: 4.6 },
  { name: "Masala Dosa",           orders: 173, trend: -3,  rating: 4.7 },
  { name: "Fish Curry",            orders: 142, trend: +8,  rating: 4.5 },
];


// ── Main component ────────────────────────────────────────────────────────────
const HotelOwnerDashboardPage = () => {
   
  



  return (
    <div>

        {/* ── Content ── */}
        <main className="flex-1 p-5 lg:p-7 space-y-6 overflow-y-auto">

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              {
                label: "Today's Orders",
                value: "124",
                sub: "+14 from yesterday",
                up: true,
                color: "from-[#ff4d2d] to-[#ff8c42]",
                icon: <FiClipboard size={20} className="text-white" />,
              },
              {
                label: "Revenue Today",
                value: "₹18,420",
                sub: "+₹2,310 from yesterday",
                up: true,
                color: "from-violet-500 to-purple-600",
                icon: <FiTrendingUp size={20} className="text-white" />,
              },
              {
                label: "Avg Delivery",
                value: "28 min",
                sub: "−4 min from last week",
                up: true,
                color: "from-sky-500 to-blue-600",
                icon: <FiClock size={20} className="text-white" />,
              },
              {
                label: "Rating",
                value: "4.7 ★",
                sub: "Based on 684 reviews",
                up: true,
                color: "from-emerald-400 to-teal-500",
                icon: <FiStar size={20} className="text-white" />,
              },
            ].map((card, i) => (
              <div key={i} className="stat-card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-sm`}>
                    {card.icon}
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${card.up ? "text-emerald-600 bg-emerald-50" : "text-red-500 bg-red-50"}`}>
                    {card.up ? <FiArrowUp size={11} /> : <FiArrowDown size={11} />}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1 font-medium">{card.label}</p>
                <p className="text-xs text-gray-300 mt-0.5">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Middle row ── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

            {/* Recent orders — takes 2 cols */}
            <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-gray-900">Recent Orders</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Last 2 hours activity</p>
                </div>
                <button className="flex items-center gap-1 text-xs font-semibold text-[#ff4d2d] hover:underline">
                  View all <FiChevronRight size={14} />
                </button>
              </div>

              <div className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <div key={order.id} className="order-row flex items-center gap-4 px-6 py-3.5 cursor-pointer">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                      {order.avatar}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">#{order.id}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-sm text-gray-600 truncate">{order.customer}</span>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{order.items}</p>
                    </div>

                    {/* Right */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className="text-sm font-bold text-gray-900">{order.amount}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle[order.status]}`}>
                        {order.status}
                      </span>
                    </div>

                    <span className="text-xs text-gray-300 flex-shrink-0 hidden sm:block">{order.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top dishes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Top Dishes</h3>
                <p className="text-xs text-gray-400 mt-0.5">This week's bestsellers</p>
              </div>

              <div className="p-4 space-y-4">
                {topDishes.map((dish, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-300 w-4">#{i + 1}</span>
                        <span className="text-sm font-semibold text-gray-800">{dish.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-0.5 text-xs font-semibold ${dish.trend > 0 ? "text-emerald-500" : "text-red-400"}`}>
                          {dish.trend > 0 ? <FiArrowUp size={10} /> : <FiArrowDown size={10} />}
                          {Math.abs(dish.trend)}%
                        </span>
                        <span className="text-xs text-gray-400">{dish.orders} orders</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#ff4d2d] to-[#ff8c42] progress-bar"
                        style={{ width: `${(dish.orders / topDishes[0].orders) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <FiStar size={10} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs text-gray-400">{dish.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Bottom row: Order status summary ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-900">Order Status Breakdown</h3>
                <p className="text-xs text-gray-400 mt-0.5">Today's distribution</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Delivered",  count: 98,  pct: 79, color: "bg-emerald-400" },
                { label: "On the way", count: 12,  pct: 10, color: "bg-blue-400" },
                { label: "Preparing",  count: 8,   pct: 6,  color: "bg-amber-400" },
                { label: "Cancelled",  count: 6,   pct: 5,  color: "bg-red-400" },
              ].map((s, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">{s.label}</span>
                    <span className="text-xs font-bold text-gray-800">{s.count}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.color} progress-bar`} style={{ width: `${s.pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-400">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>

        </main>
{/* ── Content ── */}
    </div>
  );
};

export default HotelOwnerDashboardPage;