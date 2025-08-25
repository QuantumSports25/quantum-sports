"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const shop_controller_1 = require("../controllers/shop-controller/shop.controller");
const router = (0, express_1.Router)();
router.post('/create-product', auth_middleware_1.authMiddleware, shop_controller_1.ShopController.createProducts);
router.post('/create-shop-order-before-payment', auth_middleware_1.authMiddleware, shop_controller_1.ShopController.createOrderBeforePayment);
router.post('/shop-order-payment/:id', auth_middleware_1.authMiddleware, shop_controller_1.ShopController.createBookingPayment);
router.post('/verify-shop-order/:id', auth_middleware_1.authMiddleware, shop_controller_1.ShopController.verifyPaymentAndShopOrder);
router.get('/get-shop-orders', auth_middleware_1.authMiddleware, shop_controller_1.ShopController.getAllShopOrders);
router.get('/get-shop-order/:id', auth_middleware_1.authMiddleware, shop_controller_1.ShopController.getShopOrderById);
router.get('/get-products', shop_controller_1.ShopController.getAllProducts);
router.get('/get-product-by-ids/', shop_controller_1.ShopController.getProductsById);
exports.default = router;
//# sourceMappingURL=shop.routes.js.map