# Quick Setup Guide for Chat Message Encryption

## 1. Generate Encryption Key
Run this command to generate a secure encryption key:

```bash
node -e "console.log('CHAT_ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

Example output:
```
CHAT_ENCRYPTION_KEY=585fc6bd2ac1fe17d7157eadcca21ebd226032d4dcdb89621b175e5298f395be
```

## 2. Add to Environment Variables
Add the generated key to your `.env.local` file:

```bash
# Chat Message Encryption
CHAT_ENCRYPTION_KEY=585fc6bd2ac1fe17d7157eadcca21ebd226032d4dcdb89621b175e5298f395be
```

## 3. Restart Your Development Server
After adding the environment variable, restart your Next.js development server:

```bash
npm run dev
```

## 4. Test the Implementation
All new chat messages will now be automatically encrypted before storage and decrypted when retrieved.

## Files Modified
- ✅ `src/lib/encryption.ts` - Core encryption utilities
- ✅ `src/app/api/v1/chat/send-message/route.ts` - Encrypts messages before storage
- ✅ `src/app/api/v1/chat/get-room-messages/route.ts` - Decrypts messages before retrieval

## Documentation
- See `documentation/product-features/chat-message-encryption.md` for complete documentation
- See `documentation/product-features/real-time-chat-with-hasura.md` for general chat setup

## Security Features
- ✅ AES-256-GCM encryption
- ✅ Random IV per message
- ✅ Authentication tags prevent tampering
- ✅ Backward compatibility with existing messages
- ✅ Environment-based key management

The implementation is now ready for production use!
