# Remember Me Feature Documentation

## Overview
The "Remember Me" feature allows users to stay logged in for extended periods (90 days) instead of the default session duration (30 days). This feature enhances user experience by reducing the need to re-authenticate frequently.

## Implementation Details

### 1. User Interface
- **Checkbox**: Added to the sign-in form (`/auth/signin`)
- **State Management**: Controlled by React state in `SignInForm.tsx`
- **Persistence**: User preference is saved to localStorage

### 2. Authentication Flow
- **Sign In**: When user checks "Remember Me" and submits the form:
  1. Preference is saved to localStorage (`dropiti_remember_me`)
  2. Login request includes `rememberMe: true` parameter
  3. NextAuth processes the extended session

- **Session Duration**:
  - **Default**: 30 days (standard session)
  - **With Remember Me**: 90 days (extended session)

### 3. Technical Implementation

#### Frontend Components
- **SignInForm.tsx**: 
  - Added `rememberMe` state
  - Checkbox with localStorage persistence
  - Passes preference to login function

- **AuthContext.tsx**:
  - Extended login function to accept `rememberMe` parameter
  - Tracks remember me status in context
  - Provides `isRememberMeEnabled` to components

#### Backend Configuration
- **NextAuth Config** (`authOptions.ts`):
  - Added `rememberMe` to credentials provider
  - JWT callback handles extended expiration
  - Session duration dynamically set based on preference

#### Session Management
- **JWT Expiration**: 
  - Standard: 30 days
  - Extended: 90 days (when remember me is enabled)
- **Automatic Cleanup**: Session expires automatically
- **Logout**: Clears remember me preference

### 4. User Experience Features

#### Automatic Preference Loading
- On page load, checks localStorage for saved preference
- Automatically checks/unchecks the "Remember Me" checkbox
- Maintains user's previous choice across sessions

#### Session Monitoring
- Periodic checks for session expiry (every hour)
- Logs session status for debugging
- Ready for future toast notifications

#### Clean Logout
- Removes remember me preference on logout
- Ensures security by not persisting across logout

### 5. Security Considerations

#### Session Duration
- **Standard**: 30 days (balanced security/convenience)
- **Extended**: 90 days (convenience-focused)
- **Automatic Expiry**: Sessions expire regardless of remember me status

#### Data Persistence
- **localStorage**: Only stores user preference (not credentials)
- **No Sensitive Data**: Authentication tokens handled by NextAuth
- **Secure Cleanup**: Preference cleared on logout

### 6. Configuration Options

#### Environment Variables
- `NEXTAUTH_SECRET`: Required for JWT signing
- `NEXT_PUBLIC_FIREBASE_API_KEY`: For Firebase authentication

#### Customization Points
- **Session Durations**: Configurable in `authOptions.ts`
- **Check Frequency**: Adjustable in `AuthContext.tsx`
- **Storage Key**: Customizable localStorage key name

### 7. Future Enhancements

#### Planned Features
- **Toast Notifications**: Warn users before session expiry
- **Session Refresh**: Automatic token renewal
- **Device Management**: Track multiple active sessions
- **Security Settings**: User-configurable session duration

#### Integration Points
- **Analytics**: Track remember me usage patterns
- **Security Monitoring**: Log extended session usage
- **User Preferences**: Store in user profile database

## Usage Examples

### Basic Implementation
```tsx
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { isRememberMeEnabled, login } = useAuth();
  
  const handleLogin = async (email: string, password: string, rememberMe: boolean) => {
    const result = await login(email, password, rememberMe);
    if (result.success) {
      console.log('Login successful, remember me:', rememberMe);
    }
  };
  
  return (
    <div>
      <p>Remember Me Status: {isRememberMeEnabled ? 'Enabled' : 'Disabled'}</p>
    </div>
  );
}
```

### Form Integration
```tsx
const [rememberMe, setRememberMe] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Save preference to localStorage
  localStorage.setItem('dropiti_remember_me', rememberMe.toString());
  
  // Login with preference
  const result = await login(email, password, rememberMe);
};
```

## Troubleshooting

### Common Issues
1. **Preference Not Saved**: Check localStorage permissions
2. **Session Still Expires**: Verify NextAuth configuration
3. **Checkbox State Mismatch**: Clear localStorage and retry

### Debug Information
- Check browser console for session expiry logs
- Verify localStorage values in DevTools
- Monitor NextAuth debug output

## Testing

### Manual Testing
1. Sign in with "Remember Me" checked
2. Verify localStorage contains preference
3. Check session duration in NextAuth
4. Test logout clears preference

### Automated Testing
- Unit tests for AuthContext functions
- Integration tests for sign-in flow
- E2E tests for complete user journey

---

*This feature enhances user experience while maintaining security best practices. For questions or issues, refer to the authentication team.*
