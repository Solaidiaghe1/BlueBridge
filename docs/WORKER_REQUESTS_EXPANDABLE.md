# Worker Requests Screen - Expandable Cards Feature

## ✅ COMPLETED

### Overview
Added expandable functionality to the WorkerRequestsScreen with status-specific action buttons.

## Features Implemented

### 1. **Expandable Request Cards**
- Click anywhere on a card to expand/collapse
- Expand icon (∧/∨) in the top right of each card
- Smooth toggle animation

### 2. **Expanded Content Sections**

#### **Pricing Details**
- Inspection Fee display
- Job Price (for ongoing jobs)
- Total calculation (for ongoing jobs)
- Gray background with rounded corners

#### **Action Buttons Based on Status**

**For `waiting_assignment` Status:**
- ✅ **Submit Offer** button (blue, with send icon)
  - Currently shows placeholder alert
  - Ready to be configured later
- ✅ **Cancel** button (red, with X icon)
  - Opens cancel confirmation modal

**For `job_ongoing` Status:**
- Chat with Client button
- Edit button
- Delete button
- Estimated completion time

**For `completed` Status:**
- Review Service button

### 3. **Mock Data**
Added two sample requests:
1. **Request #1** - Job Ongoing (Plumbing)
2. **Request #3** - Waiting Assignment (HVAC) ← **Test this one!**

## Testing

### To Test the Feature:
1. Navigate to the Worker Requests tab
2. Look for Request #3 (HVAC) with "Waiting Assignment" status
3. Click on the card to expand it
4. You should see:
   - Pricing section with $85 inspection fee
   - **Submit Offer** button (blue)
   - **Cancel** button (red)
5. Click "Submit Offer" → Shows "This feature will be configured later"
6. Click "Cancel" → Opens cancel confirmation modal

### Different Status Examples:
- **Request #1** (Plumbing, Job Ongoing) → Shows Chat, Edit, Delete buttons
- **Request #2** (HVAC, Completed) → Shows Review Service button

## Code Structure

### Key Components:
```typescript
// State for expansion
const [expandedRequestId, setExpandedRequestId] = React.useState<string | null>(null);

// Toggle function
const toggleExpand = (requestId: string) => {
  setExpandedRequestId(expandedRequestId === requestId ? null : requestId);
};

// Handler for Submit Offer (placeholder)
const handleSubmitOffer = (request: Request) => {
  Alert.alert('Submit Offer', 'This feature will be configured later.');
};
```

### Conditional Rendering:
```typescript
{request.status === 'waiting_assignment' ? (
  <View style={styles.buttonRow}>
    <TouchableOpacity style={styles.submitOfferButton}>
      <Feather name="send" size={18} color={colors.white} />
      <Text>Submit Offer</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.cancelButton}>
      <Feather name="x" size={18} color={colors.white} />
      <Text>Cancel</Text>
    </TouchableOpacity>
  </View>
) : /* other status handling */}
```

## Next Steps (To Be Configured)

### Submit Offer Flow:
1. Create SubmitOfferModal component
2. Add form fields:
   - Proposed job price
   - Estimated completion time
   - Additional notes
3. Connect to backend API
4. Update request status after submission

### Enhanced Features:
- Real-time updates when offer is accepted/rejected
- Offer history tracking
- Notification system for status changes

## Files Modified
- `/src/worker/screens/WorkerRequestsScreen.tsx` - Added expandable functionality, action buttons, and mock data

## Visual Design
- Blue gradient pricing section (consistent with app theme)
- Two-button layout (Submit Offer + Cancel) for waiting_assignment status
- Full-width buttons with icons
- Clear visual hierarchy with divider lines
- Consistent spacing and padding

---

**Status:** ✅ Feature Complete - Ready for Submit Offer configuration
**Date:** January 4, 2026
