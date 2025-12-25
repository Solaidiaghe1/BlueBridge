# BlueBridge Mobile App

A marketplace connecting clients with blue-collar service workers. This is the MVP frontend-only implementation built with React Native and Expo.

## 🚀 Features

### Client Side (Implemented)
- ✅ Role selection (Client/Service Provider)
- ✅ User profile setup
- ✅ Service browsing (Plumbing, HVAC, Electrical, Carpentry)
- ✅ Location selection (Kitchen, Bathroom, Bedroom, etc.)
- ✅ Service request creation with multi-step form
- ✅ Request tracking (Current & Previous)
- ✅ Account management
- ✅ Support (Call, Email, Chat placeholders)

### Worker Side (Coming Soon)
- 🚧 Job feed
- 🚧 Accept/decline jobs
- 🚧 Active job management
- 🚧 Earnings tracking
- 🚧 Availability toggle

## 📁 Project Structure

```
BlueBridge/
├── src/
│   ├── client/              # Client-facing screens & components
│   │   ├── screens/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── LocationSelectionScreen.tsx
│   │   │   ├── CreateRequestScreen.tsx
│   │   │   ├── RequestsListScreen.tsx
│   │   │   ├── AccountScreen.tsx
│   │   │   └── SupportScreen.tsx
│   │   ├── components/
│   │   └── navigation/
│   │       ├── ClientNavigator.tsx
│   │       └── ClientTabs.tsx
│   │
│   ├── worker/              # Worker-facing screens & components
│   │   ├── screens/
│   │   ├── components/
│   │   └── navigation/
│   │
│   ├── shared/              # Shared components & utilities
│   │   ├── components/
│   │   │   ├── PrimaryButton.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Header.tsx
│   │   ├── theme/
│   │   │   ├── colors.ts
│   │   │   ├── spacing.ts
│   │   │   ├── typography.ts
│   │   │   └── index.ts
│   │   └── utils/
│   │
│   ├── services/            # Mock data services
│   │   ├── mockRequests.ts
│   │   ├── mockServices.ts
│   │   ├── mockJobs.ts
│   │   └── mockUser.ts
│   │
│   ├── types/               # TypeScript type definitions
│   │   ├── request.ts
│   │   ├── service.ts
│   │   ├── user.ts
│   │   └── job.ts
│   │
│   ├── lib/                 # API stubs
│   │   └── api.ts
│   │
│   └── navigation/          # Root navigation
│       ├── RootNavigator.tsx
│       └── RoleSelectorScreen.tsx
│
├── App.tsx                  # Main app entry point
├── app.json                 # Expo configuration
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Tech Stack

- **Framework:** React Native with Expo
- **Language:** TypeScript
- **Navigation:** Custom navigation (manual state management)
- **State Management:** Local state (useState)
- **Data:** Mock data (no backend yet)

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Studio for emulator

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd BlueBridge
npm install
```

### 2. Start the Development Server

```bash
npm start
```

This will start the Expo development server. You can then:
- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan the QR code with Expo Go app on your physical device

### 3. Running on Specific Platforms

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

**Web (experimental):**
```bash
npm run web
```

## 🎨 Design System

### Colors
- **Primary Blue:** `#2563EB` - Main brand color
- **Secondary Pink:** `#EC4899` - Kitchen/accent color
- **Accent Teal:** `#14B8A6` - Living room color
- **Status Colors:** Green (completed), Blue (ongoing), Yellow (pending), Red (cancelled)

### Typography
- **Huge:** 48px - Logo
- **XXXLarge:** 32px - Page titles
- **XXLarge:** 24px - Section titles
- **XLarge:** 20px - Headings
- **Large:** 18px - Subheadings
- **Base:** 16px - Body text
- **Small:** 14px - Secondary text
- **XSmall:** 12px - Labels

### Spacing
- **XS:** 4px
- **SM:** 8px
- **MD:** 16px
- **LG:** 24px
- **XL:** 32px
- **XXL:** 48px
- **XXXL:** 64px

## 📱 User Flows

### Client Flow
1. **Welcome** → Select "Client"
2. **Profile Info** → Enter name, age, address
3. **Home** → Browse services (Plumbing, HVAC, Electrical, Carpentry)
4. **Location** → Select room (Kitchen, Bathroom, Bedroom, etc.)
5. **Create Request** → Fill out 3-step form (Description, Address, Payment)
6. **Requests** → View current and previous requests
7. **Account** → Manage profile, toggle to Service Provider mode
8. **Support** → Contact via phone, email, or chat

### Worker Flow (Coming Soon)
1. **Welcome** → Select "Service"
2. **Profile Info** → Enter details
3. **Job Feed** → Browse available jobs
4. **Job Detail** → View job info, accept/decline
5. **Active Job** → Update status (On the way, Arrived, Completed)
6. **Earnings** → View inspection fees
7. **Account** → Manage availability

## 🧪 Mock Data

All data is mocked for this MVP. See `src/services/mock*.ts` files:
- **mockServices.ts** - Service categories and locations
- **mockRequests.ts** - Client requests
- **mockJobs.ts** - Worker jobs (for future use)
- **mockUser.ts** - User profile data

## 🚫 What's NOT Implemented (By Design)

This is a frontend-only MVP. The following are explicitly NOT included:
- ❌ Real authentication (Supabase)
- ❌ Backend API calls
- ❌ Real payments (Stripe)
- ❌ Push notifications
- ❌ Real-time chat
- ❌ GPS tracking
- ❌ Photo upload (UI only)
- ❌ Escrow logic

## 🔮 Future Enhancements

1. **Worker Side Implementation**
   - Complete worker screens
   - Job management flow
   - Earnings tracking

2. **Backend Integration**
   - Supabase for database and auth
   - Real-time updates
   - File storage for photos

3. **Payment Integration**
   - Stripe for inspection fees
   - Escrow for full job payments

4. **Advanced Features**
   - In-app chat
   - Push notifications
   - Rating/review system
   - GPS navigation for workers

## 📄 License

Proprietary - BlueBridge © 2025

## 🤝 Contributing

This is a private project. Contact the team for contribution guidelines.

## 📞 Support

For questions or issues, contact: support@bluebridge.com

---

Built with ❤️ by the BlueBridge team
