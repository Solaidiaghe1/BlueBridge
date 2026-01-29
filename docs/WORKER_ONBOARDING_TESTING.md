# 🧪 Worker Onboarding Testing Guide

## Quick Start

The worker onboarding flow is now fully integrated into the app. Follow these steps to test it:

### 1. Start the App
```bash
cd /Users/solaidiaghe/Desktop/BlueBridge
npm start
```

### 2. Select "Service Provider" Role
- On the welcome screen, tap "I'm a Service Provider" or "Worker" button
- This will launch the worker onboarding flow

### 3. Complete the Three Screens

---

## Screen 1: Profile Information

### Test Cases

#### ✅ Valid Data Test
1. Enter **First Name**: `John`
2. Enter **Last Name**: `Smith`
3. Enter **DOB**: `01/15/1990`
4. Enter **Street Address**: `123 Main Street`
5. Enter **Apt**: `4B` (optional)
6. Enter **City**: `Boston`
7. Select **State**: `Massachusetts`
8. Enter **ZIP**: `02101`
9. Select **Years of Experience**: `6-10 years`
10. Press **Next** → Should proceed to Screen 2

#### ❌ Invalid Data Tests
Try these to verify validation:

**Invalid Name:**
- Enter `J0hn` → Should show "First name can only contain letters..."
- Enter `J` → Should show "First name must be at least 2 characters"

**Invalid Age:**
- Enter `01/01/2010` → Should show "You must be at least 18 years old"
- Enter `02/30/1990` → Should show "Please enter a valid date of birth"

**Invalid Address:**
- Enter street as `123` → Should show "Street address must be at least 5 characters"
- Leave city empty → Button stays disabled
- Enter ZIP as `123` → Should show "ZIP code must be exactly 5 digits"

**Missing Selections:**
- Don't select State → Button stays disabled
- Don't select Experience → Button stays disabled

---

## Screen 2: Service Selection

### Test Cases

#### ✅ Valid Selection Test
1. Select **Plumbing** → Should highlight with blue border
2. Select **HVAC** → Should also highlight
3. Select **Electric** → All three should be highlighted
4. Press **Next** → Should proceed to Screen 3

#### ❌ Invalid Selection Test
1. Don't select any services
2. Press **Next** → Should show alert "Please select at least one service"

#### 🔄 Interaction Tests
1. Select a service → Should show checkmark
2. Tap it again → Should deselect
3. Press **Back** → Should return to Screen 1
4. Press **Next** again → Data should be preserved

---

## Screen 3: Location Selection

### Test Cases

#### ✅ Valid Selection Test
1. Select **Kitchen** → Should highlight with blue border
2. Select **Bathroom** → Should also highlight
3. Select **Bedroom** → All three should be highlighted
4. Press **Complete** → Should finish onboarding

#### ❌ Invalid Selection Test
1. Don't select any locations
2. Press **Complete** → Should show alert "Please select at least one location"

#### 🔄 Interaction Tests
1. Select a location → Should show checkmark
2. Tap it again → Should deselect
3. Press **Back** → Should return to Screen 2
4. Press **Complete** again → Data should be preserved

---

## Expected Console Output

When you press **Complete**, check the console. You should see:
```javascript
Worker onboarding complete: {
  profile: {
    firstName: 'John',
    lastName: 'Smith',
    month: '01',
    day: '15',
    year: '1990',
    streetAddress: '123 Main Street',
    apt: '4B',
    city: 'Boston',
    state: 'MA',
    zipCode: '02101',
    yearsOfExperience: '6-10'
  },
  services: ['plumbing', 'hvac', 'electric'],
  locations: ['kitchen', 'bathroom', 'bedroom']
}
```

---

## Visual Verification Checklist

### Screen 1
- [ ] Title: "Tell Us About Yourself"
- [ ] Name fields side by side
- [ ] DOB fields in MM/DD/YYYY format
- [ ] State dropdown opens modal from bottom
- [ ] Experience dropdown opens modal from bottom
- [ ] Selected state/experience shows label (not code)
- [ ] Red borders on invalid fields
- [ ] Error text appears below invalid fields
- [ ] Back button (white with blue border)
- [ ] Next button (blue, or gray when disabled)

### Screen 2
- [ ] Title: "What Service(s) Do You Provide?"
- [ ] Subtitle: "Select all that apply"
- [ ] 7 service cards displayed
- [ ] Unselected: white background, gray border
- [ ] Selected: light blue background, blue border, checkmark icon
- [ ] Back button (white with blue border)
- [ ] Next button (blue, or gray when disabled)

### Screen 3
- [ ] Title: "What Locations Do You Focus On?"
- [ ] Subtitle: "Select all that apply"
- [ ] 9 location cards displayed
- [ ] Unselected: white background, gray border
- [ ] Selected: light blue background, blue border, checkmark icon
- [ ] Back button (white with blue border)
- [ ] **Complete** button (blue, or gray when disabled)

---

## Navigation Flow Test

Test the complete flow:
1. Start app → Role selection screen
2. Select "Service Provider" → Screen 1 (Profile)
3. Fill all fields → Press Next → Screen 2 (Services)
4. Select services → Press Next → Screen 3 (Locations)
5. Select locations → Press Complete → Worker app

Test back navigation:
1. Complete Screen 1 → Go to Screen 2
2. Press Back → Should return to Screen 1 with data preserved
3. Press Next → Should go to Screen 2 (data preserved)
4. Press Next → Should go to Screen 3
5. Press Back → Should return to Screen 2 (data preserved)
6. Press Back → Should return to Screen 1 (data preserved)

---

## Known Issues / Notes

- ✅ No known issues at this time
- ✅ All validation working correctly
- ✅ All navigation working correctly
- ✅ All data persistence working correctly

---

## What Happens After Completion?

Currently, after completing onboarding:
1. User data is stored in mock user service
2. Console logs the complete data
3. App navigates to worker-app state
4. Shows placeholder (currently displays client navigator)

**Next Steps:**
- Implement WorkerNavigator (dashboard for workers)
- Create backend API endpoint for worker registration
- Store worker-specific data (services, locations, experience)

---

## Troubleshooting

### Modal Not Opening
If State or Experience modal doesn't open:
- Check that you're clicking the dropdown button
- Modal should slide up from bottom
- Try clicking on the button text area

### Validation Errors Not Showing
If error messages don't appear:
- Make sure you're clicking outside the field (onBlur)
- Red border should appear
- Error text should appear below field

### Next/Complete Button Always Disabled
- Check that ALL required fields are filled
- Check console for any validation errors
- Make sure you've selected from dropdowns

### Data Not Persisting on Back Navigation
- This should work automatically
- If not, check console for errors
- Report any issues found

---

## Success Criteria

The worker onboarding is successful if:
- ✅ All three screens render correctly
- ✅ All validation works as expected
- ✅ All modals open and close properly
- ✅ All selections are captured
- ✅ Back navigation preserves data
- ✅ Complete button triggers onComplete callback
- ✅ Console logs show correct data structure
- ✅ UI matches client-side design patterns

---

## Report Issues

If you encounter any issues:
1. Note which screen (1, 2, or 3)
2. Note what you were trying to do
3. Check console for errors
4. Take screenshot if possible
5. Document steps to reproduce

---

## 🎉 Ready to Test!

The worker onboarding flow is complete and ready for testing. Start the app and select "Service Provider" to begin!
