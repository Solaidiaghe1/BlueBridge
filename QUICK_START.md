# 🚀 Quick Start Guide - BlueBridge Mobile App

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js (v16 or higher) - Check with `node --version`
- ✅ npm or yarn - Check with `npm --version`
- ✅ Expo CLI - Install with `npm install -g expo-cli`

## Step-by-Step Setup

### 1. Navigate to Project Directory
```bash
cd /Users/solaidiaghe/Desktop/BlueBridge
```

### 2. Install Dependencies
```bash
npm install
```

This will install:
- React Native
- Expo SDK
- TypeScript
- All required dependencies

### 3. Start the Development Server
```bash
npm start
```

This opens the Expo Dev Tools in your browser.

### 4. Run on Device/Simulator

#### Option A: iOS Simulator (Mac only)
```bash
# Press 'i' in terminal or
npm run ios
```

#### Option B: Android Emulator
```bash
# Press 'a' in terminal or
npm run android
```

#### Option C: Physical Device
1. Install **Expo Go** app from App Store or Google Play
2. Scan QR code shown in terminal
3. App will load on your device

## 🎯 What You'll See

### 1. Welcome Screen
- **BlueBridge logo** at top
- **"Let's Get Started"** heading
- **Two buttons:** "Client" and "Service"

### 2. After Selecting "Client"
- **Profile Info Screen** with form fields:
  - Name (First, Last)
  - Age (MM, DD, YYYY)
  - Address (Street, Apt, City, State, Zip)

### 3. Main App (4 Tabs)
- **Services Tab:** Carousel of service categories (Plumbing, HVAC, etc.)
- **Request Tab:** Current and previous requests
- **Account Tab:** Profile with service provider toggle
- **Support Tab:** Contact options and FAQ

### 4. Create Request Flow
1. Select service (e.g., Plumbing)
2. Select location (e.g., Kitchen) - optional
3. Fill out 3-step form:
   - Description & photos
   - Address details
   - Payment info ($19 inspection fee)
4. Submit request
5. See it appear in Request tab

## 🎨 Testing Different Flows

### Test Client Onboarding
1. Select "Client"
2. Fill out profile
3. Explore services

### Test Request Creation
1. Go to Services tab
2. Select any service
3. Select location (or skip)
4. Fill out form
5. Submit

### Test Request Management
1. Go to Request tab
2. See current requests (2 items)
3. See previous requests (2 items)
4. Tap on any request (placeholder)

### Test Account Features
1. Go to Account tab
2. View profile info
3. Toggle "Service Provider Mode" (will switch to worker side when implemented)
4. View settings

### Test Support
1. Go to Support tab
2. See contact options
3. View FAQ items

## 🐛 Troubleshooting

### Error: "Module not found"
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
```

### Error: "Expo CLI not found"
```bash
npm install -g expo-cli
```

### Error: "Unable to start server"
```bash
# Kill any processes on port 19000
lsof -ti:19000 | xargs kill
npm start
```

### Simulator Not Opening
```bash
# For iOS
sudo xcode-select --switch /Applications/Xcode.app
xcrun simctl list

# For Android
# Open Android Studio → Tools → AVD Manager → Start emulator
```

## 📱 Recommended Testing

### Device Testing Matrix
- ✅ iPhone SE (small screen)
- ✅ iPhone 14 Pro (standard)
- ✅ iPhone 14 Pro Max (large)
- ✅ Android Pixel (standard)
- ✅ Android tablet (large screen)

### User Flow Testing
1. Complete onboarding as client
2. Create 2-3 requests with different services
3. Navigate between all tabs
4. Toggle to service provider mode
5. Test all interactive elements

## 🎓 Understanding the Code

### Key Files to Explore
```
App.tsx                          # Entry point
src/navigation/RootNavigator.tsx # App orchestration
src/client/navigation/ClientNavigator.tsx # Client flow
src/client/screens/              # All client screens
src/shared/components/           # Reusable components
src/services/mock*.ts            # Mock data
src/types/                       # TypeScript types
```

### Data Flow
1. User interacts with screen
2. Screen calls mock service function
3. Mock service updates/returns data
4. Screen re-renders with new data

### Adding New Features
1. Create type in `src/types/`
2. Add mock data in `src/services/`
3. Create component/screen
4. Wire up navigation

## 🚀 Next Steps After Testing

1. **Demo to stakeholders** - Show complete client flow
2. **Gather feedback** - Note UX improvements
3. **Implement worker side** - Use same patterns
4. **Backend integration** - Swap mock services with real API
5. **Add payments** - Integrate Stripe
6. **Deploy** - Build and submit to app stores

## 📞 Need Help?

- Check `README.md` for detailed documentation
- Review `IMPLEMENTATION_SUMMARY.md` for architecture
- See `CHECKLIST.md` for completion status

---

**You're all set!** 🎉  
Run `npm start` and start exploring your app!
