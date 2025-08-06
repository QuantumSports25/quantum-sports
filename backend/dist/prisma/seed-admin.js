"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function seedAdmin() {
    try {
        const existingAdmin = await prisma.user.findFirst({
            where: { role: 'admin' }
        });
        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.email);
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash('admin123', 10);
        const admin = await prisma.user.create({
            data: {
                name: 'Admin',
                email: 'admin@quantumsports.com',
                password: hashedPassword,
                role: 'admin',
                phone: '+1234567890'
            }
        });
        console.log('Admin user created successfully:', {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role
        });
    }
    catch (error) {
        console.error('Error seeding admin:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
seedAdmin();
//# sourceMappingURL=seed-admin.js.map