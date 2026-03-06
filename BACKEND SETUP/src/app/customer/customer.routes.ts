import express from 'express';
import tryCatch from '../../middleware/customMiddleware/tryCatch';
import { customerLoginFn, customerRegisterFn, getCustomerByIdFn } from './customer.controller';

export const router = express.Router();

router.route('/registration').post(tryCatch(customerRegisterFn));
router.route('/login').post(tryCatch(customerLoginFn));
router.route('/:id').get(tryCatch(getCustomerByIdFn));
