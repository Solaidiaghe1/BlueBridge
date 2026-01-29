# BlueBridge App - Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         📱 BLUEBRIDGE APP                             │
│                      Client-Side MVP - Complete                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         APP LAUNCH                                    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ Role Selector  │
                    │  Welcome Screen│
                    └───────┬────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
      ┌──────────────┐          ┌──────────────┐
      │ I'm a Client │          │ Service      │
      │   (Active)   │          │ Provider     │
      └──────┬───────┘          └──────┬───────┘
             │                         │
             │                         ▼
             │                  [Not Implemented]
             │                  (Future Phase)
             │
             ▼
    ┌─────────────────┐
    │ Profile Info    │
    │ (Onboarding)    │
    │                 │
    │ • Name          │
    │ • Age           │
    │ • Address       │
    └────────┬────────┘
             │
             │ [Submit Profile]
             │
             ▼
┌──────────────────────────────────────────────────────────────┐
│                     MAIN APP (4 TABS)                         │
└──────────────────────────────────────────────────────────────┘

┌────────────┬────────────┬────────────┬────────────┐
│  Services  │  Request   │  Account   │  Support   │
│    🏠      │    📋      │    👤      │    💬      │
└─────┬──────┴─────┬──────┴──────┬─────┴──────┬─────┘
      │            │             │            │
      ▼            ▼             ▼            ▼

┌─────────────────────────────────────────────────────────┐
│                  TAB 1: SERVICES (HOME)                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────┐      │
│  │      Service Selection Carousel               │      │
│  │  ◀ ⚡ HVAC  |  ⚡ Electrical  |  🔨 Carpentry ▶│      │
│  │                                               │      │
│  │  [Select Service]                            │      │
│  └──────────────────────────────────────────────┘      │
│                                                          │
│  How It Works:                                          │
│  1️⃣ Choose service                                      │
│  2️⃣ Describe issue                                      │
│  3️⃣ Get matched with pro                               │
│                                                          │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ [Select Service]
                     ▼
        ┌────────────────────────┐
        │ Location Selection     │
        │                        │
        │ 🏠 Kitchen            │
        │ 🛁 Bathroom           │
        │ 🛋️ Living Room        │
        │ 🛏️ Bedroom            │
        │ 🚗 Garage             │
        │ 🌳 Outdoor/Yard       │
        │ ❓ Other              │
        │                        │
        │ [Skip this step]       │
        └───────────┬────────────┘
                    │
                    │ [Continue]
                    ▼
        ┌─────────────────────────────┐
        │   Create Request Form        │
        │   (Multi-Step)               │
        └─────────────┬────────────────┘
                      │
        ┌─────────────┼──────────────┐
        │             │              │
        ▼             ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────────┐
│  Step 1  │  │  Step 2  │  │   Step 3     │
│          │  │          │  │              │
│ Describe │→ │ Address  │→ │ Payment      │
│ Issue    │  │ & Time   │  │ & Review     │
│          │  │          │  │              │
│ • Text   │  │ • Address│  │ • Summary    │
│ • Photos │  │ • Date   │  │ • Method     │
│          │  │ • Time   │  │ • Submit     │
└──────────┘  └──────────┘  └──────┬───────┘
                                   │
                                   │ [Submit]
                                   ▼
                            ┌──────────────┐
                            │ Success! ✅  │
                            │ Request      │
                            │ Created      │
                            └──────┬───────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────┐
│               TAB 2: REQUESTS LIST                        │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────┐            │
│  │ ▼ Current Requests (2)                  │            │
│  │                                          │            │
│  │  🔧 Plumbing - Kitchen                  │            │
│  │  🟡 Pending Approval                    │            │
│  │  Created: Dec 24, 2025                  │            │
│  │                                          │            │
│  │  ⚡ Electrical - Living Room            │            │
│  │  🔵 Job Ongoing                         │            │
│  │  Created: Dec 23, 2025                  │            │
│  └─────────────────────────────────────────┘            │
│                                                           │
│  ┌─────────────────────────────────────────┐            │
│  │ ▶ Previous Requests (3)                 │            │
│  │  (Expandable)                           │            │
│  └─────────────────────────────────────────┘            │
│                                                           │
└───────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                 TAB 3: ACCOUNT                            │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Profile Information:                                     │
│  ━━━━━━━━━━━━━━━━━━━━                                   │
│  👤 Name: John Doe                                       │
│  📧 Email: john@example.com                             │
│  📱 Phone: +1 (555) 123-4567                            │
│                                                           │
│  [Edit Profile]                                          │
│                                                           │
│  Settings:                                               │
│  ━━━━━━━━━━━━━━━━━━━━                                   │
│  • Notifications                                         │
│  • Privacy                                               │
│  • Terms of Service                                      │
│                                                           │
│  🔄 Become a Service Provider                           │
│     [Toggle] ──▶ (Worker side not implemented)          │
│                                                           │
│  [Log Out]                                               │
│                                                           │
└───────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                 TAB 4: SUPPORT                            │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Need Help?                                              │
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   📞 Call   │  │  ✉️ Email   │  │  💬 Chat    │    │
│  │     Us      │  │     Us      │  │     Us      │    │
│  │             │  │             │  │             │    │
│  │  555-0123   │  │ help@blue   │  │ [Coming     │    │
│  │             │  │ bridge.com  │  │  Soon]      │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                           │
│  Frequently Asked Questions:                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                     │
│                                                           │
│  ▶ How do I request a service?                          │
│  ▶ How long does approval take?                         │
│  ▶ What payment methods are accepted?                   │
│  ▶ Can I cancel a request?                              │
│  ▶ How do I rate a service provider?                    │
│                                                           │
└───────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────┐
│                  STATUS LEGEND                            │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  🟡 Pending Approval  - Waiting for provider             │
│  🔵 Job Ongoing       - Provider accepted & working      │
│  🟢 Completed         - Job finished successfully        │
│  🔴 Cancelled         - Request was cancelled            │
│                                                           │
└───────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│              SHARED UI COMPONENTS                         │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  • PrimaryButton (variants: primary, secondary, outline) │
│  • StatusBadge (dynamic color based on status)           │
│  • Card (container with shadow & padding)                │
│  • Header (page header with logo & title)                │
│                                                           │
└───────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                  DESIGN SYSTEM                            │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Colors:                                                  │
│  • Primary:   #2563EB (Blue)                             │
│  • Secondary: #EC4899 (Pink)                             │
│  • Accent:    #14B8A6 (Teal)                             │
│  • Success:   #10B981 (Green)                            │
│  • Warning:   #F59E0B (Orange)                           │
│  • Error:     #EF4444 (Red)                              │
│                                                           │
│  Typography:                                              │
│  • Heading:   32px, 24px, 18px                           │
│  • Body:      16px, 14px                                 │
│  • Caption:   12px                                       │
│                                                           │
│  Spacing:                                                 │
│  • xs: 4px   • sm: 8px   • md: 12px  • lg: 16px         │
│  • xl: 24px  • 2xl: 32px • 3xl: 48px • 4xl: 64px        │
│                                                           │
└───────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│            DATA FLOW (Mock Services)                      │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  mockServices.ts  → Services & Locations                 │
│  mockRequests.ts  → Client Requests (CRUD)               │
│  mockJobs.ts      → Worker Jobs (Future)                 │
│  mockUser.ts      → User Profile                         │
│                                                           │
│  lib/api.ts       → Stub layer for backend               │
│                                                           │
└───────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                IMPLEMENTATION STATUS                      │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ✅ Client-Side Application (100%)                       │
│     • All 7 client screens                               │
│     • Bottom tab navigation                              │
│     • Multi-step forms                                   │
│     • Mock data services                                 │
│     • Reusable components                                │
│     • Type definitions                                   │
│                                                           │
│  ❌ Worker-Side Application (0%)                         │
│     • Ready for implementation                           │
│     • See WORKER_SIDE_GUIDE.md                          │
│                                                           │
│  ❌ Backend Integration (0%)                             │
│     • Supabase setup pending                             │
│     • Stripe integration pending                         │
│     • Push notifications pending                         │
│                                                           │
└───────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                   TECHNOLOGIES                            │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  • React Native 0.73.0                                   │
│  • Expo 50.0.0                                           │
│  • TypeScript 5.1.3                                      │
│  • Custom Navigation (Manual)                            │
│  • Local State Management (useState)                     │
│                                                           │
└───────────────────────────────────────────────────────────┘

                          ✅ READY TO TEST!

            Scan QR code or press 'i' for iOS simulator
```
