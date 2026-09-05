import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('base64');
}

export async function verifyPassword(password: string, storedHash: string, isLegacy: boolean): Promise<boolean> {
    if (isLegacy) {
        return bcrypt.compare(password, storedHash);
    }
    const hashed = hashPassword(password);
    return bcrypt.compare(hashed, storedHash);
}
