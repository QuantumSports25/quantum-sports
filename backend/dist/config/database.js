"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sequelize = new sequelize_1.Sequelize(process.env['DB_NAME'] || 'your_database_name', process.env['DB_USER'] || 'your_username', process.env['DB_PASSWORD'] || 'your_password', {
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '5432'),
    dialect: 'postgres',
    logging: false,
    dialectOptions: {}
});
exports.default = sequelize;
//# sourceMappingURL=database.js.map