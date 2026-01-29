# BlueBridge Testing Guide
**Version:** 1.0  
**Date:** December 24, 2025

---

## 🧪 How to Test the Application

This guide walks you through testing every feature of the BlueBridge mobile app.

---

## Prerequisites

✅ **Development server is running** (see terminal for QR code)  
✅ **Expo Go app installed** on your device OR iOS Simulator/Android Emulator ready

---

## Testing Checklist

### 1️⃣ Initial Launch & Role Selection
**Screen:** Welcome/Role Selector

**Test Steps:**
1. Open the app (scan QR code or run in simulator)
2. You should see the welcome screen with BlueBridge logo
3. Verify two buttons are visible: "I'm a Client" and "I'm a Service Provider"

**Expected Results:**
- [ ] Welcome screen loads without errors
- [ ] Both buttons are visible and styled correctly
- [ ] BlueBridge branding is clear

**Actions:**
- Tap "I'm a Client" to proceed to onboarding

---

### 2️⃣ Profile Information (Onboarding)
**Screen:** ProfileInfoScreen

**Test Steps:**
1. After selecting "I'm a Client", you should see the profile form
2. Try filling in the form fields:
   - Full Name
   - Age
   - Address
3. Try submitting with empty fields (should show validation)
4. Fill all fields correctly and submit

**Expected Results:**
- [ ] Form displays with three input fields
- [ ] Validation prevents submission with empty fields
- [ ] "Continue" button is prominent
- [ ] Form submits successfully when all fields are filled
- [ ] Navigates to Home screen after submission

**Test Cases:**
- Empty name → Should show error
- Invalid age (e.g., letters) → Should handle gracefully
- Empty address → Should show error
- Valid data → Should proceed to Home

---

### 3️⃣ Home Screen - Service Selection
**Screen:** HomeScreen (Services Tab)

**Test Steps:**
1. After onboarding, you should see the home screen
2. Verify the service carousel displays 4 services:
   - 🔧 Plumbing
   - ❄️ HVAC
   - ⚡ Electrical
   - 🔨 Carpentry
3. Swipe through the carousel (left/right)
4. Check pagination dots update as you swipe
5. Read "How It Works" section below carousel

**Expected Results:**
- [ ] 4 service cards are visible
- [ ] Each card shows service icon, name, and description
- [ ] Carousel is swipeable
- [ ] Pagination dots indicate current position
- [ ] "How It Works" section is readable
- [ ] "Select" button is visible on each card

**Actions:**
- Tap "Select" on any service (e.g., Plumbing)

---

### 4️⃣ Location Selection
**Screen:** LocationSelectionScreen

**Test Steps:**
1. After selecting a service, you should see location selection
2. Verify 7 location cards in a carousel:
   - Kitchen
   - Bathroom
   - Living Room
   - Bedroom
   - Garage
   - Outdoor/Yard
   - Other
3. Swipe through locations
4. Verify "Skip this step" option is available
5. Select a location (e.g., Kitchen)

**Expected Results:**
- [ ] Location carousel displays correctly
- [ ] Each location card shows icon and name
- [ ] Swipe gestures work smoothly
- [ ] "Skip" button is visible
- [ ] Selecting a location proceeds to request form
- [ ] Skipping also proceeds to request form

**Actions:**
- Select "Kitchen" and tap "Continue"

---

### 5️⃣ Create Request - Step 1: Description
**Screen:** CreateRequestScreen (Step 1 of 3)

**Test Steps:**
1. You should see "Step 1 of 3: Describe Your Issue"
2. Verify form fields:
   - Description text area (multiline)
   - "Add Photos" button (placeholder)
3. Try submitting with empty description
4. Enter a description (e.g., "Leaking pipe under kitchen sink")
5. Try tapping "Add Photos" (shows alert for now)

**Expected Results:**
- [ ] Step indicator shows "1 of 3"
- [ ] Text area is large and multiline
- [ ] "Add Photos" button is visible
- [ ] Empty description prevents next step
- [ ] Valid description allows "Next" button to work

**Actions:**
- Enter: "Leaking pipe under kitchen sink, water pooling on floor"
- Tap "Next"

---

### 6️⃣ Create Request - Step 2: Address & Schedule
**Screen:** CreateRequestScreen (Step 2 of 3)

**Test Steps:**
1. You should see "Step 2 of 3: Address & Schedule"
2. Verify form fields:
   - Address (should be pre-filled from profile)
   - Preferred date picker
   - Preferred time picker
3. Modify address if needed
4. Select a date and time

**Expected Results:**
- [ ] Step indicator shows "2 of 3"
- [ ] Address is pre-filled from onboarding
- [ ] Date and time pickers are functional
- [ ] Can edit all fields
- [ ] "Back" button returns to step 1
- [ ] "Next" button proceeds to step 3

**Actions:**
- Keep address as is
- Select tomorrow's date
- Select time: 2:00 PM
- Tap "Next"

---

### 7️⃣ Create Request - Step 3: Payment
**Screen:** CreateRequestScreen (Step 3 of 3)

**Test Steps:**
1. You should see "Step 3 of 3: Review & Payment"
2. Verify summary displays:
   - Service type (Plumbing)
   - Location (Kitchen)
   - Description
   - Address
   - Date and time
3. Check payment method selection
4. Review $50 service fee

**Expected Results:**
- [ ] Step indicator shows "3 of 3"
- [ ] All entered information is displayed correctly
- [ ] Payment method selector is visible
- [ ] Service fee ($50) is clearly shown
- [ ] "Back" button returns to step 2
- [ ] "Submit Request" button is prominent

**Actions:**
- Review all details
- Tap "Submit Request"

---

### 8️⃣ Request Submission Success
**Screen:** Alert/Modal or Navigation

**Test Steps:**
1. After submitting, you should see a success message
2. Verify navigation to Requests screen

**Expected Results:**
- [ ] Success alert or confirmation appears
- [ ] App navigates to Requests tab
- [ ] New request appears in "Current Requests"

---

### 9️⃣ Requests List Screen
**Screen:** RequestsListScreen (Request Tab)

**Test Steps:**
1. Navigate to "Request" tab (bottom navigation)
2. Verify two sections:
   - Current Requests (expandable)
   - Previous Requests (expandable)
3. Tap to expand "Current Requests"
4. Find your newly created request
5. Verify request details:
   - Service type
   - Location
   - Status badge
   - Date created
6. Expand "Previous Requests" to see mock historical data

**Expected Results:**
- [ ] Request tab is accessible
- [ ] Sections are collapsible/expandable
- [ ] Current request displays with "Pending Approval" status
- [ ] Status badge has correct color
- [ ] Previous requests show different statuses (Completed, Cancelled)
- [ ] Empty state shows if no requests

**Test Cases:**
- No requests → Should show "No current requests"
- 1+ current requests → Shows list with status badges
- Tap request → Should show request details (if implemented)

---

### 🔟 Account Screen
**Screen:** AccountScreen (Account Tab)

**Test Steps:**
1. Tap "Account" tab in bottom navigation
2. Verify profile information displays:
   - Name (from onboarding)
   - Email placeholder
   - Phone placeholder
3. Check "Settings" section
4. Locate "Become a Service Provider" toggle
5. Try toggling between Client/Provider mode

**Expected Results:**
- [ ] Account tab is accessible
- [ ] Profile information is displayed
- [ ] Settings section is visible
- [ ] "Become a Service Provider" toggle exists
- [ ] Toggle switches between modes (shows alert)
- [ ] Edit profile button is visible

**Actions:**
- Try toggling "Become a Service Provider"
- (Should show alert: "Worker side not yet implemented")

---

### 1️⃣1️⃣ Support Screen
**Screen:** SupportScreen (Support Tab)

**Test Steps:**
1. Tap "Support" tab in bottom navigation
2. Verify contact options:
   - Call Us
   - Email Us
   - Live Chat
3. Check FAQ section below
4. Try tapping each contact button

**Expected Results:**
- [ ] Support tab is accessible
- [ ] Three contact buttons are visible
- [ ] Each button has icon and label
- [ ] FAQ section displays common questions
- [ ] Tapping buttons shows placeholder alerts
- [ ] Layout is clean and readable

**Actions:**
- Tap "Call Us" (should show alert with phone number)
- Tap "Email Us" (should show alert with email)
- Tap "Live Chat" (should show "Coming soon" message)

---

### 1️⃣2️⃣ Navigation Flow Testing
**Test:** Bottom Tab Navigation

**Test Steps:**
1. Start on any tab
2. Tap each tab in sequence:
   - Services (Home)
   - Request
   - Account
   - Support
3. Verify active tab is highlighted
4. Verify screen content changes
5. Test rapid tab switching

**Expected Results:**
- [ ] All 4 tabs are always visible
- [ ] Active tab is highlighted (different color)
- [ ] Tab icons match their function
- [ ] Switching tabs is instant
- [ ] No flickering or delays
- [ ] Back button behavior works correctly

---

### 1️⃣3️⃣ Create Multiple Requests
**Test:** Request Creation Flow

**Test Steps:**
1. Go back to Services tab
2. Select a different service (e.g., Electrical)
3. Select different location (e.g., Living Room)
4. Fill out form with different details
5. Submit second request
6. Check Requests tab for both requests

**Expected Results:**
- [ ] Can create multiple requests
- [ ] Each request maintains separate data
- [ ] Both requests appear in Current Requests
- [ ] Requests are distinguishable by service/location

---

### 1️⃣4️⃣ Visual & UI Testing

**Check Across All Screens:**

**Colors & Theme:**
- [ ] Primary blue (#2563EB) is used consistently
- [ ] Text is readable on all backgrounds
- [ ] Status badges have distinct colors
- [ ] Buttons have hover/press states

**Typography:**
- [ ] Headers are clear and prominent
- [ ] Body text is readable (not too small)
- [ ] Font weights provide hierarchy
- [ ] Line spacing is comfortable

**Spacing & Layout:**
- [ ] Consistent padding around elements
- [ ] No overlapping text or buttons
- [ ] Adequate spacing between sections
- [ ] Content fits within screen bounds

**Responsiveness:**
- [ ] Works on different screen sizes
- [ ] Scrollable content scrolls smoothly
- [ ] Keyboards don't hide input fields
- [ ] Orientation changes are handled

**Components:**
- [ ] Buttons have consistent styling
- [ ] Cards have subtle shadows
- [ ] Status badges are legible
- [ ] Inputs have clear focus states

---

### 1️⃣5️⃣ Edge Cases & Error Handling

**Test Scenarios:**

**Empty States:**
- [ ] No requests → Shows "No requests" message
- [ ] No services selected → Carousel is empty
- [ ] Form validation errors display clearly

**Data Validation:**
- [ ] Invalid age in profile → Handled gracefully
- [ ] Empty form fields → Validation messages
- [ ] Very long text → Truncated or scrollable

**Network Simulation (Future):**
- [ ] Loading states show spinners
- [ ] Error messages are user-friendly
- [ ] Retry mechanisms work

**Back Navigation:**
- [ ] Back button in request flow works
- [ ] Can go back to edit previous steps
- [ ] Data is preserved when going back

---

## 🐛 Bug Report Template

If you find any issues, document them:

```
**Bug Title:** [Brief description]

**Screen:** [Which screen/tab]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Screenshots:**
[If applicable]

**Device Info:**
- Device: [iPhone 14 Pro, Pixel 7, etc.]
- OS: [iOS 17, Android 13, etc.]
- Expo Go Version: [Version number]
```

---

## ✅ Test Completion Checklist

### Core Flows
- [ ] Role selection → Profile onboarding → Home screen
- [ ] Service selection → Location selection → Request form
- [ ] Request creation → Submission → Appears in list
- [ ] Tab navigation between all 4 tabs

### All Screens
- [ ] Welcome/Role Selector
- [ ] Profile Info (Onboarding)
- [ ] Home (Services)
- [ ] Location Selection
- [ ] Create Request (3 steps)
- [ ] Requests List
- [ ] Account
- [ ] Support

### UI Components
- [ ] Buttons (all variants)
- [ ] Status badges
- [ ] Cards
- [ ] Forms and inputs
- [ ] Carousels
- [ ] Navigation tabs

### Data & State
- [ ] Mock services load correctly
- [ ] User profile persists across screens
- [ ] Requests are stored and displayed
- [ ] Form data persists across steps

---

## 📊 Test Results Summary

After completing all tests, fill this out:

**Date Tested:** _______________  
**Tested By:** _______________  
**Device Used:** _______________

**Results:**
- Total Tests: _____ / _____
- Passed: _____
- Failed: _____
- Bugs Found: _____

**Overall Status:** 
- [ ] Ready for demo
- [ ] Needs minor fixes
- [ ] Needs major work

**Notes:**
_________________________________
_________________________________
_________________________________

---

## 🚀 Next Steps After Testing

1. **If all tests pass:**
   - Schedule stakeholder demo
   - Gather feedback from test users
   - Document feature requests

2. **If bugs found:**
   - Create bug reports
   - Prioritize by severity
   - Fix critical issues first

3. **For production readiness:**
   - Add backend integration
   - Implement real authentication
   - Set up payment processing
   - Add push notifications

---

**Happy Testing! 🎉**

For questions, check `README.md` or `QUICK_START.md`.
