"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
let isConnected = false;
exports.default = async (req, res) => {
    try {
        if (!isConnected) {
            await (0, db_1.connectDatabase)();
            isConnected = true;
        }
        return (0, app_1.default)(req, res);
    }
    catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
//# sourceMappingURL=api.js.map