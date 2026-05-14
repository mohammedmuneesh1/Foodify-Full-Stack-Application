import { Request, Response } from "express";
import mongoose from "mongoose";
import CartModel from "./models/cart.schema";
import ItemModel from "../shop/model/item.schema";
import ResponseHandler from "../../utils/Response-Error-Handler/responseHandler";

/**
 * @desc    POST CREATE CART
 * @route   POST /api/carts/ ⚠️
 * @access  Private  ⚠️
 * @returns  return newly created cart document  ⚠️
 */
export async function ADD_TO_CART(req: Request,res: Response): Promise<Response> {

    const userId = req.user?.uId;
    if (!userId) {
      return ResponseHandler(
        res,
        401,
        false,
        null,
        "Unauthorized."
      );
    }
    const {
      itemId,
      quantity = 1,
      variantId,
      addons = [],
     forceReplaceCart = false,
    } = req.body;
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return ResponseHandler(
        res,
        400,
        false,
        null,
        "Invalid item id."
      );
    }


    if (quantity < 1) {
      return ResponseHandler(
        res,
        400,
        false,
        null,
        "Quantity must be at least 1."
      );
    }

    const item: any = await ItemModel.findById(itemId);

    if (!item || item.isDeleted) {
      return ResponseHandler(
        res,
        404,
        false,
        null,
        "Item not found."
      );
    }
    if (!item.isAvailable) {
      return ResponseHandler(
        res,
        404,
        false,
        null,
        "This item is currently unavailable for ordering."
      );
    }

    /*
    ==========================================
    VARIANT VALIDATION
    ==========================================
    */

    let selectedVariant: any = null;

    if (variantId) {
      selectedVariant = item.variants.id(variantId);

      if (!selectedVariant) {
        return ResponseHandler(
          res,
          400,
          false,
          null,
          "Variant not found."
        );
      }
    }

    /*
    ==========================================
    ADDON VALIDATION START
    ==========================================
    */

    const selectedAddons: any[] = [];

    if (addons?.length > 0) {
      for (const adOnItem of addons) {
        const foundAddon = item.addons.id(adOnItem.addonId);
        
        if (!foundAddon) {
          return ResponseHandler(
            res,
            400,
            false,
            null,
            "Addon not found."
          );
        }

        const addonQuantity = Number(adOnItem.quantity) || 1;

        if (addonQuantity < 1) {
          return ResponseHandler(
            res,
            400,
            false,
            null,
            "Addon quantity invalid."
          );
        }

        const addonTotalPrice = foundAddon.price * addonQuantity;
        
        // Determine addon type: 'per-item' (default) or 'fixed'
        const applyType = foundAddon.applyType || 'fixed';

        selectedAddons.push({
          addonId: foundAddon._id,
          name: foundAddon.name,
          price: foundAddon.price,
          quantity: addonQuantity,
          totalPrice: addonTotalPrice,
          applyType,
        });
      }
    }

    /*
    ==========================================
    ADDON VALIDATION END
    ==========================================
    */



    /*
    ==========================================
    PRICE CALCULATION
    ==========================================
    */

    const basePrice = selectedVariant? selectedVariant.price : item.price;
    
    //⚠️⚠️⚠️ Separate per-item and fixed addons ⚠️⚠️⚠️
    const perItemAddons = selectedAddons.filter((addon: any) => addon.applyType !== 'fixed');
    const fixedAddons = selectedAddons.filter((addon: any) => addon.applyType === 'fixed');
    
    // Per-item addons are multiplied by quantity
    const perItemAddonsPrice = perItemAddons.reduce((acc: number, addon: any) => acc + addon.totalPrice,0);
    
    // Fixed addons apply only once
    const fixedAddonsPrice = fixedAddons.reduce((acc: number, addon: any) => acc + addon.price * addon.quantity,0);
    const singleItemPrice = basePrice + perItemAddonsPrice;
    const totalPrice = singleItemPrice * quantity + fixedAddonsPrice;

    /*
    ==========================================
    FIND OR CREATE CART
    ==========================================
    */

    let cart: any = await CartModel.findOne({
      user: userId,
    });

    if (!cart) {
      cart = await CartModel.create({
        user: userId,
        items: [],
      });
    }


     /*
    ==========================================
    IF THE ITEM IS ANOTHER SHOP AND FORCED REPLACE LOGIC BELOW
    ==========================================
    */


    if (
  forceReplaceCart &&
  cart.items.length > 0
) {
  cart.items = [];
  cart.totalAmount = 0;
}

 /*
    ==========================================
    IF THE ITEM IS ANOTHER SHOP AND FORCED REPLACE LOGIC TOP 
    ==========================================
    */



    /*
    ==========================================
    ONE SHOP ONLY VALIDATION
    ==========================================
    */


//==========⚠️⚠️⚠️⛓️⛓️⛓️ CART LOGIC ⚠️⚠️⚠️⛓️⛓️⛓️ =================
// Normally Most food delivery apps work this way.:
//one cart
//one restaurant/shop

//Why Platforms Do This
//Because logistics become hell otherwise.

// Imagine:
// 1 burger from Shop A
// 1 juice from Shop B
// 1 shawarma from Shop C


// Now system must:

// coordinate 3 kitchens
// track 3 riders
// merge ETA
// split delivery fee
// split cancellation logic
// split taxes
// handle partial refunds
// synchronize delivery timing

//⛓️⛓️⛓️
// Your cart contains items from another restaurant:
// Clear cart and add this item instead?
//one active restaurant per cart
//⛓️⛓️⛓️




//==========⚠️⚠️⚠️⛓️⛓️⛓️ CART LOGIC ⚠️⚠️⚠️⛓️⛓️⛓️ =================


    if (
      cart.items.length > 0 &&
      cart.items[0].shop.toString() !== item.shop.toString()
    ) {
      return ResponseHandler(
        res,
        409,
        false,
        null,
        "Your cart contains items from another restaurant. Order your current cart or replace it with this item."
      );
    }

    /*
    ==========================================
    NORMALIZE ADDONS
    ==========================================
    */

const normalizeAddons = (addons: any[]) => {

     //⚠️⚠️⚠️READ: applyType is rquired because   per-item add on 3 burger 20 rs cheese of qty 2 will cost 20*2=40 rs , burger 3 so 40*3=120 rs (per-item cost) 
     // on fixed addon cheese of qty 2 will cost 20*2=40 rs (fixed cost)

  return addons
    .map((a) => ({
      addonId: a.addonId.toString(),
      quantity: a.quantity,
      applyType: a.applyType,
    }))
    .sort((a, b) =>
      a.addonId.localeCompare(b.addonId)
    );
};

    const incomingAddons = JSON.stringify(
      normalizeAddons(selectedAddons)
    );

    /*
    ==========================================
    CHECK EXISTING ITEM
    ==========================================
    */

//⚠️⚠️⚠️⚠️ 
    //BOTH BELOW CART ITEMS ARE NOT SAME!!!! THERE ARE DIFFERENT BASED ON ADD ONS 
//      [
//         {
//         item:'burger',
//         price:120,
//         quantity:3,
//         addons:[{
//             addonId:'cheese'
//             price:20,
//             quantity:2,
//             applyType:'per-item'
//         }]
//     },
//         {
//         item:'burger',
//         price:120,
//         quantity:3,
//         addons:[{
//             addonId:'cheese'
//             price:20,
//             quantity:2,
//             applyType:'fixed'
//         }]
//     }
// ]
//⚠️⚠️⚠️⚠️ 


    const existingItem = cart.items.find(
      (cartItem: any) => {
        const cartAddons = JSON.stringify(normalizeAddons(cartItem.addons));

        return (
          cartItem.item.toString() === item._id.toString() &&
        String(cartItem.variant?._id || "") === String(selectedVariant?._id || "") &&
          cartAddons === incomingAddons
        );
      }
    );

    /*
    ==========================================
    UPDATE EXISTING ITEM
    ==========================================
    */

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.totalPrice += totalPrice;
    } else {
      /*
      ==========================================
      CREATE NEW CART ITEM
      ==========================================
      */

      cart.items.push({
        item: item._id,
        shop: item.shop,
        quantity,
        variant: selectedVariant
          ? {
              _id: selectedVariant._id,
              name: selectedVariant.name,
              price: selectedVariant.price,
            }
          : null,
        addons: selectedAddons,
        basePrice,
        totalPrice,
      });
    }

    /*
    ==========================================
    RECALCULATE CART TOTAL
    ==========================================
    */

    cart.totalAmount = cart.items.reduce((acc: number, item: any) =>acc + item.totalPrice,0);
    await cart.save();
    return ResponseHandler(
      res,
      200,
      true,
      cart,
      "Item added to cart successfully."
    );
}
/**
 * @desc    GET ALL CART
 * @route   GET /api/carts/ ⚠️
 * @access  Private  ⚠️
 * @returns  return get all carts data  ⚠️
 */
export async function GET_CART(
  req: Request,
  res: Response
): Promise<any> {
    const userId = req.user?.uId;
    if (!userId) {
      return ResponseHandler(
        res,
        401,
        false,
        null,
        "Unauthorized."
      );
    }
    const cart = await CartModel.findOne({
      user: userId,
    }).populate({
      path: "items.item",
      select: "name image isAvailable",
    })
    .populate({
      path: "items.shop",
      select: "name image deliveryTime",
    });
    if (!cart) {
      return ResponseHandler(
        res,
        200,
        true,
        null,
        "Cart fetched successfully."
      );
    }
    return ResponseHandler(
      res,
      200,
      true,
      cart,
      "Cart fetched successfully."
    );
}




/**
 * @desc    PATCH update item quantity
 * @route   PATCH /api/carts/items/:cartItemId ⚠️
 * @access  Private  ⚠️
 * @returns  return updated cart  ⚠️
 */


export async function UPDATE_CART_ITEM_QUANTITY(
  req: Request,
  res: Response
): Promise<any> {

  try {

    const userId = req.user?.uId;
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
      return ResponseHandler(
        res,
        400,
        false,
        null,
        "Invalid cart item id."
      );
    }

    if (quantity < 1) {
      return ResponseHandler(
        res,
        400,
        false,
        null,
        "Quantity must be at least 1."
      );
    }

    const cart: any = await CartModel.findOne({
      user: userId,
    });

    if (!cart) {

      return ResponseHandler(
        res,
        404,
        false,
        null,
        "Cart not found."
      );
    }
    const cartItem = cart.items.id(cartItemId);

    if (!cartItem) {
      return ResponseHandler(
        res,
        404,
        false,
        null,
        "Cart item not found."
      );
    }


    if (![1, -1].includes(quantity)) {
  return ResponseHandler(
    res,
    400,
    false,
    null,
    "Invalid quantity operation."
  );
}



    // cart item quantity is 1 then remove it  
    if(cartItem.quantity + quantity  <=0){
        cart.items.pull(cartItemId);
        // cart.totalAmount = cart.items.reduce((acc: number, item: any) =>acc + item.totalPrice,0);

        // await cart.save();
        // return ResponseHandler(
        //     res,
        //     200,
        //     true,
        //     cart,
        //     "Cart updated successfully."
        //   );
    }
    else{
        const singleItemPrice = cartItem.totalPrice / cartItem.quantity;
     cartItem.quantity+=quantity;
    cartItem.totalPrice = singleItemPrice * cartItem.quantity;
    cart.totalAmount = cart.items.reduce((acc: number, item: any) =>acc + item.totalPrice,0);
    }
    //480 total including addon quantity = 3  so per item 160     totalprice =480 / 3 = 160
    await cart.save();
    return ResponseHandler(
      res,
      200,
      true,
      cart,
      "Cart updated successfully."
    );

  } catch (error) {

    console.log(error);

    return ResponseHandler(
      res,
      500,
      false,
      null,
      "Internal server error."
    );

  }

}



/**
 * @desc    DELETE item from cart
 * @route   PATCH /api/carts/items/:cartItemId ⚠️
 * @access  Private  ⚠️
 * @returns  return updated cart  ⚠️
 */
export async function REMOVE_CART_ITEM(req: Request,res: Response): Promise<any> {
    const userId = req.user?.uId;
    const { cartItemId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
      return ResponseHandler(
        res,
        400,
        false,
        null,
        "Invalid cart item id."
      );
    }
    const cart: any = await CartModel.findOne({
      user: userId,
    });
    if (!cart) {
      return ResponseHandler(
        res,
        404,
        false,
        null,
        "Cart not found."
      );
    }
    cart.items = cart.items.filter(
      (item: any) =>
        item._id.toString() !== cartItemId
    );
    cart.totalAmount = cart.items.reduce(
      (acc: number, item: any) =>
        acc + item.totalPrice,
      0
    );
    await cart.save();
    return ResponseHandler(
      res,
      200,
      true,
      cart,
      "Item removed from cart."
    );
}




/**
 * @desc  DELETE clear cart
 * @route   DELETE /api/carts/clear ⚠️
 * @access  Private  ⚠️
 * @returns  return null  ⚠️
 */






