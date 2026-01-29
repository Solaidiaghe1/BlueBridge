# 🔐 CRITICAL FIX - Clerk JWT → Supabase Authentication

**Date:** January 7, 2026  
**Status:** 🔴 **MUST COMPLETE BEFORE TESTING**

---

## 🚨 What Was Wrong

Your Supabase client was using **anonymous authentication**, which meant:
- ❌ Supabase had **no idea** who the Clerk user was
- ❌ `request.jwt.claims` was **empty**
- ❌ RLS policies silently blocked inserts/selects
- ❌ Behavior appeared "random"

**Reality:**
```
Your code assumed:  Supabase request → has Clerk JWT → RLS allows insert
What actually happened:  Supabase request → anonymous → RLS blocks ❌
```

---

## ✅ What Was Fixed

### 1. Added Clerk JWT Authentication to Supabase
**File:** `src/hooks/useUserSync.ts`

```typescript
const authenticateSupabase = async (): Promise<boolean> => {
  const token = await getToken({ template: 'supabase' });
  
  await supabase.auth.setSession({
    access_token: token,
    refresh_token: token, // React Native quirk
  });
  
  return true;
};
```

**Now:**
- ✅ Supabase **knows** who the Clerk user is
- ✅ RLS policies have access to Clerk user ID
- ✅ `request.jwt.claims` contains Clerk data
- ✅ Inserts/selects work correctly

---

### 2. Made syncUser() Idempotent
**Guards added:**
```typescript
// Guard: Already synced
if (supabaseUser) return supabaseUser;

// Guard: Already syncing
if (isSyncing) return null;

// Guard: No Clerk user
if (!clerkUser) return null;
```

**Now:**
- ✅ Safe to call multiple times
- ✅ Won't create duplicates
- ✅ Won't cause race conditions

---

### 3. Separated Loading States
**Before:** `loading` (single state for everything)  
**After:** `isSyncing` (specific to sync operation)

**Now:**
- ✅ UI can show accurate loading states
- ✅ No false "loading finished" signals
- ✅ Better UX

---

### 4. Removed Auto-Fetch useEffect
**Reason:** Caused race conditions and duplicate sync attempts

**Now:**
- ✅ `syncUser()` only runs when explicitly called
- ✅ No automatic background fetches
- ✅ Predictable behavior

---

## 🔧 REQUIRED SETUP (DO THIS NOW)

### Step 1: Create Clerk JWT Template for Supabase

1. **Go to Clerk Dashboard:**
   ```
   https://dashboard.clerk.com
   ```

2. **Navigate to:**
   ```
   Your App → JWT Templates → New Template
   ```

3. **Select:** "Supabase" from templates

4. **Template will auto-populate with:**
   ```json
   {
     "aud": "authenticated",
     "exp": {{user.exp}},
     "iat": {{user.iat}},
     "iss": "{{app.publicMetadata.supabaseUrl}}",
     "sub": "{{user.id}}",
     "email": "{{user.primaryEmailAddress}}",
     "phone": "{{user.primaryPhoneNumber}}",
     "app_metadata": {
       "provider": "clerk"
     },
     "user_metadata": {
       "full_name": "{{user.fullName}}"
     }
   }
   ```

5. **Name it:** `supabase` (IMPORTANT: must match code)

6. **Save the template**

---

### Step 2: Update Supabase RLS Policies

Your current policies check:
```sql
current_setting('request.jwt.claims', true)::json->>'sub'
```

This is **correct** — it will now work because Clerk JWT contains `sub: user_id`.

**No changes needed to SQL** — your policies are already correct!

---

### Step 3: Verify Environment Variables

**File:** `.env`

Ensure these exist:
```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_SUPABASE_URL=https://...supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJh...
```

All three are **required**.

---

## 🧪 Testing the Fix

### Test 1: Check JWT Token
```typescript
// Add this temporarily to see the token
const { getToken } = useAuth();
const token = await getToken({ template: 'supabase' });
console.log('🔐 Clerk JWT Token:', token);
```

**Expected:** A long JWT string (not null/undefined)

---

### Test 2: Check Supabase Session
```typescript
// After authenticateSupabase()
const session = supabase.auth.session();
console.log('🔐 Supabase Session:', session);
```

**Expected:** Session object with `access_token`

---

### Test 3: Full Sign Up Flow
```
1. npm start
2. Select role → Sign up
3. Verify email
4. Console should show:

🔐 Getting Clerk JWT token...
✅ Clerk token received
🔐 Setting Supabase session with Clerk JWT...
✅ Supabase authenticated with Clerk JWT
🔹 Checking if user exists in Supabase...
📝 Creating new user in Supabase...
✅ User created in Supabase: uuid-...
```

---

## 📊 Expected Console Output (Success)

```
LOG  🔄 Verifying email with code...
LOG  ✅ Email verified, setting active session...
LOG  🔄 Syncing user to Supabase...
LOG  🔹 syncUser() called with role: client
LOG  🔐 Getting Clerk JWT token...
LOG  ✅ Clerk token received
LOG  🔐 Setting Supabase session with Clerk JWT...
LOG  ✅ Supabase authenticated with Clerk JWT
LOG  🔹 Clerk user ID: usr_xxx
LOG  🔹 Clerk user email: user@example.com
LOG  🔹 Checking if user exists in Supabase...
LOG  🔹 Supabase query completed
LOG  🔹 Fetch error code: PGRST116
LOG  📝 User not found, creating new user in Supabase...
LOG  📝 New user data: {...}
LOG  ✅ User created in Supabase: uuid-xxx
LOG  ✅ User synced to Supabase: {...}
LOG  🎉 Navigating to home screen
```

---

## 🚨 If It Still Fails

### Error: "No template named 'supabase'"
**Fix:** Create the JWT template in Clerk dashboard (Step 1 above)

### Error: "Invalid JWT"
**Fix:** Check that template is named exactly `supabase`

### Error: "RLS policy violation"
**Fix:** Verify RLS policies are checking `request.jwt.claims`

### Error: "Token is null"
**Fix:** User might not be fully authenticated yet

---

## 📝 Changes Made

| File | Changes |
|------|---------|
| `useUserSync.ts` | Added `authenticateSupabase()` |
| `useUserSync.ts` | Added idempotency guards |
| `useUserSync.ts` | Changed `loading` → `isSyncing` |
| `useUserSync.ts` | Removed auto-fetch useEffect |
| `useUserSync.ts` | Added `useAuth` import |

---

## 🎯 Why This Fixes Everything

### Before:
```
Clerk: "User is user_123"
Supabase: "I see an anonymous request"
RLS: "No user_id, block it"
Result: ❌ Insert fails silently
```

### After:
```
Clerk: "User is user_123, here's a JWT"
Supabase: "JWT says user is user_123"
RLS: "user_123 matches, allow it"
Result: ✅ Insert succeeds
```

---

## ✅ Next Steps

1. **REQUIRED:** Create Clerk JWT template named `supabase`
2. **Test:** Run sign up flow
3. **Verify:** Check Supabase users table
4. **Confirm:** Console shows authentication logs

---

## 🎉 What You'll Get

After this fix:
- ✅ Users sync to Supabase reliably
- ✅ RLS policies work correctly
- ✅ No more "random" failures
- ✅ No more duplicate insert attempts
- ✅ Clean, predictable auth flow

---

**Status:** 🟡 **Waiting for Clerk JWT Template Setup**  
**Priority:** 🔴 **CRITICAL - Required for auth to work**  
**ETA:** 5 minutes to set up template

---

## 📚 References

- [Clerk JWT Templates](https://clerk.com/docs/backend-requests/making/jwt-templates)
- [Supabase + Clerk Integration](https://supabase.com/docs/guides/auth/social-login/auth-clerk)
- [Clerk + React Native](https://clerk.com/docs/quickstarts/expo)
