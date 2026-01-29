1. Product Overview

Marketplace connecting clients with blue-collar workers

Inspection-fee + escrow trust model

Mobile-first

2. App Surfaces

Client App

Worker App

(They can share components, but behavior is different.)

3. Client App – Frontend Scope

Include:

Screen list

Flows

File structure

Components

Non-goals

You already mostly have this.

4. Worker App – Frontend Scope

Separate section. New mental mode.

Worker screens typically:

Job feed / available requests

Request detail

Accept / decline job

Schedule / arrival window

Status updates (On the way / Arrived / Completed)

Earnings (inspection fees)

Account / availability

No payments logic yet — UI only.

5. File structure (important)
Option A — Single app, role-based routing (recommended)
src/
  client/
    screens/
    components/
  worker/
    screens/
    components/
  shared/
    components/
    theme/


This keeps things clean and scalable.

6. What NOT to do

❌ Don’t mix client + worker screens in one list
❌ Don’t share navigation stacks
❌ Don’t assume same flows

Workers ≠ clients.

7. Why this is worth doing now

Your Figma is already done

AI works much better with full context

You avoid redesigning later

It clarifies marketplace logic early

8. When NOT to include worker side

Only skip worker side if:

You plan to manually operate supply for a while

Or worker UI is extremely rough

But you said it’s ready — so include it.