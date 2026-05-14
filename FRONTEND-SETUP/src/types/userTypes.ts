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
  addons?: { name: string; price: number , _id:string }[];
  shop: { _id: string; name: string; deliveryTime?: number };
}



export interface CartAddonInterface {
  name: string;
  quantity: number;
  price: number;
  applyType: "per-item" | "fixed";
}

export interface CartVariantInterface {
  _id:string;
  name: string;
  price: number;
}

export interface CartItemInterface {
  _id:string;
  item:string;
  shop:string;
  quantity: number;
  variant?: CartVariantInterface | null;
  addons: CartAddonInterface[];
  basePrice: number;
  totalPrice: number;
}

export interface CartInterface{
  _id:string;
  user:string;
  items: CartItemInterface[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}