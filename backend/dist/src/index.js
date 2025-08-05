"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const PORT = process.env['PORT'] || 4000;
const startServer = async () => {
    try {
        await (0, db_1.connectDatabase)();
        const isHealthy = await (0, db_1.checkDatabaseHealth)();
        if (!isHealthy) {
            throw new Error('Database health check failed');
        }
        const server = app_1.default.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env['NODE_ENV'] || 'development'}`);
            console.log(`🔗 Database: PostgreSQL with Prisma`);
        });
        const gracefulShutdown = async () => {
            console.log('👋 Shutting down gracefully...');
            server.close(async () => {
                await (0, db_1.disconnectDatabase)();
                console.log('💥 Process terminated!');
                process.exit(0);
            });
        };
        process.on('unhandledRejection', (err) => {
            console.log(`❌ Unhandled Promise Rejection: ${err.message}`);
            gracefulShutdown();
        });
        process.on('uncaughtException', (err) => {
            console.log(`❌ Uncaught Exception: ${err.message}`);
            gracefulShutdown();
        });
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map