import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        if (!process.env.MONGO_DB) {
            console.error('FATAL ERROR: MONGO_DB is not defined in environment variables.');
            process.exit(1);
        }

        const conn = await mongoose.connect(process.env.MONGO_DB);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error instanceof Error ? error.message : error}`);
        process.exit(1);
    }
};

export default connectDB;