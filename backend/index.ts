import express, { Request, Response } from "express";
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import adminRoutes from './routes/route.js';
import clientRoutes from './routes/clientRoutes.js';
import adminClientRoutes from './routes/adminClientRoutes.js';
import connectDB from './db.js';
import cors from 'cors';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};

app.use(cors(corsOptions));
// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});

// Mount admin routes
app.use('/api', adminRoutes);

// Mount admin client management routes
app.use('/api/admin', adminClientRoutes);

// Mount client user routes
app.use('/api/client', clientRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
