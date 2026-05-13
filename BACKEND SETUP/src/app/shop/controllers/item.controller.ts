
// ─────────────────────────────────────────────
// CREATE ITEM
// POST /api/shops/:shopId/items

import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import ResponseHandler from "../../../utils/Response-Error-Handler/responseHandler";
import { assertShopOwner } from "../services/shop.dbFn";
import { buildImageFromCloudinarySingle } from "../services/shop.fn";
import ItemModel from "../model/item.schema";
import shopModel from "../model/shop.schema";
import mongoose from "mongoose";


/**
 * @desc    POST CREATE_ITEM based on SHOPID
 * @route   POST /api/shops/:shopId/items ⚠️
 * @access  Private  ⚠️
 * @returns  return item data  ⚠️
 */
export async function CREATE_ITEM(req: Request, res: Response): Promise<Response> {
  const { shopId } = req.params;
  const ownerId = req.user?.uId;
  if (!isValidObjectId(shopId)){
      return ResponseHandler(res, 400, false, null, "Invalid shop id.");
  }
  const { error } = await assertShopOwner(shopId, ownerId!);
  if (error) {
      return ResponseHandler(res, 403, false, null, error);
  }
 
  let {
    name,
    description,
    price,
    discountPrice,
    category,
    isVeg,
    variants,
    addons,
  } = req.body;
  variants = JSON.parse(variants);
  addons = JSON.parse(addons);
  if (!name){
      return ResponseHandler(res, 400, false, null, "Item name is required.");
  }
  
  if (!category){
     return ResponseHandler(res, 400, false, null, "Category is required.");
  }
  const parsedVariants = variants ?? [];

  if (!parsedVariants.length && (price === undefined || price === null)){
      return ResponseHandler(res, 400, false, null, "Price is required when no variants are provided.");
  }
  const cloudinaryFiles: any[] = req.body?.cloudinaryFiles ?? [];
  const image = buildImageFromCloudinarySingle(cloudinaryFiles);
 
  const item = await ItemModel.create({
    shop: shopId,
    name,
    description,
    price: parsedVariants.length ? undefined : price,
    discountPrice,
    category,
    isVeg: isVeg ?? false,
    variants: parsedVariants,
    addons: addons ?? [],
    image,
  });
  return ResponseHandler(res, 201, true, item, "Item created successfully.");
}
 
/**
 * @desc    GET ALL ITEMS FOR A SHOP
 * @route   GET /api/shops/:shopId/items ⚠️  ?page=1&limit=10&category=Pizza&isVeg=true&isAvailable=true&search=chicken
 * @access  Private  ⚠️
 * @returns  return item data  ⚠️
 */
export async function GET_SHOP_ITEMS(req: Request, res: Response): Promise<any> {
  const { shopId } = req.params;
  if (!isValidObjectId(shopId)){
      return ResponseHandler(res, 400, false, null, "Invalid shop id.");
  }
  const shopExists = await shopModel.exists({ _id: shopId, isDeleted: false });
  if (!shopExists) {
      return ResponseHandler(res, 404, false, null, "Shop not found.");
  } 
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
  const skip = (page - 1) * limit;
  const filter: any = { shop: shopId, isDeleted: false };
  if (req.query.category) filter.category = req.query.category;
//   if (req.query.isVeg !== undefined) filter.isVeg = req.query.isVeg === "true";
  if (req.query.isVeg !== undefined) filter.isVeg = req.query.isVeg === "true";
//   if (req.query.isAvailable !== undefined) filter.isAvailable = req.query.isAvailable === "true";
    filter.isAvailable =req.query.isAvailable !== undefined ? req.query.isAvailable === "true" : true;
  
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { description: { $regex: req.query.search, $options: "i" } },
    ];
  }
 
  const [items, total] = await Promise.all([
    ItemModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ItemModel.countDocuments(filter),
  ]);
 
  return ResponseHandler(res, 200, true, {
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  }, "Items fetched successfully.");
}
/**
 * @desc    GET shop menu by category
 * @route   GET /api/shops/:shopId/items/menu
 * @access  Private  ⚠️
 * @returns  return item data  ⚠️
 */
export async function GET_SHOP_MENU(req: Request, res: Response): Promise<any> {
  const { shopId } = req.params;
  if (!isValidObjectId(shopId))
    return ResponseHandler(res, 400, false, null, "Invalid shop id.");
  const filter: any = {
       shop: new mongoose.Types.ObjectId(shopId),
      isDeleted: false, 
    ...(req.query.isAvailable !== undefined ? {isAvailable:req.query.isAvailable === "true"}  : {}),
   };

  //   if (req.query.isVeg !== undefined) filter.isVeg = req.query.isVeg === "true";
  if (req.query.isVeg !== undefined) filter.isVeg = req.query.isVeg === "true";


 
  const items = await ItemModel.aggregate([
    { $match: filter },
    { $sort: { name: 1 } }, //👉 Sort items alphabetically BEFORE grouping
    {
      $group: {
        _id: "$category",
        items: { $push: "$$ROOT" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { category: "$_id", items: 1, count: 1, _id: 0 } },
  ]);
  return ResponseHandler(res, 200, true, items, "Menu fetched successfully.");
}
/**
 * @desc    GET item by id
 * @route   GET /:shopId/items/:itemId
 * @access  Private  ⚠️
 * @returns  return item BY ID  data  ⚠️
 */ 
export async function GET_ITEM(req: Request, res: Response): Promise<any> {
  const { shopId, itemId } = req.params;
  if (!isValidObjectId(shopId) || !isValidObjectId(itemId)){
      return ResponseHandler(res, 400, false, null, "Invalid id.");
  }
  const item = await ItemModel.findOne({ _id: itemId, shop: shopId, isDeleted: false });
  if (!item){
      return ResponseHandler(res, 404, false, null, "Item not found.");
  }
  return ResponseHandler(res, 200, true, item, "Item fetched successfully.");
}
/**
 * @desc    PUT  update ITEM
 * @route   PUT  /api/shops/:shopId/items/:itemId
 * @access  Private  ⚠️
 * @returns  return updated data   ⚠️
 */ 
export async function UPDATE_ITEM(req: Request, res: Response): Promise<any> {
  const { shopId, itemId } = req.params;
  const ownerId = req.user?.uId;
  if (!isValidObjectId(shopId) || !isValidObjectId(itemId)){
      return ResponseHandler(res, 400, false, null, "Invalid id.");
  }
  const { error } = await assertShopOwner(shopId, ownerId!);
  if (error) {
    return ResponseHandler(res, 403, false, null, error);
}
  const item = await ItemModel.findOne({ _id: itemId, shop: shopId, isDeleted: false });
  if (!item){ return ResponseHandler(res, 404, false, null, "Item not found.");}
 
  let {
    name,
    description,
    price,
    discountPrice,
    category,
    isVeg,
    variants,
    preparationTime,
    isAvailable,
    addons,
  } = req.body;

  variants = JSON.parse(variants);
  addons = JSON.parse(addons);
 
  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (price !== undefined && price !== "") updates.price = price;
  if (discountPrice !== undefined) updates.discountPrice = discountPrice;
  if (category !== undefined) updates.category = category;
  if (isVeg !== undefined) updates.isVeg = isVeg;
  if (variants !== undefined) updates.variants = variants;
  if (addons !== undefined) updates.addons = addons;
  if (preparationTime !== undefined) updates.preparationTime = preparationTime;
  if (isAvailable !== undefined) updates.isAvailable = isAvailable;
  const cloudinaryFiles: any[] = req.body?.cloudinaryFiles ?? [];
  if (cloudinaryFiles.length > 0) updates.image = buildImageFromCloudinarySingle(cloudinaryFiles);

  const updated = await ItemModel.findByIdAndUpdate(
    itemId,
    { $set: updates },
    { new: true, runValidators: true }
  );
  return ResponseHandler(res, 200, true, updated, "Item updated successfully.");
}
 /**
 * @desc    PATCH  UPDATE ITEM IMAGE ONLY
 * @route   PUT  /api/shops/:shopId/items/:itemId/image
 * @access  Private  ⚠️
 * @returns return updated image ⚠️
 */ 
export async function UPDATE_ITEM_IMAGE(req: Request, res: Response): Promise<any> {
  const { shopId, itemId } = req.params;
  const ownerId = req.user?.uId;
  if (!isValidObjectId(shopId) || !isValidObjectId(itemId)){
      return ResponseHandler(res, 400, false, null, "Invalid id.");
  }
 
  const { error } = await assertShopOwner(shopId, ownerId!);
  if (error){ return ResponseHandler(res, 403, false, null, error);}
 
  const cloudinaryFiles: any[] = req.body?.cloudinaryFiles ?? [];
  if (!cloudinaryFiles.length)
    return ResponseHandler(res, 400, false, null, "No image uploaded.");
 
  const item = await ItemModel.findOne({ _id: itemId, shop: shopId, isDeleted: false });
  if (!item) return ResponseHandler(res, 404, false, null, "Item not found.");
 
  const image = buildImageFromCloudinarySingle(cloudinaryFiles);
  const updated = await ItemModel.findByIdAndUpdate(
    itemId,
    { $set: { image } },
    { new: true }
  );
 
  return ResponseHandler(res, 200, true, { image: updated?.image }, "Item image updated successfully.");
}
 /**
 * @desc    PATCH   isAvailable setting
 * @route   PATCH  /:shopId/items/:itemId/availability
 * @access  Private  ⚠️
 * @returns return isAvailable status ⚠️
 */ 
export async function SET_ITEM_AVAILABILITY(req: Request, res: Response): Promise<any> {
  const { shopId, itemId } = req.params;
  const ownerId = req.user?.uId;
  const { isAvailable } = req.body;
  if (!isValidObjectId(shopId) || !isValidObjectId(itemId)){
        return ResponseHandler(res, 400, false, null, "Invalid id.");
    }
  if (typeof isAvailable !== "boolean"){
    return ResponseHandler(res, 400, false, null, "isAvailable must be a boolean.");
  }
  const { error } = await assertShopOwner(shopId, ownerId!);
  if (error) {
     return ResponseHandler(res, 403, false, null, error);
  }
  const item = await ItemModel.findOne({ _id: itemId, shop: shopId, isDeleted: false });
  if (!item) return ResponseHandler(res, 404, false, null, "Item not found.");
 
  item.isAvailable = isAvailable;
  await item.save();
 
  return ResponseHandler(res, 200, true, { isAvailable }, `Item ${isAvailable ? "enabled" : "disabled"}.`);
}
/**
 * @desc    PATCH   TOGGLE AVAILABILITY (e.g. close all items),  body: { itemIds: ["id1","id2"], isAvailable: false }
 * @route   PATCH  /:shopId/items/bulk-availability
 * @access  Private  ⚠️
 * @returns return isAvailable status ⚠️
 */ 
export async function BULK_SET_ITEM_AVAILABILITY(req: Request, res: Response): Promise<any> {
  const { shopId } = req.params;
  const ownerId = req.user?.uId;
//body: { itemIds: ["id1","id2"], isAvailable: false }
  const { itemIds, isAvailable } = req.body;
  if (!isValidObjectId(shopId)){
      return ResponseHandler(res, 400, false, null, "Invalid shop id.");
  }
  if (!Array.isArray(itemIds) || !itemIds.length){
      return ResponseHandler(res, 400, false, null, "itemIds array is required.");
  }
  if (typeof isAvailable !== "boolean"){
      return ResponseHandler(res, 400, false, null, "isAvailable must be a boolean.");
  }
  const { error } = await assertShopOwner(shopId, ownerId!);
  if (error) {
    return ResponseHandler(res, 403, false, null, error);
}
  const validIds = itemIds.filter(isValidObjectId);
  const result = await ItemModel.updateMany(
    { _id: { $in: validIds }, shop: shopId, isDeleted: false },
    { $set: { isAvailable } }
  );
  return ResponseHandler(res, 200, true, { modifiedCount: result.modifiedCount },
    `${result.modifiedCount} item(s) ${isAvailable ? "enabled" : "disabled"}.`);
}
/**
 * @desc    DELETE   SOFT DELETE ITEM
 * @route   DELETE  /api/shops/:shopId/items/:itemId
 * @access  Private  ⚠️
 * @returns return NULL ⚠️
 */ 
export async function DELETE_ITEM(req: Request, res: Response): Promise<any> {
  const { shopId, itemId } = req.params;
  const ownerId = req.user?.uId;
  if (!isValidObjectId(shopId) || !isValidObjectId(itemId))
    {
        return ResponseHandler(res, 400, false, null, "Invalid id.");
    }
  const { error } = await assertShopOwner(shopId, ownerId!);
  if (error){ return ResponseHandler(res, 403, false, null, error);}
  const item = await ItemModel.findOne({ _id: itemId, shop: shopId, isDeleted: false });
  if (!item){
     return ResponseHandler(res, 404, false, null, "Item not found.");
  }
  await  ItemModel.findByIdAndUpdate(itemId, { $set: { isDeleted: true, isAvailable: false } });
  return ResponseHandler(res, 200, true, null, "Item deleted successfully.");
}
/**
 * @desc    PATCH  RESTORE SOFT-DELETED ITEM
 * @route   PATCH  /:shopId/items/:itemId/restore
 * @access  Private  ⚠️
 * @returns return NULL ⚠️
 */ 
export async function RESTORE_ITEM(req: Request, res: Response): Promise<any> {
  const { shopId, itemId } = req.params;
  const ownerId = req.user?.uId;
  if (!isValidObjectId(shopId) || !isValidObjectId(itemId)){
      return ResponseHandler(res, 400, false, null, "Invalid id.");
  }
  const { error } = await assertShopOwner(shopId, ownerId!);
  if (error){return ResponseHandler(res, 403, false, null, error);}
  const item = await ItemModel.findOne({ _id: itemId, shop: shopId, isDeleted: true });
  if (!item){ return ResponseHandler(res, 404, false, null, "Deleted item not found.");}
  await ItemModel.findByIdAndUpdate(itemId, { $set: { isDeleted: false, isAvailable: true } });
  return ResponseHandler(res, 200, true, null, "Item restored successfully.");
} 
/**
 * @desc    DELETE BULK SOFT DELETE ITEMS  body: { itemIds: ["id1","id2"] }
 * @route   DELETE  /:shopId/items/bulk
 * @access  Private  ⚠️
 * @returns return NULL ⚠️
 */ 
export async function BULK_DELETE_ITEMS(req: Request, res: Response): Promise<any> {
  const { shopId } = req.params;
  const ownerId = req.user?.uId;
//   body: { itemIds: ["id1","id2"] }
  const { itemIds } = req.body;
  if (!isValidObjectId(shopId)) return ResponseHandler(res, 400, false, null, "Invalid shop id.");
  if (!Array.isArray(itemIds) || !itemIds.length) return ResponseHandler(res, 400, false, null, "itemIds array is required.");
 
  const { error } = await assertShopOwner(shopId, ownerId!);
  if (error) return ResponseHandler(res, 403, false, null, error);
  const validIds = itemIds.filter(isValidObjectId).map((id) => new mongoose.Types.ObjectId(id));
      const updateResult = await ItemModel.updateMany(
      { _id: { $in: validIds }, shop: shopId, isDeleted: false },
      { $set: { isDeleted: true, isAvailable: false } }
    );
  return ResponseHandler(res, 200, true, null, `${updateResult.modifiedCount} item(s) deleted.`);
}
/**
 * @desc    POST BULK SOFT DELETE ITEMS  body: { name, price, discount? }
 * @route   POST  /api/shops/:shopId/items/:itemId/variants
 * @access  Private  ⚠️
 * @returns return updated variants document ⚠️
 */ 
export async function ADD_ITEM_VARIANT(req: Request, res: Response): Promise<any> {
  const { shopId, itemId } = req.params;
  const ownerId = req.user?.uId;
  const { name, price, discount } = req.body;
  if (!isValidObjectId(shopId) || !isValidObjectId(itemId)) return ResponseHandler(res, 400, false, null, "Invalid id.");
  if (!name || price === undefined) return ResponseHandler(res, 400, false, null, "Variant name and price are required.");
  const { error } = await assertShopOwner(shopId, ownerId!);
  if (error) return ResponseHandler(res, 403, false, null, error);
  const item = await ItemModel.findOne({ _id: itemId, shop: shopId, isDeleted: false });
  if (!item) return ResponseHandler(res, 404, false, null, "Item not found.");
  const variant: any = { name, price };
  if (discount) variant.discount = discount;
  const updated = await ItemModel.findByIdAndUpdate(
    itemId,
    { $push: { variants: variant } },
    { new: true }
  );
  return ResponseHandler(res, 200, true, { variants: updated?.variants }, "Variant added successfully.");
}
/**
 * @desc    PATCH  UPDATE VARIANT
 * @route   PATCH   /api/shops/:shopId/items/:itemId/variants/:variantId
 * @access  Private  ⚠️
 * @returns return updated variants document ⚠️
 */ 
export async function UPDATE_ITEM_VARIANT(req: Request, res: Response): Promise<any> {
  const { shopId, itemId, variantId } = req.params;
  const ownerId = req.user?.uId;
  if (!isValidObjectId(shopId) || !isValidObjectId(itemId) || !isValidObjectId(variantId))
    return ResponseHandler(res, 400, false, null, "Invalid id.");
 
  const { error } = await assertShopOwner(shopId, ownerId!);
  if (error) return ResponseHandler(res, 403, false, null, error);
 
  const { name, price, discount } = req.body;
  const setFields: any = {};
  if (name !== undefined) setFields["variants.$.name"] = name;
  if (price !== undefined) setFields["variants.$.price"] = price;
  if (discount !== undefined) setFields["variants.$.discount"] = discount;
 
  const updated = await ItemModel.findOneAndUpdate(
    { _id: itemId, shop: shopId, isDeleted: false, "variants._id": variantId },
    { $set: setFields },
    { new: true }
  );
 
  if (!updated) return ResponseHandler(res, 404, false, null, "Item or variant not found.");
 
  return ResponseHandler(res, 200, true, { variants: updated.variants }, "Variant updated successfully.");
}
/**
 * @desc    DELETE VARIANT
 * @route   DELETE  /api/shops/:shopId/items/:itemId/variants/:variantId
 * @access  Private  ⚠️
 * @returns return updated variants document ⚠️
 */ 
export async function DELETE_ITEM_VARIANT(req: Request, res: Response): Promise<any> {
  const { shopId, itemId, variantId } = req.params;
  const ownerId = req.user?.uId;
  if (!isValidObjectId(shopId) || !isValidObjectId(itemId) || !isValidObjectId(variantId))
    return ResponseHandler(res, 400, false, null, "Invalid id.");
  const { error } = await assertShopOwner(shopId, ownerId!);
  if (error) return ResponseHandler(res, 403, false, null, error);
  const updated = await ItemModel.findOneAndUpdate(
    { _id: itemId, shop: shopId, isDeleted: false },
    { $pull: { variants: { _id: variantId } } },
    { new: true }
  );
  if (!updated) return ResponseHandler(res, 404, false, null, "Item not found.");
  return ResponseHandler(res, 200, true, { variants: updated.variants }, "Variant deleted successfully.");
}
 
/**
 * @desc    POST ADDON TO ITEM
 * @route   POST /api/shops/:shopId/items/:itemId/addons
 * @access  Private  ⚠️
 * @returns return updated addon  ⚠️
 */ 
export async function ADD_ITEM_ADDON(req: Request, res: Response): Promise<any> {
  const { shopId, itemId } = req.params;
  const ownerId = req.user?.uId;
  const { name, price } = req.body;
  if (!isValidObjectId(shopId) || !isValidObjectId(itemId)) return ResponseHandler(res, 400, false, null, "Invalid id.");
  if (!name || price === undefined) return ResponseHandler(res, 400, false, null, "Addon name and price are required.");
  const { error } = await assertShopOwner(shopId, ownerId!);
  if (error) return ResponseHandler(res, 403, false, null, error);
  const item = await ItemModel.findOne({ _id: itemId, shop: shopId, isDeleted: false });
  if (!item) return ResponseHandler(res, 404, false, null, "Item not found.");
  const updated = await ItemModel.findByIdAndUpdate(
    itemId,
    { $push: { addons: { name, price } } },
    { new: true }
  );
  return ResponseHandler(res, 200, true, { addons: updated?.addons }, "Addon added successfully.");
}
/**
 * @desc    PATCH UPDATE ADDON
 * @route   PATCH  /api/shops/:shopId/items/:itemId/addons/:addonId
 * @access  Private  ⚠️
 * @returns return updated addon  ⚠️
 */ 
export async function UPDATE_ITEM_ADDON(req: Request, res: Response): Promise<any> {
  const { shopId, itemId, addonId } = req.params;
  const ownerId = req.user?.uId;
  if (!isValidObjectId(shopId) || !isValidObjectId(itemId) || !isValidObjectId(addonId))
    return ResponseHandler(res, 400, false, null, "Invalid id.");
  const { error } = await assertShopOwner(shopId, ownerId!);
  if (error) return ResponseHandler(res, 403, false, null, error);
  const { name, price } = req.body;
  const setFields: any = {};
  if (name !== undefined) setFields["addons.$.name"] = name;
  if (price !== undefined) setFields["addons.$.price"] = price;
  const updated = await ItemModel.findOneAndUpdate(
    { _id: itemId, shop: shopId, isDeleted: false, "addons._id": addonId },
    { $set: setFields },
    { new: true }
  );
  if (!updated) return ResponseHandler(res, 404, false, null, "Item or addon not found.");
  return ResponseHandler(res, 200, true, { addons: updated.addons }, "Addon updated successfully.");
}
/**
 * @desc    DELETE ADDON
 * @route   DELETE  /api/shops/:shopId/items/:itemId/addons/:addonId
 * @access  Private  ⚠️
 * @returns return updated addon  ⚠️
 */ 
export async function DELETE_ITEM_ADDON(req: Request, res: Response): Promise<any> {
  const { shopId, itemId, addonId } = req.params;
  const ownerId = req.user?.uId;
  if (!isValidObjectId(shopId) || !isValidObjectId(itemId) || !isValidObjectId(addonId))
  return ResponseHandler(res, 400, false, null, "Invalid id.");
  const { error } = await assertShopOwner(shopId, ownerId!);
  if (error) return ResponseHandler(res, 403, false, null, error);
  const updated = await ItemModel.findOneAndUpdate(
    { _id: itemId, shop: shopId, isDeleted: false },
    { $pull: { addons: { _id: addonId } } },
    { new: true }
  );
  if (!updated) return ResponseHandler(res, 404, false, null, "Item not found.");
  return ResponseHandler(res, 200, true, { addons: updated.addons }, "Addon deleted successfully.");
}
/**
 * @desc    PATCH SET VARIANT DISCOUNT
 * @route   PATCH /api/shops/:shopId/items/:itemId/variants/:variantId/discount
 * @access  Private  ⚠️
 * @returns return variant  ⚠️
 */ 
export async function SET_VARIANT_DISCOUNT(req: Request, res: Response): Promise<any> {
  const { shopId, itemId, variantId } = req.params;
  const ownerId = req.user?.uId;
  const { price, validFrom, validUpto, isActive } = req.body;
  if (!isValidObjectId(shopId) || !isValidObjectId(itemId) || !isValidObjectId(variantId)) return ResponseHandler(res, 400, false, null, "Invalid id.");
  const { error } = await assertShopOwner(shopId, ownerId!);
  if (error) return ResponseHandler(res, 403, false, null, error);
  const discountUpdate: any = {};
  if (price !== undefined) discountUpdate["variants.$.discount.price"] = price;
  if (validFrom !== undefined) discountUpdate["variants.$.discount.validFrom"] = validFrom;
  if (validUpto !== undefined) discountUpdate["variants.$.discount.validUpto"] = validUpto;
  if (isActive !== undefined) discountUpdate["variants.$.discount.isActive"] = isActive;
  const updated = await ItemModel.findOneAndUpdate(
    { _id: itemId, shop: shopId, isDeleted: false, "variants._id": variantId },
    { $set: discountUpdate },
    { new: true }
  );
  if (!updated) return ResponseHandler(res, 404, false, null, "Item or variant not found.");
  return ResponseHandler(res, 200, true, { variants: updated.variants }, "Variant discount updated.");
}
/**
 * @desc    GET DELETED ITEMS (trash bin)
 * @route   GET /api/shops/:shopId/items/trash
 * @access  Private  ⚠️
 * @returns return deleted items ⚠️
 */ 
export async function GET_DELETED_ITEMS(req: Request, res: Response): Promise<any> {
  const { shopId } = req.params;
  const ownerId = req.user?.uId;
  if (!isValidObjectId(shopId)) return ResponseHandler(res, 400, false, null, "Invalid shop id.");
  const { error } = await assertShopOwner(shopId, ownerId!);
  if (error) return ResponseHandler(res, 403, false, null, error);
  const items = await ItemModel.find({ shop: shopId, isDeleted: true }).sort({ updatedAt: -1 });
  return ResponseHandler(res, 200, true, { items }, "Deleted items fetched successfully.");
}
 
