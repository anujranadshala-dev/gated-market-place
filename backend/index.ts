import express, { Request, Response } from "express";
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import adminAuthRoutes from './routes/adminAuth.js';
import connectDB from './db.js';
import cors from 'cors';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Allow cookies or auth headers if needed
};

app.use(cors(corsOptions));
// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Mount authentication routes
app.use('/api', adminAuthRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;