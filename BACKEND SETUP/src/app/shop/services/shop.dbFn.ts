import slugify from "slugify";
import shopModel from "../model/shop.schema";


export const generateUniqueSlug = async (name: string, excludeId?: string) => {
  let base = slugify(name, { lower: true, strict: true });
  let slug = base;
  let counter = 1;
  while (true) {
    const query: any = { slug, isDeleted: false };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await shopModel.findOne(query);
    if (!exists) return slug;
    slug = `${base}-${counter++}`;
  }
};

export const assertShopOwner = async (shopId: string, ownerId: string) => {
  const shop = await shopModel.findOne({ _id: shopId, isDeleted: false }).select("owner");
  if (!shop) return { error: "Shop not found." };
  if (shop.owner.toString() !== ownerId) return { error: "Not authorized." };
  return { shop };
};

