export declare class AuthService {
    static registerUser(data: {
        name: string;
        email: string;
        password: string;
        phone?: string;
    }): Promise<{
        success: boolean;
        error: string;
        details: {
            email: string;
            name?: never;
            message?: never;
        };
        user?: never;
        token?: never;
    } | {
        success: boolean;
        error: string;
        details: {
            name: any;
            email?: never;
            message?: never;
        };
        user?: never;
        token?: never;
    } | {
        success: boolean;
        user: {
            id: string;
            name: string;
            email: string;
        };
        token: string;
        error?: never;
        details?: never;
    } | {
        success: boolean;
        error: string;
        details: {
            message: string;
            email?: never;
            name?: never;
        };
        user?: never;
        token?: never;
    } | {
        success: boolean;
        error: string;
        details: string;
        user?: never;
        token?: never;
    }>;
    static registerPartner(data: {
        name: string;
        email: string;
        password: string;
        phone: string;
        companyName: string;
        subscriptionType: 'fixed' | 'revenue';
        gstNumber?: string | null;
        websiteUrl?: string | null;
    }): Promise<{
        success: boolean;
        error: string;
        details: {
            email: string;
        };
        user?: never;
        token?: never;
    } | {
        success: boolean;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            partnerDetails: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                companyName: string;
                subscriptionType: string;
                gstNumber: string | null;
                websiteUrl: string | null;
            } | null;
        };
        token: string;
        error?: never;
        details?: never;
    } | {
        success: boolean;
        error: string;
        details?: never;
        user?: never;
        token?: never;
    }>;
    static sendLoginOTP(email: string): Promise<{
        success: boolean;
        error: string;
        message?: never;
    } | {
        success: boolean;
        message: string;
        error?: never;
    }>;
    static verifyOTP(email: string, otp: string): Promise<{
        success: boolean;
        error: string;
        user?: never;
        token?: never;
    } | {
        success: boolean;
        user: {
            id: string;
            name: string;
            email: string;
        };
        token: string;
        error?: never;
    }>;
    static loginUser(email: string, password: string, role?: 'user' | 'partner' | 'admin'): Promise<{
        success: boolean;
        user: any;
        token: string;
        error?: never;
    } | {
        success: boolean;
        error: string;
        user?: never;
        token?: never;
    }>;
    static partnerLogin(email: string, password: string): Promise<{
        success: boolean;
        user: any;
        token: string;
        error?: never;
    } | {
        success: boolean;
        error: string;
        user?: never;
        token?: never;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map