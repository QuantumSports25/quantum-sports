export declare class WalletService {
    static getWalletBalance(userId: string): Promise<number>;
    static updateUserWallet(userId: string, credits: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        balance: number;
    }>;
    static addCredits(userId: string, credits: number): Promise<boolean>;
    static deductCredits(userId: string, credits: number): Promise<boolean>;
    static getUserWallet(userId: string): Promise<({
        user: {
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        balance: number;
    }) | null>;
}
//# sourceMappingURL=wallet.services.d.ts.map