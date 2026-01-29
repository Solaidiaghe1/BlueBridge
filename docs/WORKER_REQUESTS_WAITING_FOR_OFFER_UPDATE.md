# Worker Requests Screen - "Waiting for Offer" Status Update

## ✅ COMPLETED

### Overview
Updated the worker requests screen to use "waiting_for_offer" status and added "Chat with Client" button above Submit/Cancel buttons.

## Changes Made

### 1. **New Request Status**
Added `'waiting_for_offer'` to the RequestStatus type:
```typescript
export type RequestStatus = 
  | 'waiting_assignment'
  | 'waiting_for_offer'  // ✨ NEW
  | 'pending_approval' 
  | 'job_ongoing' 
  | 'completed' 
  | 'cancelled';
```

### 2. **Updated StatusBadge Component**
Added display configuration for the new status:
- **Label:** "Waiting for Offer"
- **Background Color:** Pending status color (orange/yellow)
- **Text Color:** Pending status text color

### 3. **Updated WorkerRequestsScreen Layout**
For requests with `'waiting_for_offer'` status, the expanded card now shows:

```
📊 Pricing Details
   - Inspection Fee: $85

💬 Chat with Client (Full width button)

[Submit Offer] [Cancel]  (Two buttons side by side)
```

**Button Order:**
1. **Chat with Client** - Full width blue button with message icon
2. **Submit Offer** - Left button (blue, with send icon)
3. **Cancel** - Right button (red, with X icon)

### 4. **Mock Data Update**
Updated Request #3 to use the new status:
```typescript
{
  id: '3',
  serviceType: 'HVAC',
  status: 'waiting_for_offer',  // Changed from 'waiting_assignment'
  providerName: 'Jane Doe',
  address: '789 Pine St',
  inspectionFee: 85,
}
```

## Code Changes

### Updated Conditional Rendering:
```typescript
{request.status === 'waiting_for_offer' ? (
  <>
    {/* Chat Button - Full Width */}
    <TouchableOpacity style={styles.chatButton}>
      <Feather name="message-circle" size={18} color={colors.white} />
      <Text style={styles.chatButtonText}>Chat with Client</Text>
    </TouchableOpacity>
    
    {/* Submit and Cancel - Side by Side */}
    <View style={styles.buttonRow}>
      <TouchableOpacity 
        style={styles.submitOfferButton}
        onPress={() => handleSubmitOffer(request)}
      >
        <Feather name="send" size={18} color={colors.white} />
        <Text style={styles.submitOfferButtonText}>Submit Offer</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.cancelButton}
        onPress={() => handleCancelRequest(request)}
      >
        <Feather name="x" size={18} color={colors.white} />
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </>
) : /* other status handling */}
```

## Testing

### To Test:
1. Navigate to Worker → Requests tab
2. Find Request #3 (HVAC) with "Waiting for Offer" badge
3. Click to expand the card
4. Verify you see:
   - ✅ Pricing Details section with $85 inspection fee
   - ✅ "Chat with Client" button (full width, blue)
   - ✅ "Submit Offer" button (left, blue with send icon)
   - ✅ "Cancel" button (right, red with X icon)
5. Click "Chat with Client" → Should open chat (placeholder)
6. Click "Submit Offer" → Shows "This feature will be configured later"
7. Click "Cancel" → Opens cancel confirmation modal

## Visual Layout

```
┌─────────────────────────────────────┐
│ HVAC                        🟡 W.F.O│
│ Request #3                      ∧   │
├─────────────────────────────────────┤
│ 👤 Jane Doe                         │
│ 🕐 Jan 16, 2024, 10:00 AM          │
│ 📍 789 Pine St, Apt 2A              │
├─────────────────────────────────────┤
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                     │
│ 💰 Pricing Details                  │
│    Inspection Fee.............$85   │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ 💬 Chat with Client             ││ ← Full width
│ └─────────────────────────────────┘│
│                                     │
│ ┌─────────────┐ ┌─────────────┐   │
│ │📤 Submit    │ │❌ Cancel     │   │ ← Side by side
│ │   Offer     │ │              │   │
│ └─────────────┘ └─────────────┘   │
└─────────────────────────────────────┘
```

## Files Modified

1. `/src/types/request.ts` - Added 'waiting_for_offer' status
2. `/src/shared/components/StatusBadge.tsx` - Added display config for new status
3. `/src/worker/screens/WorkerRequestsScreen.tsx` - Updated layout and mock data

## Status Badge Colors

| Status | Label | Background | Use Case |
|--------|-------|------------|----------|
| `waiting_assignment` | Waiting for Assignment | Gray | No worker assigned yet |
| **`waiting_for_offer`** | **Waiting for Offer** | **Orange/Yellow** | **Worker needs to submit offer** |
| `pending_approval` | Pending Approval | Orange/Yellow | Client needs to approve offer |
| `job_ongoing` | Job Ongoing | Blue | Work in progress |
| `completed` | Completed | Green | Job finished |
| `cancelled` | Cancelled | Red | Job cancelled |

## Next Steps

### When Implementing Submit Offer Feature:
1. Create SubmitOfferModal component
2. Add form fields (job price, timeline, notes)
3. Update `handleSubmitOffer` function
4. Change status from `waiting_for_offer` to `pending_approval` after submission
5. Notify client of new offer

---

**Status:** ✅ Complete - Ready for testing
**Date:** January 4, 2026
