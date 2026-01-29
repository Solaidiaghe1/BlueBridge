# 🔍 Supabase Sync Diagnostic Guide

## Issue: "Failed to sync user profile"

Your logs show:
```
LOG  🔄 Syncing user to Supabase...
[hangs here - no further logs]
```

This means the `syncUser()` function is being called but not completing.

---

## 🎯 Most Likely Causes

### 1. **Supabase Table Doesn't Exist** (MOST COMMON)
The `users` table hasn't been created yet.

**Fix:**
```sql
-- Go to Supabase Dashboard → SQL Editor
-- Run this schema:

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('client', 'worker')) NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON users;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (true);  -- Allow all for testing

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (true);  -- Allow all for testing

CREATE POLICY "Allow insert for authenticated users"
  ON users FOR INSERT
  WITH CHECK (true);  -- Allow all for testing
```

### 2. **RLS Policies Too Restrictive**
Row Level Security might be blocking inserts.

**Temp Fix (for testing):**
```sql
-- Disable RLS temporarily to test
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

**Proper Fix (after testing):**
```sql
-- Re-enable with correct policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to insert
CREATE POLICY "Allow authenticated inserts"
  ON users FOR INSERT
  WITH CHECK (true);
```

### 3. **Wrong Supabase URL/Key**
Check your `.env` file credentials.

**Verify:**
```bash
cat .env | grep SUPABASE
```

Should show:
```
EXPO_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## 🧪 Detailed Diagnostic Steps

### Step 1: Check Enhanced Logs
With the new logging, run sign up again and look for:

```
Expected logs:
🔹 syncUser() called with role: client
🔹 Clerk user ID: usr_xxx...
🔹 Clerk user email: test@example.com
🔹 Checking if user exists in Supabase...
🔹 Supabase query completed
🔹 Fetch error: [null or error object]
🔹 Fetch error code: [PGRST116 or other]
```

**If logs stop at "Checking if user exists":**
- Network issue or Supabase URL wrong
- Check `.env` file

**If error code is NOT "PGRST116":**
- Table doesn't exist
- Run schema.sql

**If error code IS "PGRST116":**
- User doesn't exist (expected)
- Should proceed to create user

### Step 2: Verify Supabase Connection
In your app console, you should see:

```javascript
// Good connection:
🔹 Supabase query completed
🔹 Fetch error: { code: 'PGRST116', message: 'no rows returned' }
🔹 Existing user: null
📝 Creating new user in Supabase...

// Bad connection:
🔹 Checking if user exists in Supabase...
[hangs - no further logs]
```

### Step 3: Check Supabase Dashboard

1. **Go to:** https://supabase.com/dashboard/project/cmgpkjaiilsridyrwqvd

2. **Check Table Editor:**
   - Left menu → "Table Editor"
   - Look for "users" table
   - If missing → Run schema.sql

3. **Check RLS Policies:**
   - Click on "users" table
   - Click "RLS" tab at top
   - Should see 3 policies
   - If too restrictive, disable RLS temporarily

4. **Check API Settings:**
   - Left menu → "Settings" → "API"
   - Verify URL and anon key match `.env`

---

## 🔧 Quick Fixes

### Fix 1: Create Table (Run Schema)
```bash
# 1. Open Supabase Dashboard
# 2. Go to SQL Editor
# 3. Copy contents of: supabase/schema.sql
# 4. Paste and click "Run"
```

### Fix 2: Disable RLS Temporarily
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

### Fix 3: Test Connection Directly
Add this to your app (temporary test):

```typescript
// In RoleSelectorScreen.tsx, add before handleVerifyEmail:
const testSupabaseConnection = async () => {
  console.log('🧪 Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('users').select('count');
    console.log('✅ Supabase connected!', data);
    console.log('❌ Supabase error:', error);
  } catch (err) {
    console.error('❌ Connection test failed:', err);
  }
};

// Call it before sync:
await testSupabaseConnection();
```

---

## 📊 Expected Console Output (Working)

```
🔄 Verifying email with code...
✅ Email verified, setting active session...
🔄 Syncing user to Supabase...
📊 Selected role: client
📊 User object available: true
🔹 syncUser() called with role: client
🔹 Clerk user ID: usr_2abc123...
🔹 Clerk user email: test@example.com
🔹 Checking if user exists in Supabase...
🔹 Supabase query completed
🔹 Fetch error: { code: 'PGRST116', ... }
🔹 Fetch error code: PGRST116
🔹 Existing user: null
📝 Creating new user in Supabase...
📝 New user data: {
  "clerk_user_id": "usr_2abc123...",
  "email": "test@example.com",
  "first_name": null,
  "last_name": null,
  "role": "client",
  "phone": null
}
🔹 Insert completed
🔹 Create error: null
🔹 Created user: { id: "...", clerk_user_id: "...", ... }
✅ User created in Supabase: uuid-123...
🔹 syncUser() completed
✅ User synced to Supabase: { id: "...", ... }
🎉 Navigating to Client Home...
```

---

## 🚨 Common Error Messages

### Error: "relation 'users' does not exist"
**Solution:** Run `supabase/schema.sql` in SQL Editor

### Error: "new row violates row-level security policy"
**Solution:** Disable RLS or fix policies:
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

### Error: "no rows returned" (code: PGRST116)
**This is NORMAL!** It means user doesn't exist yet. Should proceed to create.

### Error: "null value in column 'clerk_user_id'"
**Solution:** User object not available yet. Wait for session to activate.

---

## ✅ Action Plan

**Right Now:**

1. **Check Supabase Dashboard**
   - Verify table exists
   - Check RLS policies

2. **Run Schema if Needed**
   - Copy `supabase/schema.sql`
   - Run in SQL Editor

3. **Test Again with Enhanced Logging**
   - Sign up with new email
   - Watch console for detailed logs
   - Report what you see

4. **If Still Failing**
   - Copy ALL console logs
   - Share error details
   - We'll debug together

---

## 📝 Next Steps After Fix

Once sync works, you should see:
- ✅ User in Supabase `users` table
- ✅ Navigation to home screen
- ✅ No more "failed to sync" errors

Then we can:
- Re-enable RLS with proper policies
- Add proper JWT authentication
- Secure the database

---

**Status:** 🔍 Diagnostic Mode Active  
**Next:** Run schema.sql and test with enhanced logging
