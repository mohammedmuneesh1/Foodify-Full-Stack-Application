import express from 'express';
import tryCatch from '../../middleware/customMiddleware/tryCatch';
import { DELIVERY_PARTNER_GOOGLE_LOGIN_CONTROLLER, DELIVERY_PARTNER_LOGIN, DELIVERY_PARTNER_REGISTRATION, GET_DELIVERY_PARTNER_DATA_BY_ID } from './deliveryPartner.controller';


export const router = express.Router();

router.route('/registration').post(tryCatch(DELIVERY_PARTNER_REGISTRATION));
router.route('/login').post(tryCatch(DELIVERY_PARTNER_LOGIN));
router.route('/:id').get(tryCatch(GET_DELIVERY_PARTNER_DATA_BY_ID));
//⚠️⚠️ DELIVERY_PARTNER THIS SAME ROUTE WILL BE USED FOR GOOGLE SIGNIN AND SIGNOUT
router.route('/google-signin').post(tryCatch(DELIVERY_PARTNER_GOOGLE_LOGIN_CONTROLLER));


