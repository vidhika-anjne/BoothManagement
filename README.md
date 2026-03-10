# Booth Management System - Citizen Service Portal

A comprehensive civic engagement platform for ward-level electoral services and grievance redressal in India.

## Overview

The Booth Management System is a React + Vite application that enables citizens to:
- Register as voters
- Check voter registration status
- File and track public grievances/complaints
- Access government scheme eligibility information
- Participate in citizen surveys
- Track public issue resolutions
- Receive ward alerts and notifications

## Key Features

### 1. **Voter Registration & Status Check**
- Voter registration form with Aadhaar/PAN/Voter ID validation
- Real-time status lookup using voter ID
- Electoral roll verification

### 2. **Grievance Filing System**
- Multi-category complaint submission (Water, Electricity, Roads, Healthcare, etc.)
- Photo upload for issue documentation
- AI-based automatic priority assignment
- First-stage automated verification with background processing

### 3. **Verification System**
- Automatic verification checks:
  - Photo validation
  - Location confirmation
  - Duplicate issue detection
- Non-blocking verification (5-6 hour background processing, 3 seconds in demo)
- Clear status indicators: Pending Verification → Verified → Rejected
- Detailed rejection reasons

### 4. **Complaint History & Tracking**
- View all filed complaints with status
- Timeline tracking from filing to resolution
- Expected resolution dates based on priority
- Verification status display with reasons

### 5. **Government Scheme Checker**
- Check eligibility for 10+ government schemes
- Income and category-based filtering
- Scheme details and benefits

### 6. **Citizen Survey**
- Ward-specific opinion surveys
- Anonymous participation
- Real-time response tracking

### 7. **Public Issue Tracker**
- View all community issues by status
- Filter by booth, category, reporter, status
- Track public resolutions with before/after proof

### 8. **Ward Alerts**
- Real-time notifications for resolved issues
- Before/after photo proof from departments
- Community impact metrics

## Technology Stack

- **Frontend**: React 19 with Hooks
- **Build Tool**: Vite 7.3
- **State Management**: React Context API
- **Storage**: localStorage (frontend data persistence)
- **Styling**: CSS with CSS Variables (Brutalist design)
- **Icons**: Lucide React

## Project Structure

```
src/
├── pages/
│   ├── CitizenPortal.jsx          # Main citizen portal with 8 tabs
│   ├── Dashboard.jsx
│   ├── BoothMap.jsx
│   └── ...
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   └── Topbar.jsx
│   └── shared/
│       ├── BeforeAfterVisual.jsx
│       ├── NotificationsPanel.jsx
│       └── Toast.jsx
├── context/
│   └── AppContext.jsx             # Global app state
├── data/
│   └── mockData.js                # Mock database (voters, booths, schemes, issues)
└── styles/
    └── globals.css                 # Global styles
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Server will start at `http://localhost:5179` (or next available port)

### Build

```bash
npm run build
```

## Features In Detail

### Complaint Verification Workflow

1. **Filing**: User submits complaint with photo and details
2. **Immediate Confirmation**: Success screen shown instantly
3. **Background Verification**: System verifies in background (simulated 3 sec, actual 5-6 hrs)
4. **Status Update**: Complaint updated to Verified/Rejected in storage
5. **User Discovery**: User sees final status in "My Complaints" tab

### Verification Checks

- ✓ Photo uploaded and valid
- ✓ Location (booth) specified
- ✓ No duplicate (max 2 similar issues allowed per location)

### Duplicate Detection

- Checks same category + same booth
- Only counts verified issues (not pending/rejected)
- Allows up to 2 similar issues before rejection
- Prevents spam without false positives

## Data Flow

### localStorage Structure

**Complaints**:
```javascript
{
  id: "ISS-1234",
  category: "Water Supply",
  booth: "Booth 142",
  title: "No water supply",
  description: "...",
  phone: "9876543210",
  photo: "base64 image",
  priority: "High",
  filed: "3/10/2026",
  status: "Pending Verification|Verified|Rejected|Filed|In Progress|Resolved",
  resolutionDate: "3/12/2026",
  verificationReason: "reason for rejection/verification",
  verificationTime: "2:05:30 PM"
}
```

## Mock Data

The application includes mock data for:
- **8 Voter Profiles**: Demo voter registration entries
- **5 Polling Booths**: Ward 8 booth locations
- **40+ Public Issues**: Sample community complaints
- **10 Government Schemes**: Eligibility checker database
- **15+ Ward Notifications**: Resolution alerts and updates

## UI/UX Features

- **Brutalist Design**: No-frills, minimal aesthetic
- **Status Indicators**: Color-coded badges (Green=Success, Red=Error, Blue=Info, Orange=Warning)
- **Responsive Layout**: Works on desktop and mobile
- **Toast Notifications**: Real-time user feedback
- **Accessibility**: Proper labeling, ARIA attributes
- **Smooth Animations**: Subtle transitions and spinners

## Future Enhancements

- [ ] Backend integration for persistent data
- [ ] Real SMS/Email notifications
- [ ] ML-based duplicate detection
- [ ] Image quality validation
- [ ] Complaint appeal mechanism
- [ ] Officer dashboard for complaint management
- [ ] Real-time GPS location tracking
- [ ] Mobile app version
- [ ] Multi-language support
- [ ] Accessibility compliance (WCAG)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Dev Server: Hot Module Replacement (HMR) enabled
- Bundle: Tree-shaking enabled
- CSS: CSS Variables for theming
- Images: Base64 encoding for photo storage

## Contributing

This is a prototype/demo application. For production use, implement proper backend services and security measures.

## License

MIT
