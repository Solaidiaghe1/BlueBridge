# 🔧 Worker Side Implementation Guide

This guide shows how to implement the worker side of BlueBridge following the same patterns as the client side.

## 📋 What You Need to Build

### 8 Worker Screens

#### 1. JobFeedScreen.tsx
**Purpose:** Browse available inspection requests

**Layout:**
- Header with "Available Jobs" title
- List/carousel of job cards
- Each card shows:
  - Service type (icon + name)
  - Location
  - Brief description
  - Inspection fee ($19)
  - Time window
  - Distance (if GPS enabled later)

**Interactions:**
- Tap card → Navigate to JobDetailScreen
- Pull to refresh (mock for now)
- Filter by service type (optional)

**Code Template:**
```typescript
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Header, Card, StatusBadge } from '../../shared/components';
import { getAvailableJobs } from '../../services/mockJobs';

interface JobFeedScreenProps {
  onJobPress: (jobId: string) => void;
}

export const JobFeedScreen: React.FC<JobFeedScreenProps> = ({ onJobPress }) => {
  const availableJobs = getAvailableJobs();
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Header 
          title="Available Jobs" 
          subtitle="Browse inspection requests in your area"
        />
        
        {availableJobs.map(job => (
          <TouchableOpacity 
            key={job.id} 
            onPress={() => onJobPress(job.id)}
          >
            <Card>
              {/* Job details */}
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};
```

#### 2. JobDetailScreen.tsx
**Purpose:** View full job details and decide to accept/decline

**Layout:**
- Job title and service type
- Client name (first name only)
- Full description
- Photos (if provided)
- Location (room/area)
- Address (approximate until accepted)
- Time window
- Inspection fee ($19)
- "Rules Reminder" section
- Two action buttons: Accept / Decline

**Interactions:**
- Accept → Update job status, navigate to ActiveJobScreen
- Decline → Remove from feed, show confirmation

#### 3. ActiveJobScreen.tsx
**Purpose:** Manage an accepted job

**Layout:**
- Status timeline:
  - ✅ Job Accepted
  - ⏳ On the way
  - ⏳ Arrived
  - ⏳ Inspection complete
- Client contact info (name, phone - revealed after accept)
- Job details
- Action buttons based on current status:
  - "Mark as On the Way"
  - "Mark as Arrived"
  - "Complete Inspection"

**Status Flow:**
```
accepted → on_the_way → arrived → completed
```

#### 4. JobHistoryScreen.tsx
**Purpose:** View past completed jobs

**Layout:**
- Header with "Job History"
- List of completed jobs
- Each shows:
  - Service type
  - Date completed
  - Fee earned ($19)
  - Client name
  - Status badge (Completed)

#### 5. EarningsScreen.tsx
**Purpose:** Track inspection fee earnings

**Layout:**
- Total earnings card (big number)
- Breakdown:
  - Completed: $XXX
  - Pending: $XXX
- Period selector: Week / Month
- List of earnings by job:
  - Date
  - Service name
  - Amount
  - Status

**Code Template:**
```typescript
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { getTotalEarnings, getEarningsByPeriod } from '../../services/mockJobs';

export const EarningsScreen: React.FC = () => {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const totals = getTotalEarnings();
  const earnings = getEarningsByPeriod(period);
  
  return (
    // Render earnings UI
  );
};
```

#### 6. AvailabilityScreen.tsx
**Purpose:** Control when worker receives job notifications

**Layout:**
- Big toggle: "Online" / "Offline"
- When online:
  - Green indicator
  - "You'll receive job notifications"
- When offline:
  - Gray indicator
  - "You won't receive notifications"
- Optional: Set availability hours

#### 7. WorkerAccountScreen.tsx
**Purpose:** Worker profile and settings

**Layout:**
- Similar to client AccountScreen
- Profile section:
  - Name
  - Trade (Plumber, Electrician, etc.)
  - Service areas (static for MVP)
  - Member since
- Contact info
- Settings:
  - Notifications
  - Privacy
  - Payment info
- Toggle back to Client mode

#### 8. WorkerSupportScreen.tsx
**Purpose:** Worker-specific support

**Layout:**
- Same structure as client SupportScreen
- FAQ items specific to workers:
  - "How do I get paid?"
  - "What if I need to cancel?"
  - "How does the inspection fee work?"
  - "What tools do I need?"

## 🧩 Worker Components to Create

### 1. JobCard.tsx
```typescript
interface JobCardProps {
  job: Job;
  onPress: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card>
        <View style={styles.header}>
          <Text style={styles.serviceType}>{job.serviceType}</Text>
          <Text style={styles.fee}>${job.inspectionFee}</Text>
        </View>
        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.location}>{job.location}</Text>
        <Text style={styles.timeWindow}>{job.timeWindow}</Text>
        <StatusBadge status={job.status} />
      </Card>
    </TouchableOpacity>
  );
};
```

### 2. EarningsCard.tsx
```typescript
interface EarningsCardProps {
  amount: number;
  label: string;
  color: string;
}

export const EarningsCard: React.FC<EarningsCardProps> = ({ 
  amount, 
  label, 
  color 
}) => {
  return (
    <Card style={{ backgroundColor: color }}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.amount}>${amount}</Text>
    </Card>
  );
};
```

### 3. JobStatusTimeline.tsx
```typescript
interface JobStatusTimelineProps {
  currentStatus: JobStatus;
}

export const JobStatusTimeline: React.FC<JobStatusTimelineProps> = ({ 
  currentStatus 
}) => {
  const statuses = ['accepted', 'on_the_way', 'arrived', 'completed'];
  
  return (
    <View style={styles.timeline}>
      {statuses.map((status, index) => (
        <View key={status} style={styles.timelineItem}>
          <View style={[
            styles.dot,
            status === currentStatus && styles.dotActive
          ]} />
          <Text style={styles.statusText}>{status}</Text>
        </View>
      ))}
    </View>
  );
};
```

### 4. AvailabilityToggle.tsx
```typescript
interface AvailabilityToggleProps {
  isOnline: boolean;
  onToggle: () => void;
}

export const AvailabilityToggle: React.FC<AvailabilityToggleProps> = ({ 
  isOnline, 
  onToggle 
}) => {
  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <View style={[
          styles.indicator,
          isOnline ? styles.indicatorOnline : styles.indicatorOffline
        ]} />
        <Text style={styles.label}>
          {isOnline ? 'Online' : 'Offline'}
        </Text>
      </View>
      <Switch value={isOnline} onValueChange={onToggle} />
    </Card>
  );
};
```

## 🗺️ Worker Navigation

### WorkerNavigator.tsx
```typescript
import React, { useState } from 'react';
import { View } from 'react-native';
import { JobFeedScreen } from '../screens/JobFeedScreen';
import { JobDetailScreen } from '../screens/JobDetailScreen';
import { ActiveJobScreen } from '../screens/ActiveJobScreen';
import { JobHistoryScreen } from '../screens/JobHistoryScreen';
import { EarningsScreen } from '../screens/EarningsScreen';
import { AvailabilityScreen } from '../screens/AvailabilityScreen';
import { WorkerAccountScreen } from '../screens/WorkerAccountScreen';
import { WorkerSupportScreen } from '../screens/WorkerSupportScreen';
import { WorkerTabs } from './WorkerTabs';

type Screen = 
  | 'job-feed' 
  | 'job-detail' 
  | 'active-job' 
  | 'job-history' 
  | 'earnings' 
  | 'availability'
  | 'account' 
  | 'support';

type TabName = 'Jobs' | 'Active' | 'Earnings' | 'Account';

export const WorkerNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('job-feed');
  const [currentTab, setCurrentTab] = useState<TabName>('Jobs');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  
  const renderScreen = () => {
    switch (currentScreen) {
      case 'job-feed':
        return <JobFeedScreen onJobPress={handleJobPress} />;
      case 'job-detail':
        return <JobDetailScreen jobId={selectedJobId} />;
      case 'active-job':
        return <ActiveJobScreen jobId={selectedJobId} />;
      case 'job-history':
        return <JobHistoryScreen />;
      case 'earnings':
        return <EarningsScreen />;
      case 'account':
        return <WorkerAccountScreen />;
      case 'support':
        return <WorkerSupportScreen />;
      default:
        return <JobFeedScreen onJobPress={handleJobPress} />;
    }
  };
  
  const handleJobPress = (jobId: string) => {
    setSelectedJobId(jobId);
    setCurrentScreen('job-detail');
  };
  
  return (
    <View style={{ flex: 1 }}>
      {renderScreen()}
      <WorkerTabs currentTab={currentTab} onTabChange={handleTabChange} />
    </View>
  );
};
```

### WorkerTabs.tsx
```typescript
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

type TabName = 'Jobs' | 'Active' | 'Earnings' | 'Account';

interface WorkerTabsProps {
  currentTab: TabName;
  onTabChange: (tab: TabName) => void;
}

export const WorkerTabs: React.FC<WorkerTabsProps> = ({ 
  currentTab, 
  onTabChange 
}) => {
  const tabs: TabName[] = ['Jobs', 'Active', 'Earnings', 'Account'];
  
  return (
    <View style={styles.container}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab}
          style={styles.tab}
          onPress={() => onTabChange(tab)}
        >
          <Text style={[
            styles.tabText,
            currentTab === tab && styles.tabTextActive
          ]}>
            {tab}
          </Text>
          {currentTab === tab && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
};
```

## 🔄 Integration with RootNavigator

Update `src/navigation/RootNavigator.tsx`:

```typescript
import { WorkerNavigator } from '../worker/navigation/WorkerNavigator';

// In renderContent():
case 'worker-app':
  return <WorkerNavigator onSwitchToClient={handleSwitchToClient} />;
```

## 📝 Step-by-Step Implementation Plan

### Phase 1: Setup (30 min)
1. Create worker screen files (empty shells)
2. Create worker component files (empty shells)
3. Create WorkerNavigator and WorkerTabs
4. Wire up to RootNavigator

### Phase 2: Job Feed & Detail (2 hours)
1. Implement JobFeedScreen
2. Implement JobDetailScreen
3. Create JobCard component
4. Test navigation between them

### Phase 3: Active Job Management (1.5 hours)
1. Implement ActiveJobScreen
2. Create JobStatusTimeline component
3. Add status update functionality
4. Test complete flow: browse → accept → update → complete

### Phase 4: Earnings (1 hour)
1. Implement EarningsScreen
2. Create EarningsCard component
3. Connect to mockEarnings data
4. Add period filtering

### Phase 5: History & Account (1 hour)
1. Implement JobHistoryScreen
2. Implement WorkerAccountScreen
3. Reuse components from client side
4. Add availability toggle

### Phase 6: Polish (30 min)
1. Implement AvailabilityScreen
2. Implement WorkerSupportScreen
3. Test all flows
4. Fix any styling issues

**Total Estimated Time: 6-7 hours**

## 🎯 Testing Checklist

After implementation, test these flows:

- [ ] Browse available jobs
- [ ] View job detail
- [ ] Accept a job
- [ ] Update job status (on way → arrived → completed)
- [ ] View job history
- [ ] Check earnings totals
- [ ] Filter earnings by week/month
- [ ] Toggle availability on/off
- [ ] Switch back to client mode
- [ ] Navigate between all tabs

## 🚀 Quick Start Commands

When you're ready to implement:

```bash
# Create worker screen files
cd src/worker/screens
touch JobFeedScreen.tsx JobDetailScreen.tsx ActiveJobScreen.tsx \
      JobHistoryScreen.tsx EarningsScreen.tsx AvailabilityScreen.tsx \
      WorkerAccountScreen.tsx WorkerSupportScreen.tsx

# Create worker component files
cd ../components
touch JobCard.tsx EarningsCard.tsx JobStatusTimeline.tsx \
      AvailabilityToggle.tsx JobActionButtons.tsx

# Create worker navigation files
cd ../navigation
touch WorkerNavigator.tsx WorkerTabs.tsx
```

Then follow the code templates above!

## 💡 Tips

1. **Reuse Everything:** Header, Card, StatusBadge, PrimaryButton
2. **Follow Client Patterns:** Same structure as client screens
3. **Copy & Modify:** Start with similar client screen and adapt
4. **Test Incrementally:** Build one screen at a time
5. **Mock Data Ready:** All worker data already in mockJobs.ts

---

**Ready to build?** Follow this guide and you'll have the worker side done in a day! 🚀
