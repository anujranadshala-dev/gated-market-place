import express, { Request, Response } from "express";
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import csrf from 'csurf';
import adminRoutes from './routes/route.js';
import clientRoutes from './routes/clientRoutes.js';
import adminClientRoutes from './routes/adminClientRoutes.js';
import connectDB from './db.js';
import cors from 'cors';
import { isProduction, config } from './utils/config.js';

dotenv.config();

connectDB();

const app = express();

const corsOrigins = config.corsOrigins;

const corsOptions = {
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
    frameguard: { action: 'deny' },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize());
app.use(cookieParser());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api', apiLimiter);

const csrfProtection = csrf({ cookie: { httpOnly: true, secure: isProduction, sameSite: 'strict' } });
app.get('/api/csrf-token', csrfProtection, (req: Request, res: Response) => {
    res.json({ csrfToken: req.csrfToken() });
});

app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/api', adminRoutes);
app.use('/api/admin', adminClientRoutes);
app.use('/api/client', clientRoutes);

app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(`${new Date().toISOString()} - ${err.message}`, { stack: err.stack, method: req.method, path: req.path, ip: req.ip });
    res.status(err.status || 500).json({ message: err.message || 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const gracefulShutdown = () => {
    console.log('Received shutdown signal. Closing server gracefully...');
    server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
    });
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
