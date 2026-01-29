# 🧪 Authentication Testing Guide

## Quick Start

```bash
# 1. Make sure Expo server is running
cd /Users/solaidiaghe/Desktop/BlueBridge
npx expo start --clear

# 2. Open in simulator or scan QR code
```

---

## ✅ Test Checklist

### Prerequisites
- [ ] SQL schema has been run in Supabase
- [ ] `.env` file has correct Clerk and Supabase credentials
- [ ] Expo server is running without errors

---

## Test 1: Sign Up Flow

### Steps:
1. [ ] Open app
2. [ ] Select role: **Client**
3. [ ] Click "Don't have an account? Sign up"
4. [ ] Enter email: `test1@example.com`
5. [ ] Enter password: `TestPassword123!`
6. [ ] Click **"Sign Up"**

### Expected Results:
- [ ] ✅ Alert shows: "Check Your Email"
- [ ] ✅ Console logs:
  ```
  🔄 Creating Clerk account...
  ✅ Clerk account created
  ```
- [ ] ✅ You receive verification email

7. [ ] Open email and click verification link (or enter code)

### After Verification:
- [ ] ✅ Console logs:
  ```
  ✅ User authenticated and verified: user_xxxxx
  🔄 Syncing user to Supabase...
  ✅ User synced to Supabase: {user data}
  ```
- [ ] ✅ App navigates to Client screen automatically
- [ ] ✅ User appears in [Supabase users table](https://supabase.com/dashboard/project/cmgpkjaiilsridyrwqvd/editor)

---

## Test 2: Sign In Flow

### Steps:
1. [ ] Go to Account screen
2. [ ] Click **"Sign Out"**
3. [ ] Confirm sign out
4. [ ] You're back at role selection screen
5. [ ] Select **Client** again
6. [ ] Enter same email: `test1@example.com`
7. [ ] Enter password: `TestPassword123!`
8. [ ] Click **"Sign In"**

### Expected Results:
- [ ] ✅ Console logs:
  ```
  🔄 Signing in with Clerk...
  ✅ Clerk sign in successful
  ✅ User authenticated and verified: user_xxxxx
  🔄 Syncing user to Supabase...
  ✅ User synced to Supabase: {user data}
  ```
- [ ] ✅ App navigates to Client screen
- [ ] ✅ No duplicate user rows in Supabase (upsert prevents this)

---

## Test 3: Worker Role

### Steps:
1. [ ] Sign out
2. [ ] Select **Worker** role this time
3. [ ] Click "Sign up"
4. [ ] Enter NEW email: `worker1@example.com`
5. [ ] Enter password: `WorkerPass123!`
6. [ ] Click **"Sign Up"**
7. [ ] Verify email

### Expected Results:
- [ ] ✅ Same console logs as Test 1
- [ ] ✅ App navigates to **Worker** screen (not Client)
- [ ] ✅ Supabase has new user with `role: "worker"`

---

## Test 4: Verify Supabase Data

### Steps:
1. [ ] Go to [Supabase Table Editor](https://supabase.com/dashboard/project/cmgpkjaiilsridyrwqvd/editor)
2. [ ] Click **"users"** table
3. [ ] Click **Refresh** icon

### Expected Data:

| Column | Expected Value | Notes |
|--------|---------------|-------|
| `id` | UUID | Auto-generated |
| `clerk_user_id` | `user_xxxxx` | From Clerk |
| `email` | `test1@example.com` | Your test email |
| `first_name` | Your first name | From Clerk profile |
| `last_name` | Your last name | From Clerk profile |
| `role` | `client` or `worker` | Based on selection |
| `phone` | `null` | Not collected yet |
| `created_at` | Timestamp | Auto-generated |

- [ ] ✅ All fields populated correctly
- [ ] ✅ No duplicate rows for same email

---

## Test 5: Error Handling

### Test Invalid Credentials:
1. [ ] Try to sign in with wrong password
2. [ ] Expected: Error alert shows

### Test Missing Fields:
1. [ ] Leave email or password empty
2. [ ] Click Sign Up
3. [ ] Expected: "Please fill in all fields" alert

### Test Invalid Email:
1. [ ] Enter: `notanemail`
2. [ ] Click Sign Up
3. [ ] Expected: Clerk validation error

---

## 📊 Console Log Examples

### ✅ Successful Sign Up
```
🔄 Creating Clerk account...
✅ Clerk account created
✅ User authenticated and verified: user_2abc123
🔄 Syncing user to Supabase...
✅ User synced to Supabase: {
  id: "550e8400-e29b-41d4-a716-446655440000",
  clerk_user_id: "user_2abc123",
  email: "test1@example.com",
  first_name: "Test",
  last_name: "User",
  role: "client",
  phone: null,
  created_at: "2026-01-07T10:30:00.000Z"
}
```

### ✅ Successful Sign In
```
🔄 Signing in with Clerk...
✅ Clerk sign in successful
✅ User authenticated and verified: user_2abc123
🔄 Syncing user to Supabase...
✅ User synced to Supabase: {...}
```

### ❌ Sign In Error
```
Sign in error: {
  errors: [{
    code: "form_password_incorrect",
    message: "Password is incorrect. Try again, or use another method."
  }]
}
```

---

## 🔧 Troubleshooting

### Issue: "Check Your Email" but no email received

**Solutions:**
1. Check spam folder
2. Check Clerk Dashboard → Users → Email Verification Status
3. Verify Clerk email settings are configured

### Issue: User not appearing in Supabase

**Solutions:**
1. Check console for sync errors
2. Verify `.env` has correct Supabase credentials
3. Check Supabase logs: Dashboard → Logs → Query Performance
4. Verify SQL schema was run successfully

### Issue: "Failed to sync user profile"

**Solutions:**
1. Check `.env` file:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://cmgpkjaiilsridyrwqvd.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
   ```
2. Restart Expo: `Ctrl+C` then `npx expo start --clear`
3. Check Supabase RLS policies are configured
4. Check console for detailed error message

### Issue: App not navigating after sign in

**Solutions:**
1. Check if `useEffect` dependencies are correct
2. Verify `selectedRole` is set
3. Check console logs for any errors
4. Make sure `onClientSelect` and `onServiceSelect` props are passed correctly

### Issue: Duplicate users in Supabase

**Solutions:**
- Should not happen due to `upsert` with unique `clerk_user_id`
- If it does, check:
  1. SQL schema has `UNIQUE` constraint on `clerk_user_id`
  2. `useUserSync.ts` uses `.upsert()` not `.insert()`

---

## 🎯 Success Criteria

All tests pass when:

- [ ] ✅ Sign up creates user in Clerk
- [ ] ✅ Email verification works
- [ ] ✅ User syncs to Supabase after verification
- [ ] ✅ Sign in fetches existing user
- [ ] ✅ No duplicate rows in Supabase
- [ ] ✅ Role is correctly set (client vs worker)
- [ ] ✅ first_name and last_name populated
- [ ] ✅ Navigation works correctly
- [ ] ✅ Sign out works
- [ ] ✅ Can sign in again after sign out
- [ ] ✅ Console logs show correct flow
- [ ] ✅ No errors in console

---

## 📝 Test Results Template

Copy this and fill in after testing:

```markdown
## Test Results - [Date]

### Environment:
- Device: [iOS Simulator / Android / Physical Device]
- Expo Version: [check package.json]
- Node Version: [run `node -v`]

### Test 1: Sign Up
- Status: [ ] PASS [ ] FAIL
- Notes: 

### Test 2: Sign In
- Status: [ ] PASS [ ] FAIL
- Notes:

### Test 3: Worker Role
- Status: [ ] PASS [ ] FAIL
- Notes:

### Test 4: Supabase Data
- Status: [ ] PASS [ ] FAIL
- Notes:

### Test 5: Error Handling
- Status: [ ] PASS [ ] FAIL
- Notes:

### Issues Found:
1. 
2. 
3. 

### Overall Status: [ ] ALL TESTS PASSED [ ] NEEDS FIXES
```

---

## 🚀 Next Steps After Testing

### If All Tests Pass ✅
1. Mark authentication feature as complete
2. Move to next feature (e.g., service requests)
3. Update documentation with any learnings

### If Tests Fail ❌
1. Note which test failed
2. Copy error messages from console
3. Check troubleshooting section above
4. Share console logs for help

---

## 📞 Quick Reference

### Important URLs:
- **Clerk Dashboard:** https://dashboard.clerk.com
- **Supabase Dashboard:** https://supabase.com/dashboard/project/cmgpkjaiilsridyrwqvd
- **Supabase Users Table:** https://supabase.com/dashboard/project/cmgpkjaiilsridyrwqvd/editor

### Important Files:
- `.env` - Environment variables
- `src/navigation/RoleSelectorScreen.tsx` - Auth UI
- `src/hooks/useUserSync.ts` - Supabase sync logic
- `src/config/supabase.ts` - Supabase client
- `supabase/schema.sql` - Database schema

### Important Commands:
```bash
# Start Expo
npx expo start --clear

# Kill Expo processes
pkill -f "expo start"

# Check environment variables
cat .env

# View Expo logs
# (Logs appear in terminal where expo start is running)
```

---

**Ready to test!** 🎉

Run through these tests and let me know the results!
