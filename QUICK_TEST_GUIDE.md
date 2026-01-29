# 🚀 Quick Start - Test Email Verification

**Status:** ✅ Ready to Test  
**Date:** January 7, 2026

---

## ⚡ Quick Test (5 minutes)

### Step 1: Setup Database
```bash
# 1. Go to Supabase Dashboard
# https://supabase.com/dashboard/project/cmgpkjaiilsridyrwqvd

# 2. Click "SQL Editor" in left menu

# 3. Click "New Query"

# 4. Copy and paste contents of: supabase/schema.sql

# 5. Click "Run" button
```

### Step 2: Start App
```bash
# In BlueBridge directory
npm start

# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Or scan QR code with Expo Go app
```

### Step 3: Test Sign Up Flow
1. **Select Role**
   - Tap "I need a service" (Client)
   
2. **Create Account**
   - Email: `yourname@gmail.com`
   - Password: `Test123456!`
   - Tap "Sign Up"

3. **Verify Email**
   - Check your email inbox
   - Find email from Clerk
   - Copy 6-digit code
   - Enter in app
   - Tap "Verify Email"

4. **Success!**
   - Should navigate to Client Home
   - Check Supabase: users table should have new row

---

## 🎯 Expected Results

### ✅ What Should Happen
1. **After "Sign Up":**
   - Screen changes to verification
   - Email received within 1 minute
   - Code input field auto-focused

2. **After entering code:**
   - User authenticated
   - Synced to Supabase
   - Navigate to role screen
   - Console shows success logs

3. **In Supabase:**
   ```
   Table: users
   ├─ clerk_user_id: usr_xxx
   ├─ email: yourname@gmail.com
   ├─ role: client
   ├─ first_name: Your
   ├─ last_name: Name
   └─ created_at: timestamp
   ```

### ❌ Common Issues

**Issue:** "Invalid code"  
**Fix:** Check email again, code might have expired

**Issue:** Stuck on loading  
**Fix:** Check console for errors, restart app

**Issue:** No email received  
**Fix:** Check spam folder, try "Resend Code"

**Issue:** Supabase sync fails  
**Fix:** Verify schema.sql was executed

---

## 📱 Test Different Scenarios

### Test 1: Resend Code
1. During verification, wait 30 seconds
2. Tap "Resend Code"
3. Should receive new email
4. Enter new code → Success

### Test 2: Invalid Code
1. Enter wrong code: `000000`
2. Should show error alert
3. Enter correct code → Success

### Test 3: Worker Role
1. Select "I provide services"
2. Complete sign up
3. Check Supabase: role = 'worker'

### Test 4: Sign In
1. Create account first
2. Close app
3. Open again
4. Tap "Sign In"
5. Enter same credentials
6. Should navigate without verification

---

## 🔍 Debug Console Output

### Successful Flow:
```
✅ Role selected: client
🔄 Creating Clerk account...
✅ Clerk account created
📧 Verification email sent
🔄 Verifying email with code...
✅ Email verified, setting active session...
✅ User authenticated and verified: usr_xxx
🔄 Syncing user to Supabase...
📝 Creating new user in Supabase...
✅ User created in Supabase: uuid-xxx
✅ User synced to Supabase: { id: "...", email: "..." }
🎉 Navigating to Client Home
```

---

## 📊 Verification Checklist

- [ ] SQL schema executed in Supabase
- [ ] App starts without errors
- [ ] Can select role
- [ ] Sign up form appears
- [ ] Verification screen shows after sign up
- [ ] Email received with code
- [ ] Code input accepts 6 digits
- [ ] "Verify Email" button works
- [ ] User synced to Supabase
- [ ] Navigation works correctly
- [ ] Console logs match expected output
- [ ] Supabase user has first_name/last_name
- [ ] "Resend Code" works
- [ ] Sign In works for existing users
- [ ] Worker role works same as Client

---

## 🎉 Success Criteria

✅ **Working if:**
- User receives email with code
- Code input appears in app
- Code validates successfully
- User appears in Supabase users table
- Navigation works to role screen
- No TypeScript errors
- Console logs show success messages

---

## 📚 Full Documentation

For detailed information, see:
- `VERIFICATION_COMPLETE_STATUS.md` - Complete status
- `TESTING_GUIDE_JAN_7_2026.md` - Detailed testing
- `AUTHENTICATION_COMPLETE_JAN_7_2026.md` - Full implementation
- `CLERK_CORRECT_FLOW_JAN_7_2026.md` - Best practices

---

## 🆘 Need Help?

**Check these files:**
1. `src/navigation/RoleSelectorScreen.tsx` - Main auth logic
2. `src/hooks/useUserSync.ts` - Supabase sync
3. `.env` - Environment variables
4. `supabase/schema.sql` - Database schema

**Console logs are your friend!** 🔍  
All important steps log to console for debugging.

---

**Ready to test! 🚀**
