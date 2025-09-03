import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits

// Get encryption key from environment variables
const getEncryptionKey = (): Buffer => {
  const key = process.env.CHAT_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('CHAT_ENCRYPTION_KEY environment variable is required');
  }
  
  // If key is hex string, convert to buffer
  if (key.length === 64) { // 32 bytes * 2 (hex)
    return Buffer.from(key, 'hex');
  }
  
  // Otherwise, derive key from string using PBKDF2
  return crypto.pbkdf2Sync(key, 'dropiti-chat-salt', 100000, KEY_LENGTH, 'sha256');
};

/**
 * Encrypt a message using AES-256-CBC
 * @param plaintext - The message to encrypt
 * @returns Encrypted message as base64 string
 */
export const encryptMessage = (plaintext: string): string => {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher using the correct modern API
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt the message
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Combine IV + encrypted data
    const combined = Buffer.concat([iv, Buffer.from(encrypted, 'base64')]);
    return combined.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
};

/**
 * Decrypt a message using AES-256-CBC
 * @param encryptedData - The encrypted message as base64 string
 * @returns Decrypted message
 */
export const decryptMessage = (encryptedData: string): string => {
  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Extract IV and encrypted data
    const iv = combined.subarray(0, IV_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH);
    
    // Create decipher using the correct modern API
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    // Decrypt the message
    let decrypted = decipher.update(encrypted, null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt message');
  }
};

/**
 * Generate a new encryption key (for setup)
 * @returns Hex string of the encryption key
 */
export const generateEncryptionKey = (): string => {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
};

/**
 * Check if a string is encrypted (has the expected format)
 * @param data - String to check
 * @returns True if the string appears to be encrypted
 */
export const isEncrypted = (data: string): boolean => {
  try {
    const combined = Buffer.from(data, 'base64');
    return combined.length >= IV_LENGTH;
  } catch {
    return false;
  }
};
