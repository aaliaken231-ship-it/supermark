# Complete License Management System - Reference Guide

## System Overview

The license management system consists of two well-integrated components working together to provide secure, scalable license management for the SuperMark application.

---

## Component 1: Encryption Service (`src/services/license.ts`)

### Purpose
Provides secure cryptographic operations for license data protection and code generation.

### Functions Reference

#### `encryptData(data: any): Promise<string>`
- **Purpose**: Encrypt license data using AES-256-GCM
- **Input**: Any data (object or string)
- **Output**: Base64 encoded encrypted string with IV
- **Security**: Uses 12-byte random IV, SHA-256 derived key
- **Error Handling**: Throws on failure with descriptive message

```typescript
// Example
const license = { code: 'ABC12-DEF45-...', expires: '2026-04-15' };
const encrypted = await encryptData(license);
// Result: "AgAAAAAAAAAAAAAAAAA...base64..."
```

#### `decryptData(encryptedBase64: string): Promise<any>`
- **Purpose**: Decrypt AES-256-GCM encrypted data
- **Input**: Base64 encrypted string
- **Output**: Original data (auto-parses JSON if applicable)
- **Error Handling**: Returns null on decryption failure
- **Best Practice**: Always check for null return

```typescript
// Example
const decrypted = await decryptData(encryptedString);
if (decrypted) {
  console.log('Decrypted successfully:', decrypted);
} else {
  console.error('Decryption failed');
}
```

#### `generateLicenseCode(): string`
- **Purpose**: Generate unique license codes
- **Format**: `XXXXX-XXXXX-XXXXX-XXXXX-XXXXX` (25 chars)
- **Character Set**: A-Z, 0-9
- **Uniqueness**: ~842 quadrillion combinations
- **Fallback**: Returns error code on failure

```typescript
// Example
const code = generateLicenseCode();
// Result: "AB3CD-EF9HI-JK2LM-NO5PQ-RS7UV"
```

#### `isValidLicenseCodeFormat(code: string): boolean`
- **Purpose**: Validate license code format
- **Returns**: true if valid format, false otherwise
- **Regex**: `/^[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/`

```typescript
// Examples
isValidLicenseCodeFormat("AB3CD-EF9HI-JK2LM-NO5PQ-RS7UV"); // true
isValidLicenseCodeFormat("invalid-code"); // false
isValidLicenseCodeFormat("ab3cd-ef9hi-jk2lm-no5pq-rs7uv"); // false (lowercase)
```

#### `hashLicenseCode(code: string): Promise<string>`
- **Purpose**: Create SHA-256 hash of license code
- **Use Case**: Compare codes without revealing them
- **Output**: 64-char hex string

```typescript
// Example
const hash = await hashLicenseCode("AB3CD-EF9HI-JK2LM-NO5PQ-RS7UV");
// Result: "a3f8c9d2e1b4f5c6a7b8c9d0e1f2a3b4..."
```

---

## Component 2: UI Component (`src/pages/licenses.tsx`)

### Purpose
Provides React-based user interface for managing licenses.

### Main Features

#### 1. License Countdown Timer
- **Real-time countdown** to expiration
- **Visual indicators** for status (normal, warning, grace, expired)
- **Grace period support** (48 hours after expiration)
- **Updates every second**

```typescript
// Component Props
interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  isWarning: boolean;    // < 7 days
  isGrace: boolean;      // In grace period
}
```

#### 2. License Management
- Create new licenses
- Verify existing licenses
- View license history
- Manage active license
- Export/Import licenses

#### 3. Admin Controls (SuperAdmin only)
- Generate license codes
- Set expiration dates
- View all shop licenses
- Monitor license usage

---

## License Types Configuration

### Available Types

```typescript
LICENSE_TYPES = {
  gratuite: {
    label: 'Licence Gratuite',
    days: 7,
    price: 0,
    description: 'Essai gratuit de 7 jours',
    features: [...]
  },
  mensuelle: {
    label: 'Licence Mensuelle',
    days: 30,
    price: 10000,
    description: 'Utilisation professionnelle',
    features: [...]
  },
  annuelle: {
    label: 'Licence Annuelle',
    days: 365,
    price: 70000,
    description: 'Économies de 50 000 FCFA',
    features: [...]
  },
  vie: {
    label: 'Licence à Vie',
    days: 36135, // 99 years
    price: 200000,
    description: 'Accès permanent',
    features: [...]
  },
  trial: {
    label: 'Essai Gratuit',
    days: 30,
    price: 0,
    description: 'Essai complet 30 jours',
    features: [...]
  }
}
```

---

## Data Flow Architecture

### License Creation Flow
```
┌─────────────────────────────────────────────┐
│ Admin initiates license creation           │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ Authorization check (SuperAdmin only)      │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ Select License Type & Parameters           │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ Generate Unique License Code               │
│ (generateLicenseCode from service)         │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ Create License Object                      │
│ - code, type, shop_id, expires_at, etc    │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ Encrypt License Data                       │
│ (encryptData from service)                 │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ Save to Database                           │
│ - Store encrypted_data column             │
│ - Log creation event                       │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ Display License Code to Admin              │
│ - Show in dialog                           │
│ - Provide copy/export options              │
└──────────────────────────────────────────────┘
```

### License Verification Flow
```
┌──────────────────────────────────────────────┐
│ User enters license key in dialog           │
└────────────────┬─────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────┐
│ Validate format                             │
│ (isValidLicenseCodeFormat from service)    │
└────────────────┬─────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────┐
│ Format Invalid? → Display error & stop     │
└────────────────┬─────────────────────────────┘
                 ↓ (Valid)
┌──────────────────────────────────────────────┐
│ Query database for matching license        │
└────────────────┬─────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────┐
│ License found?                              │
│ No → Error: License not found              │
└────────────────┬─────────────────────────────┘
                 ↓ (Yes)
┌──────────────────────────────────────────────┐
│ Decrypt license data                        │
│ (decryptData from service)                 │
└────────────────┬─────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────┐
│ Check expiration status                     │
│ - Get current time                         │
│ - Compare with expires_at                  │
└────────────────┬─────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────┐
│ Update active license in database           │
│ - Set status to 'active'                   │
│ - Log activation event                     │
└────────────────┬─────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────┐
│ Display success & license details          │
│ - Show countdown timer                     │
│ - Enable application features              │
└──────────────────────────────────────────────┘
```

---

## Security Features

### Encryption
- **Algorithm**: AES-256-GCM
- **Key Derivation**: SHA-256 from secret
- **IV**: 12-byte random IV per encryption
- **Authentication**: GCM provides built-in authentication

### Authentication
- Machine fingerprinting (browser + device)
- System clock rollback detection
- User permission verification
- SuperAdmin-only operations

### Validation
- License code format validation
- Expiration date verification
- Machine ID verification
- Database integrity checks

---

## Configuration & Environment

### Required Environment Variables
```env
# License encryption key (required)
REACT_APP_LICENSE_SECRET=your-secure-secret-key-here

# Payment information
REACT_APP_PAYMENT_EMAIL=support@supermark.com
REACT_APP_PAYMENT_QR=https://payment.qr.code.url
```

### Database Schema

```sql
-- Licenses Table
CREATE TABLE licenses (
  id UUID PRIMARY KEY,
  code VARCHAR(25) UNIQUE,
  type VARCHAR(20), -- 'gratuite', 'mensuelle', 'annuelle', 'vie', 'trial'
  shop_id UUID NOT NULL,
  user_id UUID,
  status VARCHAR(20), -- 'active', 'expired', 'revoked'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  machine_id VARCHAR(100),
  encrypted_data TEXT, -- AES-256-GCM encrypted
  FOREIGN KEY (shop_id) REFERENCES shops(id)
);

-- System Table (for security checks)
CREATE TABLE system (
  id SERIAL PRIMARY KEY,
  machineId VARCHAR(100),
  lastKnownTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Testing Guide

### Unit Tests

```typescript
// Test license code generation
test('generateLicenseCode creates valid format', () => {
  const code = generateLicenseCode();
  expect(isValidLicenseCodeFormat(code)).toBe(true);
});

// Test encryption/decryption
test('encryptData and decryptData are inverse', async () => {
  const original = { test: 'data', number: 123 };
  const encrypted = await encryptData(original);
  const decrypted = await decryptData(encrypted);
  expect(decrypted).toEqual(original);
});

// Test countdown timer
test('LicenseCountdown calculates days correctly', () => {
  const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  // Verify countdown shows ~7 days
});
```

### Integration Tests

```typescript
// Test full license creation flow
test('Create license -> Encrypt -> Store -> Retrieve -> Decrypt', async () => {
  const code = generateLicenseCode();
  const license = { code, type: 'trial', expires_at: futureDate };
  const encrypted = await encryptData(license);
  
  // Store in DB
  await db.saveLicense(encrypted);
  
  // Retrieve and decrypt
  const retrieved = await db.getLicense(code);
  const decrypted = await decryptData(retrieved.encrypted_data);
  
  expect(decrypted.code).toBe(code);
});
```

---

## Troubleshooting

### Issue: "Failed to initialize encryption"
**Cause**: Invalid or missing SECRET_KEY
**Solution**: 
1. Check REACT_APP_LICENSE_SECRET in .env
2. Verify it's not empty
3. Restart development server

### Issue: Countdown shows negative time
**Cause**: System clock is set incorrectly
**Solution**:
1. Sync system time with NTP
2. Check browser time settings
3. Clear browser cache

### Issue: License verification fails
**Cause**: Decryption error or corrupted data
**Solution**:
1. Verify encrypted_data in database
2. Check if SECRET_KEY has changed
3. Re-create license with current key

### Issue: Machine ID keeps changing
**Cause**: Browser privacy settings affecting fingerprinting
**Solution**:
1. Disable privacy protection for domain
2. Use consistent browser profile
3. Implement alternative device ID method

---

## Performance Optimization

### Database Queries
- **Indexing**: Create index on `code` column for fast lookups
- **Pagination**: Load 5 licenses per page
- **Caching**: Cache active license in React state

### Encryption Performance
- **Async operations**: Use async/await properly
- **Batch operations**: Encrypt multiple licenses efficiently
- **Web Workers**: Consider for bulk operations

### UI Performance
- **Memoization**: useCallback for expensive operations
- **Lazy loading**: Load history on demand
- **Virtual scrolling**: For large lists

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database schema created
- [ ] Test license creation
- [ ] Test license verification
- [ ] Test countdown timer
- [ ] Test grace period handling
- [ ] Monitor performance
- [ ] Set up error logging
- [ ] Create backup strategy
- [ ] Document admin procedures

---

## Maintenance Tasks

### Daily
- Monitor error logs
- Check for failed decryptions

### Weekly
- Review active licenses
- Check expiration rates

### Monthly
- Audit license usage
- Backup database
- Review security logs

### Quarterly
- Update encryption keys (with migration)
- Review license types
- Analyze license adoption

---

## Version & Support

- **Version**: 2.0 (Unified & Optimized)
- **Last Updated**: 2026-03-15
- **Status**: ✅ Production Ready
- **Support**: See docs for troubleshooting

---

**End of Reference Guide**
