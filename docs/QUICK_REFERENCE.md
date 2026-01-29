# BlueBridge - Quick Reference Card

## 🚀 Start Development
```bash
cd /Users/solaidiaghe/Desktop/BlueBridge
npm start
```

## 📱 Open App
- **Physical Device:** Scan QR code with Expo Go app
- **iOS Simulator:** Press `i` in terminal
- **Android Emulator:** Press `a` in terminal
- **Web Browser:** Press `w` in terminal

## 🔧 Common Commands
| Command | Action |
|---------|--------|
| `r` | Reload app |
| `m` | Toggle menu |
| `j` | Open debugger |
| `Ctrl+C` | Stop server |
| `npm install` | Reinstall dependencies |

## 📂 Project Structure
```
src/
├── client/          # Client-side features
│   ├── screens/     # 7 client screens
│   └── navigation/  # Client navigation
├── worker/          # Worker-side (future)
├── shared/          # Reusable components
│   ├── components/  # UI components
│   ├── theme/       # Design system
│   └── utils/       # Helpers
├── services/        # Mock data
├── types/           # TypeScript types
└── lib/            # API layer
```

## 🎨 Design Tokens
- **Primary:** `#2563EB` (Blue)
- **Secondary:** `#EC4899` (Pink)
- **Accent:** `#14B8A6` (Teal)
- **Spacing:** 4, 8, 12, 16, 24, 32, 48, 64px
- **Fonts:** 12, 14, 16, 18, 24, 32, 48px

## 🧭 User Flows
1. **Onboarding:** Role Selection → Profile Info → Home
2. **Request:** Services → Location → 3-Step Form → Submit
3. **Navigation:** 4 tabs (Services, Request, Account, Support)

## 📱 Screens (8 Total)
1. Role Selector (Welcome)
2. Profile Info (Onboarding)
3. Home (Service Selection)
4. Location Selection
5. Create Request (Multi-step)
6. Requests List
7. Account
8. Support

## 🔍 Key Files
- `App.tsx` - Entry point
- `src/navigation/RootNavigator.tsx` - App flow
- `src/client/navigation/ClientTabs.tsx` - Bottom tabs
- `src/services/mockServices.ts` - Mock data
- `src/shared/theme/index.ts` - Design system

## 🎯 Status Badges
- 🟡 `pending_approval` (Yellow)
- 🔵 `job_ongoing` (Blue)
- 🟢 `completed` (Green)
- 🔴 `cancelled` (Red)

## 🛠️ Troubleshooting
| Issue | Solution |
|-------|----------|
| Expo not found | Run `npm install` |
| TypeScript errors | Check `tsconfig.json` |
| App won't load | Press `r` to reload |
| QR code won't scan | Ensure same WiFi network |
| Changes not showing | Clear cache: `Ctrl+C` then restart |

## 📚 Documentation Files
- `README.md` - Full documentation
- `QUICK_START.md` - Setup guide
- `TESTING_GUIDE.md` - Test all features
- `CURRENT_STATUS.md` - Project status
- `ARCHITECTURE.md` - System design
- `WORKER_SIDE_GUIDE.md` - Worker implementation

## 🔄 Development Workflow
1. Make code changes
2. Save file (auto-reload in Expo)
3. Test on device/simulator
4. Check for TypeScript errors
5. Commit changes

## 🐛 Reporting Issues
1. Note which screen
2. List steps to reproduce
3. Describe expected vs actual behavior
4. Include device/OS info

## ✅ Implemented Features
- ✅ Role selection
- ✅ Profile onboarding
- ✅ Service browsing
- ✅ Location selection
- ✅ Request creation (multi-step)
- ✅ Request tracking
- ✅ Account management
- ✅ Support/FAQ
- ✅ Bottom tab navigation
- ✅ Status badges
- ✅ Mock data services

## ❌ Not Implemented (MVP)
- ❌ Backend integration
- ❌ Real authentication
- ❌ Payment processing
- ❌ Photo uploads
- ❌ Worker-side app
- ❌ Push notifications
- ❌ Real-time updates

## 🎯 Next Steps
1. **Test:** Use `TESTING_GUIDE.md`
2. **Demo:** Show to stakeholders
3. **Feedback:** Gather user input
4. **Iterate:** Make improvements
5. **Backend:** Integrate Supabase
6. **Worker:** Implement worker-side

## 💡 Tips
- Save files to auto-reload
- Use TypeScript for type safety
- Check console for errors
- Test on real devices
- Keep mock data updated

## 📞 Need Help?
- Check `README.md` for detailed docs
- Review `ARCHITECTURE.md` for design decisions
- Use `TESTING_GUIDE.md` for feature testing
- Check terminal output for errors

---

**BlueBridge Mobile App - Client-Side MVP v1.0**  
*Last Updated: December 24, 2025*
