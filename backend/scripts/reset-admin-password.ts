import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_URI = process.env.MONGO_DB!;
const EMAIL = process.argv[2];
const NEW_PASSWORD = process.argv[3];

if (!EMAIL || !NEW_PASSWORD) {
    console.error('Usage: ts-node scripts/reset-admin-password.ts <email> <newPassword>');
    process.exit(1);
}

async function main() {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db!;
    const users = db.collection('adminusers');

    const hashed = await bcrypt.hash(NEW_PASSWORD, 10);

    const result = await users.updateOne(
        { email: EMAIL.toLowerCase() },
        {
            $set: {
                password: hashed,
                loginAttempts: 0,
                lockedUntil: null,
                passwordLastChangedAt: new Date(),
                updatedAt: new Date(),
            },
        }
    );

    if (result.matchedCount === 0) {
        console.error(`No admin user found with email ${EMAIL}`);
    } else {
        console.log(`Updated ${result.modifiedCount} admin user(s) for ${EMAIL}`);
    }

    await mongoose.disconnect();
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});