import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { ShopController } from '../controllers/shop-controller/shop.controller';

const router = Router();

// Shop Routes
router.post('/create-product', authMiddleware, ShopController.createProducts);
router.post('/create-shop-order-before-payment', authMiddleware, ShopController.createOrderBeforePayment);
router.post('/shop-order-payment/:id', authMiddleware, ShopController.createBookingPayment);
router.post('/verify-shop-order/:id', authMiddleware, ShopController.verifyPaymentAndShopOrder);
router.get('/get-shop-orders', authMiddleware, ShopController.getAllShopOrders);
router.get('/get-shop-order/:id', authMiddleware, ShopController.getShopOrderById);
router.get('/get-products', ShopController.getAllProducts);
router.get('/get-product-by-ids/', ShopController.getProductsById);

export default router; 