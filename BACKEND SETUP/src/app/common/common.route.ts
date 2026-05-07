import express from 'express';
import tryCatch from '../../middleware/customMiddleware/tryCatch';
import { GET_USER__DETAILS_BY_TOKEN } from './common.controller';
import authMiddleware from '../../middleware/customMiddleware/authMiddleware';
export const router = express.Router();
router.route('/details').get(authMiddleware,tryCatch(GET_USER__DETAILS_BY_TOKEN));








