export interface MenuCategoryInterface {
  category: string;
  count: number;
  //eslint-disable-next-line
  items: any[];
}
 

export interface Variant {
  _id?: string;
  name: string;
  price: number | string;
  discount?: {
    price?: number | string;
    validFrom?: string;
    validUpto?: string;
    isActive?: boolean;
  };
}
 
export interface Addon {
  _id?: string;
  name: string;
  price: number | string;
}
 
export interface ItemFormData {
  _id?: string;
  name: string;
  description: string;
  price: number | string;
  discountPrice: number | string;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
  variants: Variant[];
  addons: Addon[];
  image?: File | null;
  existingImage?: { url: string; type: string } | null;
  preparationTime: number;
}
 
export interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: ItemFormData | null;
  isSubmitting?: boolean;
}