export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}
export interface ErrorResponse {
    message: string;
    error?: string;
    statusCode?: number;
    timestamp?: string;
}
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}
export interface ApiErrorResponse {
    success: false;
    message: string;
    error?: string;
    statusCode: number;
    timestamp: string;
    path?: string;
}
//# sourceMappingURL=error.d.ts.map