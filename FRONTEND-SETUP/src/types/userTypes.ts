export interface UserShopInterface {
  _id: string;
  name: string;
  slug: string;
  image?: { url: string };
  rating: { average: number; count: number };
  deliveryTime?: number;
  deliveryFee?: number;
  minOrderAmount?: number;
  categories: string[];
  location: { address: string; city?: string };
  isOpen: boolean;
}

export interface UserItemInterface {
  _id: string;
  name: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  category: string;
  isVeg: boolean;
  image?: { url: string };
  rating: { average: number; count: number };
  variants?: { name: string; price: number }[];
  shop: { _id: string; name: string; deliveryTime?: number };
}
