Frontend PRD (MVP – Client Side Only)
1. Purpose

Build a frontend-only MVP for a blue-collar service marketplace that allows clients to:

Browse services

Create service requests

View current and past requests

Access support and account settings

This PRD focuses only on frontend structure, screens, and organization.
No backend logic, payments, or auth enforcement is implemented yet.

2. Tech Assumptions

Framework: React Native (Expo)

Navigation: React Navigation

State: Local state / mock data

Backend calls: Stubbed (no real Supabase / Stripe yet)

3. Frontend Folder Structure (Required)
src/
  screens/
    from refind landing page design/src/app

  components/
    rom refind landing page design/src/components

  navigation/
    AppNavigator.tsx
    BottomTabs.tsx

  services/
    mockRequests.ts
    mockServices.ts
    mockProviders.ts

  theme/
    colors.ts
    spacing.ts
    typography.ts

  lib/
    api.ts          // placeholder for future backend calls

  types/
    request.ts
    service.ts
    user.ts

App.tsx

4. Screen Responsibilities
Home / Services

Display list of service categories (Plumbing, HVAC, Electrical)

Entry point into request flow

Select Location

Room/area selection (Kitchen, Bathroom, Bedroom)

Optional selection

Create Request

Description input

Photo upload (UI only)

Continue to submission (no payment yet)

Requests List

Show current and past requests

Status indicators (Requested, Accepted, Completed)

Request Detail

Request summary

Status timeline

Placeholder actions (Cancel, Contact Support)

How It Works

Static 4-step explanation

Emphasizes inspection fee & choice after inspection

Support

FAQ

Contact placeholder

Account

Profile info (static)

Settings placeholders

5. Component Guidelines

Components must be reusable and presentational

No direct data fetching inside components

All data comes from services/mock*.ts

Use props for all dynamic values

6. Data Strategy (Frontend Only)

Use mock data files to simulate:

Services

Requests

Providers

No API calls yet

lib/api.ts should export stub functions (e.g. createRequest())

7. Design & UX Rules

Mobile-first

Clear empty states

Subtle trust language (no heavy ratings emphasis)

Reviews/chat/notifications can exist visually but are non-functional

8. Explicit Non-Goals (for this phase)

No real authentication

No real payments

No backend enforcement

No Stripe / Supabase integration

9. Success Criteria

App compiles and runs cleanly

All screens navigable

Request flow works end-to-end with mock data

File structure is clean, readable, and scalable