import mongoose, { isValidObjectId } from "mongoose";
import ResponseHandler from "../../../utils/Response-Error-Handler/responseHandler";
import { Request, Response } from "express";
import { buildImageFromCloudinarySingle } from "../services/shop.fn";
import { generateUniqueSlug } from "../services/shop.dbFn";
import shopModel from "../model/shop.schema";
import ItemModel from "../model/item.schema";
import logger from "../../../libs/winstonLogger";
import { CUSTOMER_SIGN_OUT_CONTROLLER } from "../../customer/customer.controller";





/**
 * @desc    POST CREATE_SHOP based on owner uId
 * @route   POST /api/shops/ ⚠️
 * @access  Private  ⚠️
 * @returns  return shop data  ⚠️
 */
export async function CREATE_SHOP(req: Request, res: Response): Promise<any> {

  const ownerId = req.user?.uId;
  const role = req.user?.role;
  if(role !== "Hotel Owner"){
     return ResponseHandler(res, 400, false, null, "Authority has not been provided by admin. Please contact admin.");
  }
  if (!ownerId || !isValidObjectId(ownerId)){
    return ResponseHandler(res, 400, false, null, "Invalid owner id.");
}
 
  let {
    name,
    description,
    location,
    categories,
    schedule,
    deliveryTime,
    deliveryFee,
    minOrderAmount,
  } = req.body;

location = JSON.parse(location);
categories = JSON.parse(categories);
schedule = JSON.parse(schedule);
 
  if (!name){
     return ResponseHandler(res, 400, false, null, "Shop name is required.");
    }
  if (!location?.coordinates || !location?.address)
  {
      return ResponseHandler(res, 400, false, null, "Location coordinates and address are required.");
  }
  const cloudinaryFiles: any[] = req.body?.cloudinaryFiles ?? [];
  const image = buildImageFromCloudinarySingle(cloudinaryFiles);
  const slug = await generateUniqueSlug(name);
  const shop = await shopModel.create({
    name,
    slug,
    description,
    owner: ownerId,
    location: {
      type: "Point",
      coordinates: location.coordinates,
      address: location.address,
      city: location.city,
      state: location.state,
      pincode: location.pincode,
    },
    categories: categories ?? [],
    image,
    schedule,
    deliveryTime,
    deliveryFee: deliveryFee ?? 0,
    minOrderAmount: minOrderAmount ?? 0,
  });


  return ResponseHandler(res, 201, true, shop, "Shop created successfully.");
}


/**
 * @desc     GET SHOPS BASED ON OWNER FILTERATION + ALL USER (2 IN 1 ) API
 * @route   GET /api/shops/ ⚠️
 * @access  Private  ⚠️
 * @returns  all shops total count, documents, limits  ⚠️
 */
export async function GET_ALL_SHOPS(req: Request, res: Response): Promise<any> {
  const ownerId = req.user?.uId;
  const isOwnerFilteration = req.query.isOwner === "true";

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
  const skip = (page - 1) * limit;
  const filter: any = { isDeleted: false };
  if (isOwnerFilteration && ownerId && isValidObjectId(ownerId)) filter.owner = ownerId;
 
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { description: { $regex: req.query.search, $options: "i" } },
      { "location.address": { $regex: req.query.search, $options: "i" } },
    ];
  }
  if (req.query.category) filter.categories = req.query.category;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";
  if (req.query.isOpen !== undefined) filter.isOpen = req.query.isOpen === "true";

 
  const [shops, total] = await Promise.all([
    shopModel
      .find(filter)
      .select("-menuItems")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    shopModel.countDocuments(filter),
  ]);
 
  return ResponseHandler(res, 200, true, {
    shops,
    pagination: {
         page,
         limit,
        total,
        pages: Math.ceil(total / limit) },
  }, "Shops fetched successfully.");
}
/**
 * @desc     GET SHOP data by shopId
 * @route   GET /api/shops/:shopId ⚠️
 * @access  Private  ⚠️
 * @returns  return shopId document  ⚠️
 */
export async function GET_SHOP_BY_ID(req: Request, res: Response): Promise<any> {
  const { shopId } = req.params;
  if (!isValidObjectId(shopId)){
      return ResponseHandler(res, 400, false, null, "Invalid shop id.");
    }
  const shop = await shopModel
    .findOne({ _id: shopId, isDeleted: false })
    .populate({ path: "owner", select: "name email" });
  if (!shop) return ResponseHandler(res, 404, false, null, "Shop not found.");

  const items = await ItemModel.find({
  shop: shopId,
  isDeleted: false,
  isAvailable: true,
});

// return ResponseHandler(res, 200, true, { shop:...shop.toObject(), items }, "Shop fetched successfully.");
return ResponseHandler(res, 200, true, { 
  shop,
  items,
  itemsCount:items.length,

 }, "Shop fetched successfully.");
}
/**
 * @desc     GET SHOP data by slug
 * @route   GET /api/shops/slug/:slug ⚠️
 * @access  Private  ⚠️
 * @returns  return shopSlug document  ⚠️
 */
export async function GET_SHOP_BY_SLUG(req: Request, res: Response): Promise<any> {
  const { slug } = req.params;
 
  const shop = await shopModel
    .findOne({ slug, isDeleted: false })
    .populate({ path: "owner", select: "name email" });

 const items = await ItemModel.find({
  shop: shop._id,
  isDeleted: false,
  isAvailable: true,
});
  if (!shop) return ResponseHandler(res, 404, false, null, "Shop not found.");
  return ResponseHandler(res, 200, true, {
    shop,
    items,
  }, "Shop fetched successfully.");
}
/**
 * @desc    PUT UDPATE SHOP
 * @route   PUT /api/Shops/:id ⚠️
 * @access  Private  ⚠️
 * @returns  return udpated shop document  ⚠️
 */
export async function UPDATE_SHOP(req: Request, res: Response): Promise<any> {


  const { shopId } = req.params;
  const ownerId = req.user?.uId;
  if (!isValidObjectId(shopId)){
      return ResponseHandler(res, 400, false, null, "Invalid shop id.");
  }
  const shop = await shopModel.findOne({ _id: shopId, isDeleted: false });
  if (!shop) return ResponseHandler(res, 404, false, null, "Shop not found.");
  if (shop.owner.toString() !== ownerId)
  {
      return ResponseHandler(res, 403, false, null, "Not authorized.");
  }

  let {
    name,
    description,
    location,
    categories,
    schedule,
    deliveryTime,
    deliveryFee,
    minOrderAmount,
  } = req.body;


 schedule = JSON.parse(schedule);
 location = JSON.parse(location);
 categories= JSON.parse(categories);






 
   const updates: any = {};
 
  if (name && name !== shop.name) {
    updates.name = name;
    updates.slug = await generateUniqueSlug(name, shopId);
  }
  if (description !== undefined) updates.description = description;
  if (categories) updates.categories = categories;
  if (schedule) updates.schedule = schedule;
  if (deliveryTime !== undefined) updates.deliveryTime = deliveryTime;
  if (deliveryFee !== undefined) updates.deliveryFee = deliveryFee;
  if (minOrderAmount !== undefined) updates.minOrderAmount = minOrderAmount;

  if (location) {
    if (location.coordinates) updates["location.coordinates"] = location.coordinates;
    if (location.address) updates["location.address"] = location.address;
    if (location.city !== undefined) updates["location.city"] = location.city;
    if (location.state !== undefined) updates["location.state"] = location.state;
    if (location.pincode !== undefined) updates["location.pincode"] = location.pincode;
  }
 
  // Handle image update from Cloudinary middleware
  const cloudinaryFiles: any[] = req.body?.cloudinaryFiles ?? [];
  if (cloudinaryFiles.length > 0) {
    updates.image = buildImageFromCloudinarySingle(cloudinaryFiles);
  }


  console.log('iamges',updates);


  const updated = await shopModel.findByIdAndUpdate(shopId, { $set: updates }, { new: true });
  return ResponseHandler(res, 200, true, updated, "Shop updated successfully.");
}
/**
 * @desc    PATCH shop isOpen toggle  status 
 * @route   PATCH /api/Shps/toggle-open/:id ⚠️
 * @access  Private  ⚠️
 * @returns  return null  ⚠️
 */
export async function SET_SHOP_OPEN_STATUS(req: Request, res: Response) {
  const { shopId } = req.params;
  const ownerId = req.user?.uId;
  const { isOpen } = req.body;

  if (!isValidObjectId(shopId)) {
    return ResponseHandler(res, 400, false, null, "Invalid shop id.");
  }

  if (typeof isOpen !== "boolean") {
    return ResponseHandler(res, 400, false, null, "isOpen must be boolean.");
  }

  const shop = await shopModel.findOneAndUpdate(
    { _id: shopId, owner: ownerId, isDeleted: false },
    { isOpen },
    { new: true }
  );

  if (!shop) {
    return ResponseHandler(res, 404, false, null, "Shop not found or unauthorized.");
  }

  return ResponseHandler(
    res,
    200,
    true,
    { isOpen: shop.isOpen },
    `Shop marked as ${isOpen ? "open" : "closed"}.`
  );
}
/**
 * @desc    PATCH shop toggle active status
 * @route   PATCH /api/Shops/toggle-active/:id ⚠️
 * @access  Private  ⚠️
 * @returns  return null  ⚠️
 */
export async function SET_SHOP_ACTIVE_STATUS(req: Request, res: Response): Promise<any> {
  const { shopId } = req.params;
  const ownerId = req.user?.uId;
  const { isActive } = req.body;
 
  if (!isValidObjectId(shopId)){
      return ResponseHandler(res, 400, false, null, "Invalid shop id.");
  }
  if (typeof isActive !== "boolean"){
      return ResponseHandler(res, 400, false, null, "isActive must be a boolean.");
  }
 
  const shop = await shopModel.findOne({ _id: shopId, isDeleted: false });
  
  if (!shop){
     return ResponseHandler(res, 404, false, null, "Shop not found.");
  }

  if (shop.owner.toString() !== ownerId)
    {
        return ResponseHandler(res, 403, false, null, "Not authorized.");
    }
  shop.isActive = isActive;
  await shop.save();
  return ResponseHandler(
    res, 200, true,
    { isActive: shop.isActive },
    `Shop ${isActive ? "activated" : "deactivated"} successfully.`
  );
}
/**
 * @desc    PUT shop udpate shop schedule
 * @route   PUT /api/shops/:shopId/schedule ⚠️
 * @access  Private  ⚠️
 * @returns  return null  ⚠️
 */
export async function UPDATE_SHOP_SCHEDULE(req: Request, res: Response): Promise<any> {
  const { shopId } = req.params;
  const ownerId = req.user?.uId;
  const { schedule } = req.body;
 
  if (!isValidObjectId(shopId)){
      return ResponseHandler(res, 400, false, null, "Invalid shop id.");
  }
  if (!schedule || typeof schedule !== "object"){
      return ResponseHandler(res, 400, false, null, "Schedule is required.");
  }
  const shop = await shopModel.findOne({ _id: shopId, isDeleted: false });
  if (!shop) {
      return ResponseHandler(res, 404, false, null, "Shop not found.");
  }
  if (shop.owner.toString() !== ownerId){
      return ResponseHandler(res, 403, false, null, "Not authorized.");
  }
  const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
  const scheduleUpdates: any = {};
  for (const day of days) {
    if (schedule[day] !== undefined) scheduleUpdates[`schedule.${day}`] = schedule[day];
  }
  const updated = await shopModel.findByIdAndUpdate(
    shopId,
    { $set: scheduleUpdates },
    { new: true }
  );
  return ResponseHandler(res, 200, true,updated?.schedule, "Schedule updated successfully.");
}
/**
 * @desc    DELETE SOFT-DELETED SHOP
 * @route   DELETE /api/shops/:shopId ⚠️
 * @access  Private  ⚠️
 * @returns  return null  ⚠️
 */
export async function DELETE_SHOP(req: Request, res: Response): Promise<any> {
  const { shopId } = req.params;
  const ownerId = req.user?.uId;
  if (!isValidObjectId(shopId)){
      return ResponseHandler(res, 400, false, null, "Invalid shop id.");
  }
  const shop = await shopModel.findOne({ _id: shopId, isDeleted: false });
  if (!shop){
      return ResponseHandler(res, 404, false, null, "Shop not found.");
  }
  if (shop.owner.toString() !== ownerId){
      return ResponseHandler(res, 403, false, null, "Not authorized.");
  }
  // Soft delete shop and all its items
  await Promise.all([
    shopModel.findByIdAndUpdate(shopId, { $set: { isDeleted: true, isActive: false, isOpen: false } }),
    // ItemModel.updateMany({ shop: shopId }, { $set: { isDeleted: true, isAvailable: false } }),
  ]);
  return ResponseHandler(res, 200, true, null, "Shop deleted successfully.");
}
/**
 * @desc    patch RESTORE  SHOP
 * @route   patch /api/shops/:shopId ⚠️
 * @access  Private  ⚠️
 * @returns  return null  ⚠️
 */
export async function RESTORE_SHOP(req: Request, res: Response): Promise<any> {
  const { shopId } = req.params;
  const ownerId = req.user?.uId;
 
  if (!isValidObjectId(shopId)){
      return ResponseHandler(res, 400, false, null, "Invalid shop id.");
  }
 
  const shop = await shopModel.findOne({ _id: shopId, isDeleted: true });
  if (!shop){
      return ResponseHandler(res, 404, false, null, "Deleted shop not found.");
  }
  if (shop.owner.toString() !== ownerId){
      return ResponseHandler(res, 403, false, null, "Not authorized.");
  }
  await shopModel.findByIdAndUpdate(shopId, { $set: { isDeleted: false, isActive: true } });
  return ResponseHandler(res, 200, true, null, "Shop restored successfully.");
}
/**
 * @desc    get nearby shops
 * @route   GET /api/shops/nearby?lat=10.5&lng=76.1&radius=5000 ⚠️
 * @access  Private  ⚠️
 * @returns  return null  ⚠️
 */
export async function GET_NEARBY_SHOPS(req: Request, res: Response): Promise<any> {
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);
  const radius = parseInt(req.query.radius as string) || 50000; // metres //5000-> 5km  
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 50);
  const itemLimit = Math.min(50, parseInt(req.query.itemLimit as string) || 100);
  const skip = (page - 1) * limit;
  if (isNaN(lat) || isNaN(lng)){
      return ResponseHandler(res, 400, false, null, "lat and lng query params are required.");
  }
  const filter: any = {
    isDeleted: false,
    isActive: true,
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: radius,
      },
    },
  };




  if (req.query.category) filter.categories = req.query.category;
//   if (req.query.isOpen !== undefined) filter.isOpen = req.query.isOpen === "true";
filter.isOpen = req.query.isOpen === undefined ? true : req.query.isOpen === "true";
 


//api incoming 
 //GET /api/shops/nearby?lat=11.0813&lng=75.9984 500 126 - 114.648 ms




  const [shops] = await Promise.all([
    shopModel.find(filter).skip(skip).limit(limit),
    // shopModel.countDocuments(filter), ⚠️⚠️ DO TO THE USUAGE OF THE $near on filter query , we wont be able to use this query 
  ]);
  

  // console.log('lat',lat);
  // console.log('lng',lng); 
  // 75.93689 , 11.076294
  //lng,lat
    // type: [Number], // [longitude, latitude]




  const totalShops = shops.length;


  const shopIds = shops.map((shop: any) => shop._id);

  const [items, totalItems] = await Promise.all([
    ItemModel.find({ shop: { $in: shopIds }, isDeleted: false }).sort({ createdAt: -1 }).limit(itemLimit)
    // .populate({ path: "shop", select: "name" })
    ,
    ItemModel.countDocuments({ shop: { $in: shopIds }, isDeleted: false }),
  ]);


  
 
  return ResponseHandler(res, 200, true, {
    shops:{
       data:shops,
       pagination: { page, limit, total:totalShops, pages: Math.ceil(totalShops / limit) },
    },
    items:{
       data:items,
       pagination: { page, limit: totalItems, total: totalItems, pages: Math.ceil(totalItems / limit) },
    }
  }, "Nearby shops fetched successfully.");
}
/**
 * @desc    update shop image
 * @route   PATCH /api/shops/:shopId/image ⚠️
 * @access  Private  ⚠️
 * @returns  return udpated shopImage  ⚠️
 */
export async function UPDATE_SHOP_IMAGE(req: Request, res: Response): Promise<any> {
  const { shopId } = req.params;
  const ownerId = req.user?.uId;
  if (!isValidObjectId(shopId)){
      return ResponseHandler(res, 400, false, null, "Invalid shop id.");
  }
  const cloudinaryFiles: any[] = req.body?.cloudinaryFiles ?? [];
  if (!cloudinaryFiles.length){
      return ResponseHandler(res, 400, false, null, "No image uploaded.");
  }
  const shop = await shopModel.findOne({ _id: shopId, isDeleted: false });
  if (!shop){
      return ResponseHandler(res, 404, false, null, "Shop not found.");
  }
  if (shop.owner.toString() !== ownerId){
      return ResponseHandler(res, 403, false, null, "Not authorized.");
}
  const image = buildImageFromCloudinarySingle(cloudinaryFiles);
  const updated = await shopModel.findByIdAndUpdate(
    shopId,
    { $set: { image } },
    { new: true }
  );
  return ResponseHandler(res, 200, true, { image: updated?.image }, "Shop image updated successfully.");
}

/**
 * @desc     GET SHOP STATS (items count, avg rating, etc.)
 * @route   PATCH /api/shops/:shopId/stat ⚠️
 * @access  Private  ⚠️
 * @returns  return shop stat data  ⚠️
 */

export async function GET_SHOP_STATS(req: Request, res: Response): Promise<any> {
  const { shopId } = req.params;
  if (!isValidObjectId(shopId)){
      return ResponseHandler(res, 400, false, null, "Invalid shop id.");
  }
  const shop = await shopModel.findOne({ _id: shopId, isDeleted: false }).select("name rating");
  if (!shop) return ResponseHandler(res, 404, false, null, "Shop not found.");

  const [itemStats] = await ItemModel.aggregate([
    { $match: { shop: new mongoose.Types.ObjectId(shopId), isDeleted: false } },
    {
      $group: {
        _id: null,
        totalItems: { $sum: 1 },
        availableItems: { $sum: { $cond: ["$isAvailable", 1, 0] } },
        vegItems: { $sum: { $cond: ["$isVeg", 1, 0] } },
        avgItemRating: { $avg: "$rating.average" },
        byCategory: { $push: "$category" },  //“Collect all category values into an array”
      },
    },
  ]);
 
  return ResponseHandler(res, 200, true, {
    shopRating: shop.rating,
    ...itemStats,
  }, "Shop stats fetched successfully.");
}