import express from 'express';
import tryCatch from '../../middleware/customMiddleware/tryCatch';
import { HOTEL_OWNER_DATA_BY_ID, HOTEL_OWNER_LOGIN_CONTROLLER, HOTEL_OWNER_REGISTRATION } from './hotelOwner.controller';

export const router = express.Router();

router.route('/registration').post(tryCatch(HOTEL_OWNER_REGISTRATION));
router.route('/login').post(tryCatch(HOTEL_OWNER_LOGIN_CONTROLLER));
router.route('/:id').get(tryCatch(HOTEL_OWNER_DATA_BY_ID));
