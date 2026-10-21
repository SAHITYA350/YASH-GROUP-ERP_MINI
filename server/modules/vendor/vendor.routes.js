// server/modules/vendor/vendor.routes.js
import express from 'express';
import controller from './vendor.controller.js';

const router = express.Router();

router.get('/vendors', controller.list);
router.get('/vendors/:id', controller.get);
router.post('/vendors', controller.create);
router.patch('/vendors/:id', controller.update);

export default router;
