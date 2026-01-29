# ⚡ Quick Reference - Authentication

## 🚀 Start Testing

```bash
cd /Users/solaidiaghe/Desktop/BlueBridge
npx expo start --clear
```

---

## ✅ Expected Console Logs

### Sign Up (Success):
```
🔄 Creating Clerk account...
✅ Clerk account created
🔄 Verifying email with code...
✅ Email verified, setting active session...
✅ User authenticated and verified: user_xxxxx
🔄 Syncing user to Supabase...
✅ User synced to Supabase: {user data}
```

### Sign In (Success):
```
🔄 Signing in with Clerk...
✅ Clerk sign in successful
✅ User authenticated and verified: user_xxxxx
🔄 Syncing user to Supabase...
✅ User synced to Supabase: {user data}
```

---

## 🔗 Quick Links

### Dashboards:
- [**Clerk**](https://dashboard.clerk.com) - View users, check verification status
- [**Supabase Users**](https://supabase.com/dashboard/project/cmgpkjaiilsridyrwqvd/editor) - Verify user data
- [**Supabase Logs**](https://supabase.com/dashboard/project/cmgpkjaiilsridyrwqvd/logs/query-perf) - Debug sync issues

### Docs:
- `docs/CLERK_CORRECT_FLOW_JAN_7_2026.md` - How it works
- `docs/TESTING_GUIDE_JAN_7_2026.md` - Testing steps
- `docs/AUTHENTICATION_COMPLETE_JAN_7_2026.md` - Full summary

---

## 🔧 Troubleshooting

### No email received?
→ Check spam folder or Clerk Dashboard

### User not in Supabase?
→ Check console for sync errors  
→ Verify `.env` credentials  
→ Check Supabase logs

### App not navigating?
→ Check `useEffect` is firing  
→ Verify `selectedRole` is set  
→ Check console logs

### "Failed to sync"?
→ Restart Expo: `Ctrl+C` then `npx expo start --clear`  
→ Check `.env` file  
→ Verify SQL schema was run

---

## 📋 Test Checklist

- [ ] Sign up with new email
- [ ] Verify email (check inbox)
- [ ] App navigates automatically
- [ ] User in Supabase with first_name/last_name
- [ ] Sign out
- [ ] Sign in with same email
- [ ] App navigates again
- [ ] No duplicate rows in Supabase
- [ ] Test Worker role
- [ ] Worker navigates to correct screen

---

## 🎯 Key Files

```
src/navigation/RoleSelectorScreen.tsx  ← Auth UI
src/hooks/useUserSync.ts               ← Supabase sync
src/config/supabase.ts                 ← Supabase client
supabase/schema.sql                    ← Database schema
.env                                   ← Credentials
```

---

## 💡 Remember

1. ✅ Let Clerk handle verification
2. ✅ `useEffect` monitors auth state
3. ✅ Sync happens after verification
4. ✅ Navigation is automatic
5. ✅ No manual verification needed

---

**Ready to test!** 🚀

If you encounter issues, check the detailed guides:
- Testing: `docs/TESTING_GUIDE_JAN_7_2026.md`
- How it works: `docs/CLERK_CORRECT_FLOW_JAN_7_2026.md`
