# 📅 Calendar Scheduling Feature Guide

## Quick Overview

The new calendar scheduling system replaces the old ASAP/24-48hr options with a modern, flexible date and time slot selection interface.

---

## 🎯 User Flow

### Step 4: Scheduling (NEW!)

```
┌─────────────────────────────────────────┐
│  Select your availability               │
│  Choose up to 7 days you're available   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         📅 CALENDAR VIEW                │
│                                         │
│   S  M  T  W  T  F  S                  │
│         1  2  3  4  5                  │
│   6  7  8 [9][10]11 12                │
│  13 14 15 16 17 18 19                  │
│                                         │
│  [Blue boxes] = Selected dates          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Time slots for selected days           │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Mon, Jan 9        2 slots ▼       │ │
│  ├───────────────────────────────────┤ │
│  │ ☑ Morning (8–12)                 │ │
│  │ ☑ Afternoon (12–4)               │ │
│  │ ☐ Evening (4–8)                  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Tue, Jan 10       3 slots ▶       │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 🔄 Interactions

### Selecting a Date:
1. **Tap any date** on calendar
2. Date turns **blue** (selected)
3. Day section **auto-appears** below
4. **Morning & Afternoon** pre-checked ✅
5. Section **auto-expands** to show time slots

### Managing Time Slots:
- **Tap checkbox** to select/deselect time slot
- **Selected slots** show blue background + checkmark
- Counter updates: "X slots selected"

### Collapsing Sections:
- **Tap day header** to collapse/expand
- **Collapsed**: Shows "Day, Date" + "X slots" + ▶
- **Expanded**: Shows all time slots + ▼

### Removing a Date:
- **Tap selected date** on calendar again
- Date becomes unselected
- Day section disappears
- All time slots cleared

---

## 📏 Rules & Limits

| Rule | Behavior |
|------|----------|
| **Max dates** | 7 days maximum |
| **Min requirement** | At least 1 date with 1 time slot |
| **Date range** | Today → 3 months ahead |
| **Past dates** | Disabled (grayed out) |
| **Auto-selection** | Morning + Afternoon when date added |
| **Validation** | Next button disabled until valid |

---

## 🎨 Visual States

### Calendar Date States:
```
○ = Unselected (white, touchable)
● = Selected (blue, touchable to remove)
◌ = Past/Disabled (gray, not touchable)
◉ = Today (blue outline)
```

### Time Slot States:
```
☐ Unselected  → White background, gray border
☑ Selected    → Blue background, blue border, checkmark
```

### Expansion States:
```
▶ Collapsed   → Shows date + count only
▼ Expanded    → Shows full time slot list
```

---

## 📱 Example Usage

### Scenario: "I need a plumber sometime next week"

1. **Open calendar** in Step 4
2. **Select 3 dates**: Mon, Wed, Fri
3. **Each automatically gets**: Morning ✅ Afternoon ✅
4. **Customize if needed**:
   - Monday: Keep Morning only
   - Wednesday: Keep all 3 slots
   - Friday: Keep Afternoon only
5. **Collapse Mon & Fri** to focus on Wednesday
6. **Review shows**:
   ```
   Monday, Jan 15
   • Morning (8–12)
   
   Wednesday, Jan 17
   • Morning (8–12)
   • Afternoon (12–4)
   • Evening (4–8)
   
   Friday, Jan 19
   • Afternoon (12–4)
   ```

---

## 🔧 Developer Notes

### Data Structure:
```typescript
scheduledDates: {
  "2025-01-15": ["morning"],
  "2025-01-17": ["morning", "afternoon", "evening"],
  "2025-01-19": ["afternoon"]
}
```

### Accessing in Code:
```typescript
// Get all selected dates
const dates = Object.keys(formData.scheduledDates);

// Get time slots for a specific date
const slots = formData.scheduledDates["2025-01-15"];

// Check if date is selected
const isSelected = "2025-01-15" in formData.scheduledDates;

// Count total slots
const totalSlots = dates.reduce((sum, date) => 
  sum + formData.scheduledDates[date].length, 0
);
```

---

## 🎯 Benefits

### For Users:
✅ Clear visual selection  
✅ Flexible scheduling (multiple days + times)  
✅ Quick defaults (pre-selected morning/afternoon)  
✅ Easy to modify (collapse/expand, add/remove)  
✅ Comprehensive review before submit  

### For Service Providers:
✅ Better understanding of client availability  
✅ Multiple options increase match likelihood  
✅ Specific time windows for planning  
✅ Reduces back-and-forth scheduling  

### For Platform:
✅ Structured data for matching algorithms  
✅ Easy to query and filter  
✅ Scales well for future features  
✅ Consistent UX across all services  

---

## 🚀 Pro Tips

1. **Quick Selection**: Tap multiple dates before customizing time slots
2. **Pre-selection**: Morning + Afternoon are auto-checked to save time
3. **Collapse All**: Tap each header to minimize and see overview
4. **Visual Scan**: Blue calendar dots show at-a-glance availability
5. **One-Tap Remove**: Tap selected date on calendar to remove entirely

---

## ⚠️ Common Mistakes

❌ **Don't**: Select date without any time slots  
✅ **Do**: Keep at least one slot per date  

❌ **Don't**: Try to select more than 7 days  
✅ **Do**: Choose your most available days  

❌ **Don't**: Select past dates  
✅ **Do**: Choose today or future dates only  

❌ **Don't**: Forget to expand to customize slots  
✅ **Do**: Review and adjust time slots as needed  

---

## 📊 Comparison: Old vs New

| Feature | Old System | New System |
|---------|-----------|------------|
| **Options** | ASAP, 24-48hr, Later | Calendar dates + times |
| **Flexibility** | Limited | High (7 days, 3 slots each) |
| **Specificity** | Vague | Precise date + time ranges |
| **Visual** | Text radio buttons | Interactive calendar |
| **Provider info** | Limited | Detailed availability |
| **Matching** | Broad | Targeted |

---

## 🎓 Learning Resources

### React Native Calendar:
- Library: `react-native-calendars`
- Docs: https://github.com/wix/react-native-calendars
- Version: 1.1313.0

### Key Components Used:
- `<Calendar>` - Main calendar picker
- `<TouchableOpacity>` - Collapsible headers
- `<View>` - Layout containers
- `<Text>` - Labels and dates

### State Management:
- `useState` - Selected dates and expansion state
- `Set` - Tracking expanded sections
- Object mapping - Date → time slots

---

**Last Updated**: December 26, 2025  
**Feature Status**: ✅ Live in Production
