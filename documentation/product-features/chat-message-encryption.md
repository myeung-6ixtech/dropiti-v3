# Chat Message Encryption Implementation

Last updated: 2025-01-01

## Overview
This document describes the implementation of application-level encryption for chat messages in the Dropiti platform. All chat messages are encrypted using AES-256-GCM before being stored in the database, ensuring message privacy and security.

## Security Features

### Encryption Algorithm
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Size**: 256 bits (32 bytes)
- **IV Size**: 128 bits (16 bytes) - randomly generated per message
- **Tag Size**: 128 bits (16 bytes) - for authentication
- **Authentication**: Additional Authenticated Data (AAD) using "dropiti-chat"

### Key Management
- **Key Storage**: Environment variable `CHAT_ENCRYPTION_KEY`
- **Key Format**: 64-character hexadecimal string (32 bytes)
- **Key Derivation**: PBKDF2 with SHA-256 (100,000 iterations) for string-based keys
- **Salt**: "dropiti-chat-salt" (hardcoded for consistency)

## Implementation Details

### File Structure
```
src/lib/encryption.ts                    # Core encryption utilities
src/app/api/v1/chat/send-message/        # Encrypts messages before storage
src/app/api/v1/chat/get-room-messages/   # Decrypts messages before retrieval
```

### Core Functions

#### `encryptMessage(plaintext: string): string`
- Encrypts a plain text message
- Generates random IV for each message
- Returns base64-encoded encrypted data (IV + tag + encrypted content)

#### `decryptMessage(encryptedData: string): string`
- Decrypts an encrypted message
- Extracts IV, tag, and encrypted content
- Returns original plain text

#### `isEncrypted(data: string): boolean`
- Checks if a string appears to be encrypted
- Used for backward compatibility with unencrypted messages

#### `generateEncryptionKey(): string`
- Generates a new 256-bit encryption key
- Returns hex string for environment variable setup

## API Integration

### Send Message API (`/api/v1/chat/send-message`)
```typescript
// Before storage
const encryptedContent = encryptMessage(content);

// Store encrypted content in database
await executeMutation(SEND_MESSAGE_MUTATION, {
  roomId,
  senderFirebaseUid,
  content: encryptedContent
});

// Return original content to client
return {
  ...messageData,
  content: content // Original, unencrypted content
};
```

### Get Messages API (`/api/v1/chat/get-room-messages`)
```typescript
// Decrypt messages before returning
const decryptedMessages = messages.map(message => ({
  ...message,
  content: isEncrypted(message.content) 
    ? decryptMessage(message.content) 
    : message.content // Fallback for unencrypted messages
}));
```

## Environment Setup

### 1. Generate Encryption Key
```bash
# Generate a new encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Add to Environment Variables
```bash
# .env.local
CHAT_ENCRYPTION_KEY=585fc6bd2ac1fe17d7157eadcca21ebd226032d4dcdb89621b175e5298f395be
```

### 3. Production Deployment
- Store the encryption key securely in your production environment
- Use a key management service (AWS KMS, Azure Key Vault, etc.) for production
- Never commit encryption keys to version control

## Security Benefits

### Data Protection
- **At Rest**: Messages are encrypted in the database
- **In Transit**: HTTPS ensures encrypted transport
- **In Memory**: Decryption only happens server-side

### Authentication
- **Message Integrity**: GCM mode prevents tampering
- **Authentication**: AAD ensures message authenticity
- **Unique IVs**: Prevents pattern analysis attacks

### Key Security
- **Strong Key Derivation**: PBKDF2 with 100,000 iterations
- **Environment Isolation**: Keys not stored in code
- **Key Rotation**: Can be updated by changing environment variable

## Backward Compatibility

### Migration Strategy
- New messages are automatically encrypted
- Old unencrypted messages are detected and handled gracefully
- No database migration required
- Gradual transition as users send new messages

### Error Handling
```typescript
try {
  content = decryptMessage(encryptedContent);
} catch (error) {
  console.error('Failed to decrypt message:', messageId, error);
  content = '[Message could not be decrypted]';
}
```

## Performance Considerations

### Encryption Overhead
- **CPU**: Minimal impact (~1ms per message)
- **Storage**: ~33% increase in message size (IV + tag + base64 encoding)
- **Memory**: Temporary encryption/decryption buffers

### Optimization
- Encryption/decryption happens only at API boundaries
- No impact on database queries or indexing
- Caching can be implemented at the API level

## Monitoring and Logging

### Security Logging
```typescript
// Log encryption errors (without sensitive data)
console.error('Encryption error:', error);
console.error('Failed to decrypt message:', messageId, error);
```

### Metrics to Monitor
- Encryption/decryption success rates
- Message processing times
- Error rates by message type

## Future Enhancements

### Advanced Features
1. **Key Rotation**: Implement automatic key rotation
2. **End-to-End Encryption**: Client-side encryption for additional security
3. **Message Forward Secrecy**: Generate unique keys per conversation
4. **Audit Logging**: Track encryption/decryption operations

### Compliance
- **GDPR**: Right to be forgotten (message deletion)
- **SOC 2**: Data protection and encryption standards
- **HIPAA**: Healthcare data protection (if applicable)

## Troubleshooting

### Common Issues

#### "CHAT_ENCRYPTION_KEY environment variable is required"
- Ensure the environment variable is set
- Check for typos in variable name
- Verify the key is 64 characters long (hex)

#### "Failed to decrypt message"
- Check if the encryption key has changed
- Verify message format (should be base64)
- Check for data corruption

#### "Message could not be decrypted"
- Old unencrypted messages (expected)
- Corrupted encrypted data
- Wrong encryption key

### Debug Mode
```typescript
// Add to encryption.ts for debugging
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Encrypting message:', plaintext.substring(0, 50) + '...');
  console.log('Encrypted length:', encryptedData.length);
}
```

## Testing

### Unit Tests
```typescript
import { encryptMessage, decryptMessage, isEncrypted } from '@/lib/encryption';

describe('Encryption', () => {
  test('should encrypt and decrypt messages', () => {
    const original = 'Hello, world!';
    const encrypted = encryptMessage(original);
    const decrypted = decryptMessage(encrypted);
    
    expect(decrypted).toBe(original);
    expect(isEncrypted(encrypted)).toBe(true);
  });
});
```

### Integration Tests
- Test API endpoints with encrypted messages
- Verify backward compatibility with unencrypted messages
- Test error handling for corrupted data

## Security Audit Checklist

- [ ] Encryption key is stored securely
- [ ] No encryption keys in version control
- [ ] HTTPS is enforced for all API calls
- [ ] Error messages don't leak sensitive information
- [ ] Logging doesn't include message content
- [ ] Key rotation process is documented
- [ ] Backup and recovery procedures include key management
- [ ] Access controls limit who can view encrypted data

## Related Documentation

- [Real-time Chat Implementation](./real-time-chat-with-hasura.md)
- [API Structure Guide](../guides/api-structure.md)
- [Database Schema](../database/chat-database-setup.sql)

## Support

For questions or issues related to chat message encryption:
1. Check this documentation first
2. Review error logs for specific issues
3. Test with the provided debugging tools
4. Contact the development team for assistance
