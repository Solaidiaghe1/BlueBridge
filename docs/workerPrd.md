1. Purpose

Build a worker-facing mobile app for blue-collar service providers to:

View available job requests

Accept or decline jobs

Manage active inspections

Update job status

View past jobs and earnings (inspection fees)

Manage account and availability

This PRD defines frontend structure, screens, and behavior only.
All data is mocked.

2. Target User

Independent tradespeople (plumbers, HVAC techs, electricians)

Mobile-first

Time-constrained

Distrustful of platforms → UI must feel respectful, not controlling

3. Non-Goals (Important)

No GPS tracking

No real payments

No escrow logic

No chat enforcement

No backend role enforcement

This is UI and flow only.

4. Folder Structure (Worker Side)
src/
  worker/
    screens/


    components/


    navigation/
      WorkerNavigator.tsx
      WorkerTabs.tsx

  shared/
    components/
      PrimaryButton.tsx
      StatusBadge.tsx
    theme/
      colors.ts
      spacing.ts
      typography.ts

  services/
    mockJobs.ts
    mockEarnings.ts

5. Screen Specifications
5.1 Job Feed

Purpose: Show available inspection requests

Displays:

Service type

Location (room)

Short description

Inspection fee

Time window

Actions:

Tap → Job Detail

5.2 Job Detail

Purpose: Decide whether to accept

Displays:

Full request details

Photos (if provided)

Address (approximate)

Inspection fee

Rules reminder

Actions:

Accept job

Decline job

5.3 Active Job

Purpose: Manage an accepted inspection

Displays:

Client info

Scheduled window

Status timeline

Actions:

Mark “On the way”

Mark “Arrived”

Mark “Inspection complete”

No GPS, no chat required.

5.4 Job History

Purpose: Review past work

Displays:

Completed inspections

Date

Fee earned

Status

Read-only.

5.5 Earnings

Purpose: Build trust and retention

Displays:

Total inspection earnings (mock)

Weekly / monthly breakdown

Pending vs completed

5.6 Availability

Purpose: Control supply participation

Displays:

Online / Offline toggle

Optional availability windows

Simple toggle only.

5.7 Account

Purpose: Profile & settings

Displays:

Name

Trade

Service areas (static)

App info

5.8 Support

Purpose: Reduce friction

Displays:

FAQs

Contact placeholder

6. Worker App Navigation

Bottom Tabs:

Jobs

Active

Earnings

Account

Support is secondary (inside Account).

7. Components Guidelines

Components are presentational

No direct data mutation

Receive all data via props

Status buttons are controlled by screen state

8. UX Rules (Very Important)

Respect autonomy (no micromanagement)

Clear payout language

No surveillance visuals

Emphasize guaranteed inspection pay

Minimal cognitive load

9. Data Strategy (Frontend Only)

All job data from mockJobs.ts

Earnings from mockEarnings.ts

Status changes update local state only

10. Success Criteria

Worker can:

Browse jobs

Accept a job

Complete a job

See earnings

App feels simple, fair, and non-invasive

File structure clean and scalable

One-line AI instruction

“Build a production-ready React Native frontend for the worker app using this PRD, mock data only, and the specified file structure. No backend logic.”