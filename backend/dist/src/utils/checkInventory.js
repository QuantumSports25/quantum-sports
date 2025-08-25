"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkInventory = void 0;
const checkInventory = async (products, productsData) => {
    if (products.length === 0 ||
        products.some((p) => !p.productId || p.quantity <= 0)) {
        throw new Error("Product ID and quantity are required");
    }
    const reqMap = new Map();
    products.forEach((p) => reqMap.set(p.productId, p.quantity));
    return productsData.every((p) => {
        const reqQty = reqMap.get(p.id);
        return reqQty !== undefined && reqQty <= p.inventory;
    });
};
exports.checkInventory = checkInventory;
//# sourceMappingURL=checkInventory.js.map