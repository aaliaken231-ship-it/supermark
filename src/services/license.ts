/**
 * ===================================
 * LICENSE MANAGEMENT SERVICE
 * ===================================
 * Provides cryptographic utilities for secure license management
 * Uses AES-256-GCM encryption for data security
 */

// Secure encryption key - should be from environment in production
const SECRET_KEY = process.env.REACT_APP_LICENSE_SECRET || 'SUPERMARKET_2026_SECRET_KEY_FOR_AES_ENCRYPTION';

/**
 * Get crypto key for AES-GCM encryption/decryption
 * Derives a 256-bit key from the secret using SHA-256
 */
async function getCryptoKey(): Promise<CryptoKey> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(SECRET_KEY);
    const hash = await crypto.subtle.digest('SHA-256', keyData);
    return crypto.subtle.importKey(
      'raw',
      hash,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  } catch (error) {
    console.error('Error getting crypto key:', error);
    throw new Error('Failed to initialize encryption');
  }
}

/**
 * Encrypt data using AES-256-GCM
 * @param data - Data to encrypt (object or string)
 * @returns Base64 encoded encrypted data with IV
 */
export async function encryptData(data: any): Promise<string> {
  try {
    const key = await getCryptoKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    
    // Serialize data if it's an object
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const encodedData = encoder.encode(dataString);
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    // Return as Base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt license data');
  }
}

/**
 * Decrypt encrypted license data
 * @param encryptedBase64 - Base64 encoded encrypted data with IV
 * @returns Decrypted data (parsed as JSON if applicable)
 */
export async function decryptData(encryptedBase64: string): Promise<any> {
  try {
    const key = await getCryptoKey();
    const combined = new Uint8Array(
      atob(encryptedBase64).split('').map(c => c.charCodeAt(0))
    );
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    const decryptedString = decoder.decode(decrypted);
    
    // Try to parse as JSON, otherwise return as string
    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

/**
 * Generate a unique license code
 * Format: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
 * Uses alphanumeric characters (uppercase)
 */
export function generateLicenseCode(): string {
  try {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segment = () => 
      Array.from({ length: 5 }, () => 
        chars[Math.floor(Math.random() * chars.length)]
      ).join('');
    
    return `${segment()}-${segment()}-${segment()}-${segment()}-${segment()}`;
  } catch (error) {
    console.error('Error generating license code:', error);
    // Fallback
    return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Validate license code format
 * @param code - License code to validate
 * @returns true if valid format, false otherwise
 */
export function isValidLicenseCodeFormat(code: string): boolean {
  const licensePattern = /^[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/;
  return licensePattern.test(code);
}

/**
 * Hash license code for comparison without revealing it
 * @param code - License code to hash
 * @returns Hashed code (first 8 chars for preview)
 */
export async function hashLicenseCode(code: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(code);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('Error hashing license code:', error);
    return '';
  }
}
