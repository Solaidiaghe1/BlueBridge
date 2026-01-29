# 🔐 Clerk Setup - Quick Reference

## ⚡ Quick Start

### 1. Add Your Clerk Key
**File:** `/Users/solaidiaghe/Desktop/BlueBridge/App.tsx` (Line 33)

Replace:
```typescript
const publishableKey = 'your_clerk_publishable_key_here';
```

With your actual key:
```typescript
const publishableKey = 'pk_test_XXXXXXXXXXXXX';
```

### 2. Get Your Key
1. Go to: https://dashboard.clerk.com
2. Select your application
3. Navigate to: **API Keys**
4. Copy: **Publishable Key**

---

## 📦 What's Installed

```bash
✅ @clerk/clerk-expo       # Clerk SDK
✅ expo-secure-store        # Secure token storage
✅ dotenv                   # Environment variables
```

---

## 📁 Files Modified

```
✅ App.tsx                  # ClerkProvider added
✅ .env                     # Key storage (not committed)
✅ .env.example             # Template (safe to commit)
✅ .gitignore               # Already protecting .env
✅ app.json                 # Config updated
```

---

## 🔐 Security Features

✅ **Tokens encrypted** in iOS Keychain / Android Keystore  
✅ **Keys protected** by .gitignore  
✅ **Auto-refresh** tokens handled by Clerk  
✅ **Secure cache** with error handling  

---

## 🚀 Next Steps

### Create Auth Screens
1. **LoginScreen.tsx** - Email/password login
2. **SignupScreen.tsx** - User registration
3. **VerificationScreen.tsx** - Email/phone verification
4. **AuthNavigator.tsx** - Auth flow navigation

### Update RootNavigator
```typescript
import { useAuth } from '@clerk/clerk-expo';

export const RootNavigator = () => {
  const { isSignedIn } = useAuth();
  return isSignedIn ? <MainApp /> : <AuthFlow />;
};
```

### Add Logout
```typescript
import { useAuth } from '@clerk/clerk-expo';

const { signOut } = useAuth();

<Button title="Log Out" onPress={signOut} />
```

---

## 🎯 Common Hooks

```typescript
// Get current user
const { user, isLoaded, isSignedIn } = useUser();

// Authentication actions
const { signOut } = useAuth();

// Sign in
const { signIn, setActive } = useSignIn();

// Sign up
const { signUp } = useSignUp();

// OAuth
const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
```

---

## 📚 Full Documentation

See: `/docs/CLERK_AUTHENTICATION_SETUP.md`

---

## ✅ Ready to Use!

Just add your Clerk publishable key to App.tsx and you're ready to build your authentication flow! 🎉
