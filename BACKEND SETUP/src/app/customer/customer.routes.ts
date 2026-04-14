import express from 'express';
import tryCatch from '../../middleware/customMiddleware/tryCatch';
import { CUSTOMER_SIGN_OUT_CONTROLLER, customerLoginFn, customerRegisterFn,  getCustomerByIdFn, GOOGLE_LOGIN_CONTROLLER } from './customer.controller';

export const router = express.Router();

router.route('/registration').post(tryCatch(customerRegisterFn));
router.route('/signout').post(tryCatch(CUSTOMER_SIGN_OUT_CONTROLLER));
router.route('/login').post(tryCatch(customerLoginFn));
router.route('/:id').get(tryCatch(getCustomerByIdFn));
//⚠️⚠️ THIS SAME ROUTE WILL BE USED FOR GOOGLE SIGNIN AND SIGNOUT
router.route('/google-signin').post(tryCatch(GOOGLE_LOGIN_CONTROLLER));



