import express from 'express';
import tryCatch from '../../middleware/customMiddleware/tryCatch';
import { GET_USER__DETAILS_BY_TOKEN } from './common.controller';
export const router = express.Router();
router.route('/details').post(tryCatch(GET_USER__DETAILS_BY_TOKEN));








