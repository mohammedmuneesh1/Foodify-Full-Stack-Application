import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { GET_SHOP_DATA_WITH_ITEMS_USING_SLUG } from "../api/shopApi";
import ItemCard from "../components/UserDashboard/UserItemCard";
import type { UserItemInterface } from "../types/userTypes";

const ShopBySlugPage = () => {
  const params = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["shopSlugDetails", params.slug],
    queryFn: () =>
      GET_SHOP_DATA_WITH_ITEMS_USING_SLUG(
        params.slug as string
      ),
    enabled: !!params.slug,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Shop not found
      </div>
    );
  }

  const shop = data?.data?.shop;
  const items = data?.data?.items ?? [];

  return (
    <div className="min-h-screen bg-[#fff7f3]">

      {/* Banner */}
      <div className="relative h-[280px] md:h-[350px]">
        <img
          src={shop.image.url}
          alt={shop.name}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
          <h1 className="text-4xl font-bold">
            {shop.name}
          </h1>

          <p className="mt-2 max-w-2xl text-white/90">
            {shop.description}
          </p>

          <div className="flex flex-wrap gap-3 mt-4">
            <span className="bg-white/20 px-3 py-1 rounded-full">
              🚚 {shop.deliveryTime} mins
            </span>

            <span className="bg-white/20 px-3 py-1 rounded-full">
              ₹{shop.deliveryFee} Delivery
            </span>

            <span
              className={`px-3 py-1 rounded-full ${
                shop.isOpen
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            >
              {shop.isOpen ? "Open" : "Closed"}
            </span>
          </div>
        </div>
      </div>

      {/* Shop Details */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="bg-white rounded-2xl p-5 shadow-sm border mb-8">
          <h2 className="font-semibold text-lg">
            Categories
          </h2>

          <div className="flex flex-wrap gap-2 mt-3">
            {shop.categories.map(
              (category: string) => (
                <span
                  key={category}
                  className="
                    bg-orange-100
                    text-orange-700
                    px-4
                    py-2
                    rounded-full
                    text-sm
                    font-medium
                  "
                >
                  {category}
                </span>
              )
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-3xl font-bold">
            Menu
          </h2>

          <span className="text-gray-500">
            {items?.length ?? 0} Items
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3   gap-4 pb-6 items-stretch">
                  {items?.map((item: UserItemInterface) => (
                    <div
                      key={item._id}
                    >
                      <ItemCard item={item} />
                    </div>
                  ))}
                </div>

      </div>
    </div>
  );
};

export default ShopBySlugPage;