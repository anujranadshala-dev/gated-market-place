export const isProduction = process.env.NODE_ENV === 'production';
export const config = {
    jwtSecret: process.env.JWT_SECRET,
    mongoUri: process.env.MONGO_DB,
    smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        fromName: process.env.SMTP_FROM_NAME,
        fromEmail: process.env.SMTP_FROM_EMAIL,
    },
    corsOrigins: process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) || ['http://localhost:3000', 'http://localhost:3001'],
    clientPortalUrl: process.env.CLIENT_PORTAL_URL || 'http://localhost:3001',
    adminPortalUrl: process.env.ADMIN_PORTAL_URL || 'http://localhost:3000',
};
