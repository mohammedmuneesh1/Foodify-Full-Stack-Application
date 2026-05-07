import express from 'express';
import tryCatch from '../../../middleware/customMiddleware/tryCatch';
import { CREATE_SHOP, DELETE_SHOP, GET_ALL_SHOPS, GET_SHOP_BY_ID, RESTORE_SHOP, SET_SHOP_ACTIVE_STATUS, SET_SHOP_OPEN_STATUS, UPDATE_SHOP, UPDATE_SHOP_IMAGE, UPDATE_SHOP_SCHEDULE } from '../controllers/shop.controller';
import { ADD_ITEM_ADDON, ADD_ITEM_VARIANT, BULK_SET_ITEM_AVAILABILITY, CREATE_ITEM, DELETE_ITEM, DELETE_ITEM_ADDON, DELETE_ITEM_VARIANT, GET_DELETED_ITEMS, GET_ITEM, GET_SHOP_ITEMS, GET_SHOP_MENU, RESTORE_ITEM, SET_ITEM_AVAILABILITY, SET_VARIANT_DISCOUNT, UPDATE_ITEM, UPDATE_ITEM_ADDON, UPDATE_ITEM_IMAGE, UPDATE_ITEM_VARIANT } from '../controllers/item.controller';
import authMiddleware from '../../../middleware/customMiddleware/authMiddleware';
import multerUploadMiddleware from '../../../middleware/customMiddleware/multerMiddleware';
import uploadToCloudinary from '../../../middleware/customMiddleware/uploadToCloudinary';


export const router = express.Router();

//    const cloudinaryFiles  = req.body?.cloudinaryFiles;

//===================== CREATE SHOPS =====================
router.route("/").post(authMiddleware,multerUploadMiddleware({
    type:"single",
    compress:true,
    fieldName:"shopImage",
    compressFormat:"webp",
    compressQualityToKeep:50,
    isOptional:true,
    maxSizeMB:5
}),
uploadToCloudinary("shop","shopImage"),
tryCatch(CREATE_SHOP));
//===================== GET ALL SHOPS =====================
router.route("/").get(authMiddleware,tryCatch(GET_ALL_SHOPS));
//===================== GET SHOP BY ID =====================
router.route("/:shopId").get(authMiddleware,tryCatch(GET_SHOP_BY_ID));
//===================== GET SHOP BY SLUG =====================
router.route("/slug/:slug").get(authMiddleware,tryCatch(GET_SHOP_BY_ID));
//===================== UDPATE_SHOP_BY_ID =====================
router.route("/:shopId").put(authMiddleware,tryCatch(UPDATE_SHOP));
//===================== TOGGLE SHOP OPEN STATUS =====================
router.route("/toggle-open/:shopId").patch(authMiddleware,tryCatch(SET_SHOP_OPEN_STATUS));
//===================== TOGGLE ACTIVE STATUS =====================
router.route("/toggle-active/:shopId").patch(authMiddleware,tryCatch(SET_SHOP_ACTIVE_STATUS));
//===================== UDPATE SHOP SCHEDULE  STATUS =====================
router.route("/:shopId/schedule").put(authMiddleware,tryCatch(UPDATE_SHOP_SCHEDULE));
//===================== DELETE SHOP SCHEDULE =====================
router.route("/:shopId").delete(authMiddleware,tryCatch(DELETE_SHOP));
//===================== GET RESTORE SHOP =====================
router.route("/:shopId/restore").patch(authMiddleware,tryCatch(RESTORE_SHOP));
//===================== GET RESTORE SHOP =====================
router.route("/nearby").patch(authMiddleware,tryCatch(RESTORE_SHOP)); // /nearby?lat=10.5&lng=76.1&radius=5000
//===================== UPDATE SHOP IMAGE  =====================
router.route("/:shopId/image").patch(authMiddleware,tryCatch(UPDATE_SHOP_IMAGE));
//===================== GET_SHOP_STATS  =====================
router.route("/:shopId/stats").patch(authMiddleware,tryCatch(UPDATE_SHOP_IMAGE));



//=========================================== ⚠️⚠️⚠️ ITEMS ROUTES ⚠️⚠️⚠️ ==============================================================
//------------------ CREATE ITEM ------------------
router.route("/:shopId/items").post(authMiddleware,tryCatch(CREATE_ITEM));
//------------------ GET ALL ITEMS OF A SHOP ------------------
router.route("/:shopId/items").get(authMiddleware,tryCatch(GET_SHOP_ITEMS));
//------------------ GET SHOP MENU DATA ------------------
router.route("/:shopId/items/menu").get(authMiddleware,tryCatch(GET_SHOP_MENU));
//------------------ GET ITEM BY ID ------------------
router.route("/:shopId/items/:itemId").get(authMiddleware,tryCatch(GET_ITEM));
//------------------ UPDATE ITEM BY ID ------------------
router.route("/:shopId/items/:itemId").put(authMiddleware,tryCatch(UPDATE_ITEM));
//------------------ UPDATE ITEM IMAGE BY ID ------------------
router.route("/:shopId/items/:itemId/image").patch(authMiddleware,tryCatch(UPDATE_ITEM_IMAGE));
//------------------ TOGGLE ITEM AVAILABILITY BY ID ------------------
router.route("/:shopId/items/:itemId/availability").patch(authMiddleware,tryCatch(SET_ITEM_AVAILABILITY));
//------------------ ITEM AVAILABILITY SETTING BULK UPDATE ------------------
router.route(" /:shopId/items/bulk-availability").patch(authMiddleware,tryCatch(BULK_SET_ITEM_AVAILABILITY));
//------------------ SOFT DELETE ITEM ------------------
router.route("/:shopId/items/:itemId").delete(authMiddleware,tryCatch(DELETE_ITEM));
//------------------ RESTORE DELETED ITEM ------------------
router.route("/:shopId/items/:itemId/restore").patch(authMiddleware,tryCatch(RESTORE_ITEM));
//------------------ BULK DELETE ITEMS ------------------
router.route("/:shopId/items/bulk").delete(authMiddleware,tryCatch(RESTORE_ITEM));
//------------------ ADD VARIANTS TO ITEM ------------------
router.route("/:shopId/items/:itemId/variants").post(authMiddleware,tryCatch(ADD_ITEM_VARIANT));
//------------------ UPDATE VARIANTS BY ID ------------------
router.route("/:shopId/items/:itemId/variants/:variantId").patch(authMiddleware,tryCatch(UPDATE_ITEM_VARIANT));
//------------------ DELETE VARIANTS BY ID ------------------
router.route("/:shopId/items/:itemId/variants/:variantId").delete(authMiddleware,tryCatch(DELETE_ITEM_VARIANT));
//------------------ DELETE VARIANTS BY ID ------------------
router.route("/:shopId/items/trash").delete(authMiddleware,tryCatch(GET_DELETED_ITEMS));
//------------------ SET VARIANT DISCOUNT ------------------
router.route("/:shopId/items/:itemId/variants/:variantId/discount").delete(authMiddleware,tryCatch(SET_VARIANT_DISCOUNT));
//------------------ DELETE ITEM ADDON ------------------
router.route("/:shopId/items/:itemId/addons/:addonId").delete(authMiddleware,tryCatch(DELETE_ITEM_ADDON));
//------------------ UPDATE ITEM ADDON ------------------
router.route("/:shopId/items/:itemId/addons/:addonId").patch(authMiddleware,tryCatch(UPDATE_ITEM_ADDON));
//------------------ UPDATE ITEM ADDON ------------------
router.route("/:shopId/items/:itemId/addons/:addonId").patch(authMiddleware,tryCatch(UPDATE_ITEM_ADDON));
//------------------ POST ITEM  ADDON ------------------
router.route("/:shopId/items/:itemId/addons/:addonId").post(authMiddleware,tryCatch(ADD_ITEM_ADDON));











//=========================================== ⚠️⚠️⚠️ ITEMS ROUTES ⚠️⚠️⚠️ ==============================================================





// router.route('/resume-cover/:resumeId').put(authMiddleware,
