# 📐 BlueBridge App Architecture

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│                    (Entry Point)                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    RootNavigator                             │
│               (App Orchestration)                            │
└──────┬──────────────────────────────────────────────────┬───┘
       │                                                   │
       ▼                                                   ▼
┌──────────────┐                                  ┌───────────────┐
│ RoleSelector │                                  │ProfileInfoScreen│
│   Screen     │──────────────────────────────────▶   (Onboarding) │
└──────────────┘                                  └────────┬───────┘
       │                                                   │
       │                                                   │
       ▼                                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    ClientNavigator                           │
│                 (Client Flow Manager)                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
         ┌────────────┼────────────┬──────────────┐
         │            │            │              │
         ▼            ▼            ▼              ▼
    ┌────────┐  ┌─────────┐  ┌─────────┐  ┌──────────┐
    │Services│  │ Request │  │ Account │  │ Support  │
    │  Tab   │  │   Tab   │  │   Tab   │  │   Tab    │
    └───┬────┘  └────┬────┘  └────┬────┘  └─────┬────┘
        │            │            │             │
        ▼            ▼            ▼             ▼
    ┌────────┐  ┌─────────┐  ┌─────────┐  ┌──────────┐
    │ Home   │  │Requests │  │ Account │  │ Support  │
    │ Screen │  │  List   │  │ Screen  │  │  Screen  │
    └───┬────┘  └─────────┘  └─────────┘  └──────────┘
        │
        ▼
    ┌────────────┐
    │  Location  │
    │ Selection  │
    └─────┬──────┘
          │
          ▼
    ┌────────────┐
    │   Create   │
    │  Request   │
    │   Form     │
    └────────────┘
```

## Screen Hierarchy

```
App
└── RootNavigator
    ├── RoleSelectorScreen          (Welcome)
    ├── ProfileInfoScreen           (Onboarding)
    ├── ClientNavigator             (Main Client App)
    │   ├── HomeScreen              (Services Tab)
    │   │   └── Request Flow
    │   │       ├── LocationSelectionScreen
    │   │       └── CreateRequestScreen
    │   ├── RequestsListScreen      (Request Tab)
    │   ├── AccountScreen           (Account Tab)
    │   └── SupportScreen           (Support Tab)
    └── WorkerNavigator             (Main Worker App - TODO)
        ├── JobFeedScreen
        ├── ActiveJobScreen
        ├── EarningsScreen
        └── WorkerAccountScreen
```

## Component Architecture

```
Screens (8)
├── RoleSelectorScreen
├── ProfileInfoScreen
├── HomeScreen
├── LocationSelectionScreen
├── CreateRequestScreen
├── RequestsListScreen
├── AccountScreen
└── SupportScreen

Shared Components (4)
├── PrimaryButton
├── StatusBadge
├── Card
└── Header

Navigation (4)
├── RootNavigator
├── RoleSelectorScreen
├── ClientNavigator
└── ClientTabs
```

## Data Flow Architecture

```
┌─────────────┐
│   Screen    │ ◀──── User Interaction
└──────┬──────┘
       │
       │ Calls Function
       ▼
┌─────────────┐
│Mock Service │ ◀──── src/services/mock*.ts
└──────┬──────┘
       │
       │ Returns Data
       ▼
┌─────────────┐
│ Type Check  │ ◀──── src/types/*.ts
└──────┬──────┘
       │
       │ Updates State
       ▼
┌─────────────┐
│   Screen    │ ◀──── Re-renders
└─────────────┘
```

## Theme System

```
src/shared/theme/
├── colors.ts       → Color palette
├── spacing.ts      → Spacing scale & shadows
├── typography.ts   → Font styles
└── index.ts        → Central export

Used by all components via:
import { colors, spacing, typography } from '../../shared/theme';
```

## Mock Data Structure

```
src/services/
├── mockServices.ts
│   ├── mockServices[]        (4 services)
│   └── mockLocations[]       (7 locations)
├── mockRequests.ts
│   ├── mockRequests[]        (4 requests)
│   ├── getCurrentRequests()
│   ├── getPreviousRequests()
│   └── createRequest()
├── mockJobs.ts
│   ├── mockJobs[]            (3 jobs)
│   └── mockEarnings[]        (4 earnings)
└── mockUser.ts
    ├── currentUser
    ├── getCurrentUser()
    └── toggleUserType()
```

## Request Creation Flow (Detailed)

```
1. HomeScreen (Services Tab)
   │
   │ User taps service card (e.g., "Plumbing")
   │
   ▼
2. LocationSelectionScreen
   │
   │ User selects location (e.g., "Kitchen")
   │ OR skips this step
   │
   ▼
3. CreateRequestScreen - Step 1
   │ - Enter title
   │ - Enter description
   │ - Upload photos (UI only)
   │
   │ User taps "Next"
   │
   ▼
4. CreateRequestScreen - Step 2
   │ - Enter address
   │ - Select availability window
   │ - Select location type
   │
   │ User taps "Next"
   │
   ▼
5. CreateRequestScreen - Step 3
   │ - Pets on site (Yes/No)
   │ - Parking notes
   │ - Payment method (Apple Pay)
   │ - Inspection fee: $19
   │
   │ User taps "Review"
   │
   ▼
6. Request Created
   │ - Calls createRequest()
   │ - Adds to mockRequests[]
   │ - Navigates to Request Tab
   │
   ▼
7. RequestsListScreen
   │ - Shows new request in "Current Requests"
   │ - Status: "Pending Approval"
```

## State Management Strategy

```
Local State (useState)
├── Screen-level state
│   └── Form data, UI state, selections
├── Navigator-level state
│   └── Current screen, selected service/location
└── Root-level state
    └── User role, onboarding status

No global state management needed for MVP
Redux/Context can be added later if needed
```

## Future Backend Integration Points

```
src/lib/api.ts (Stub Layer)
├── createRequest()      → Will call Supabase
├── updateProfile()      → Will call Supabase
├── acceptJob()          → Will call Supabase
├── login()              → Will call Supabase Auth
└── processPayment()     → Will call Stripe

Just replace mock calls with real API calls!
```

## File Organization Principle

```
Feature-Based Structure:
├── client/               (Client-specific)
│   ├── screens/          (Client screens)
│   ├── components/       (Client components)
│   └── navigation/       (Client navigation)
├── worker/               (Worker-specific)
│   ├── screens/          (Worker screens)
│   ├── components/       (Worker components)
│   └── navigation/       (Worker navigation)
└── shared/               (Shared across both)
    ├── components/       (Reusable components)
    ├── theme/            (Design system)
    └── utils/            (Helper functions)
```

## Key Design Decisions

1. **Manual Navigation** (No React Navigation)
   - Simpler for MVP
   - Full control over flow
   - Easy to debug

2. **Mock Data Services**
   - Separated from components
   - Easy to swap with real API
   - Testable independently

3. **TypeScript Throughout**
   - Type safety
   - Better IDE support
   - Catches errors early

4. **Component Composition**
   - Small, focused components
   - Props for all data
   - No internal state for data

5. **Theme System**
   - Centralized design tokens
   - Consistent styling
   - Easy to rebrand

---

This architecture supports:
- ✅ Rapid MVP development
- ✅ Easy worker-side addition
- ✅ Smooth backend integration
- ✅ Scalable to production
