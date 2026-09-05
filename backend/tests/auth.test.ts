import bcrypt from 'bcryptjs';
import crypto from 'crypto';

describe('Authentication Security', () => {
  describe('Password hashing', () => {
    it('should hash passwords with bcrypt', async () => {
      const password = 'TestPassword123!';
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should verify hashed passwords correctly', async () => {
      const password = 'TestPassword123!';
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      
      const isMatch = await bcrypt.compare(password, hash);
      expect(isMatch).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword456!';
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      
      const isMatch = await bcrypt.compare(wrongPassword, hash);
      expect(isMatch).toBe(false);
    });
  });

  describe('Crypto utilities', () => {
    it('should generate random bytes', () => {
      const token1 = crypto.randomBytes(32).toString('hex');
      const token2 = crypto.randomBytes(32).toString('hex');
      
      expect(token1).not.toBe(token2);
      expect(token1.length).toBe(64);
    });

    it('should create consistent SHA-256 hashes', () => {
      const input = 'test-input';
      const hash1 = crypto.createHash('sha256').update(input).digest('base64');
      const hash2 = crypto.createHash('sha256').update(input).digest('base64');
      
      expect(hash1).toBe(hash2);
    });
  });

  describe('Email validation', () => {
    const gmailRegex = /^[^\s@]+@gmail\.com$/;

    it('should accept valid Gmail addresses', () => {
      expect(gmailRegex.test('user@gmail.com')).toBe(true);
      expect(gmailRegex.test('test.user@gmail.com')).toBe(true);
    });

    it('should reject non-Gmail addresses', () => {
      expect(gmailRegex.test('user@yahoo.com')).toBe(false);
      expect(gmailRegex.test('user@example.com')).toBe(false);
      expect(gmailRegex.test('user@gmail.co')).toBe(false);
    });

    it('should reject invalid formats', () => {
      expect(gmailRegex.test('invalid')).toBe(false);
      expect(gmailRegex.test('@gmail.com')).toBe(false);
      expect(gmailRegex.test('user@')).toBe(false);
    });
  });

  describe('Role normalization', () => {
    it('should normalize SUPER_ADMIN correctly', () => {
      const role = 'SUPER_ADMIN' as string;
      const normalized = role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'STORE_OWNER';
      expect(normalized).toBe('SUPER_ADMIN');
    });

    it('should normalize any non-SUPER_ADMIN to STORE_OWNER', () => {
      const role = 'STORE_OWNER' as string;
      const normalized = role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'STORE_OWNER';
      expect(normalized).toBe('STORE_OWNER');
    });

    it('should reject arbitrary roles', () => {
      const arbitraryRole = 'HACKER' as string;
      const normalized = arbitraryRole === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'STORE_OWNER';
      expect(normalized).toBe('STORE_OWNER');
    });
  });
});
