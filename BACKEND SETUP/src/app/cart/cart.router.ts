import express from 'express'
import authMiddleware from '../../middleware/customMiddleware/authMiddleware';
import tryCatch from '../../middleware/customMiddleware/tryCatch';
import { ADD_TO_CART, UPDATE_CART_ITEM_QUANTITY } from './cart.controller';


export const router = express.Router();

//------------------------ ADD TO CART ------------------------
router.route('/').post(authMiddleware,tryCatch(ADD_TO_CART));
//------------------------ GET_FULL_CART ------------------------
router.route('/').get(authMiddleware,tryCatch(ADD_TO_CART));
//------------------------ UPDATE_CART_QUANTITY ------------------------
router.route('/item/:cartItemId').patch(authMiddleware,tryCatch(UPDATE_CART_ITEM_QUANTITY));
//------------------------ DELETE_CART_QUANTITY ------------------------
router.route('/item/:cartItemId').delete(authMiddleware,tryCatch(UPDATE_CART_ITEM_QUANTITY));




// DELETE /cart/clear	Clear cart