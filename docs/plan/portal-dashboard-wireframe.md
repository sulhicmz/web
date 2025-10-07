# Portal Dashboard - Wireframe & Design Specification

Comprehensive design specification untuk dashboard portal klien AstroPro Digital dengan fokus pada user experience dan productivity.

## 🎯 Dashboard Overview

### Dashboard Purpose
"Memberikan overview komprehensif tentang status proyek, metrics penting, dan akses cepat ke fitur-fitur utama portal klien."

### Key User Goals
1. **Monitor project progress** - Melihat status semua proyek aktif
2. **Access recent activities** - Tracking aktivitas terbaru
3. **Quick actions** - Akses cepat ke fungsi penting
4. **Performance insights** - Metrics dan analytics overview
5. **Communication hub** - Notifikasi dan pesan penting

## 📐 Layout Architecture

### Overall Structure
```
┌─────────────────────────────────────────────────────────────────┐
│  [Header Section - 64px height]                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ [Logo/Brand] [Breadcrumbs] [Search] [Notifications] [User]  │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  [Sidebar Navigation - 280px width]                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ [PortalNav Component]                                       │ │
│  │ • Dashboard (Active)                                        │ │
│  │ • Projects                                                  │ │
│  │ • Billing                                                   │ │
│  │ • Support                                                   │ │
│  │ • Account                                                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  [Main Content Area]                                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ [Page Header - 80px height]                                 │ │
│  │ [Title + Subtitle] [Action Buttons]                         │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │ [Metrics Overview - 200px height]                           │ │
│  │ ┌───┬───┬───┬───┐                                           │ │
│  │ │   │   │   │   │ 4 Key Metrics Cards                        │ │
│  │ │   │   │   │   │                                             │ │
│  │ └───┴───┴───┴───┘                                           │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │ [Main Dashboard Content - Flexible height]                  │ │
│  │ ┌─────────────────┬─────────────────┐                       │ │
│  │ │ Recent Projects │ Recent Activity  │                       │ │
│  │ │ (2/3 width)     │ (1/3 width)     │                       │ │
│  │ └─────────────────┴─────────────────┘                       │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🎨 Header Section Design

### Portal Header (64px height)
```css
.portal-header {
  height: 64px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  backdrop-filter: blur(20px);
}

.header-content {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: var(--space-4);
  padding: 0 var(--space-6);
}
```

### Header Elements
- **Brand/Logo** (Left) - AstroPro Digital logo dengan link ke dashboard
- **Breadcrumbs** (Center) - Current page location dengan navigation
- **User Actions** (Right) - Notifications, user menu, search

## 🧭 Sidebar Navigation Design

### Sidebar Specifications
```css
.portal-sidebar {
  width: 280px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  padding: var(--space-6) var(--space-4);
}

.nav-section {
  margin-bottom: var(--space-6);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.nav-item.active {
  background: var(--gradient-primary);
  color: white;
}

.nav-item:hover {
  background: rgba(124, 58, 237, 0.1);
  transform: translateX(4px);
}
```

### Navigation Items
1. **Dashboard** (Active state dengan indicator)
2. **Projects** (Dengan badge untuk project count)
3. **Billing** (Dengan notification dot untuk pending invoices)
4. **Support** (Dengan badge untuk open tickets)
5. **Account** (User profile dan settings)

## 📊 Metrics Overview Section

### Metrics Cards Grid
```css
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

.metric-card {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-primary);
}

.metric-value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.metric-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
}

.metric-change {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.metric-change.positive { color: var(--color-success); }
.metric-change.negative { color: var(--color-error); }
```

### Key Metrics Cards

#### 1. Active Projects Card
- **Icon**: 📁
- **Value**: Dynamic count dari database
- **Label**: "Proyek Aktif"
- **Change**: Monthly growth percentage

#### 2. Monthly Revenue Card
- **Icon**: 💰
- **Value**: Total revenue bulan ini
- **Label**: "Pendapatan Bulan Ini"
- **Change**: Comparison dengan bulan sebelumnya

#### 3. Client Satisfaction Card
- **Icon**: ⭐
- **Value**: Average rating (4.8/5.0)
- **Label**: "Kepuasan Klien"
- **Change**: Trend indicator

#### 4. System Health Card
- **Icon**: ⚡
- **Value**: 99.9%
- **Label**: "Uptime Sistem"
- **Change**: Status indicator

#### 5. Pending Tasks Card
- **Icon**: ⏳
- **Value**: Count dari pending items
- **Label**: "Tugas Menunggu"
- **Change**: Priority breakdown

#### 6. Growth Metrics Card
- **Icon**: 📈
- **Value**: MoM growth percentage
- **Label**: "Pertumbuhan"
- **Change**: Comparison metrics

## 🏠 Main Dashboard Content

### Content Grid Layout
```css
.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-8);
}

@media (max-width: 1024px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}
```

### Recent Projects Section (2/3 width)

#### Project Cards Grid
```css
.recent-projects {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-6);
}

.project-card {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  transition: all var(--transition-base);
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}
```

#### Project Card Content
- **Project Title** dengan link ke detail
- **Status Badge** (Active, Completed, On Hold)
- **Progress Bar** dengan percentage
- **Client Name** dan due date
- **Team Avatars** (max 3 visible)
- **Quick Actions** (View, Edit)

### Recent Activity Section (1/3 width)

#### Activity Feed
```css
.activity-feed {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
}

.activity-item {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.activity-time {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}
```

#### Activity Types
- **Project Created** - 📁 New project added
- **Project Updated** - ✏️ Project modified
- **Payment Received** - 💰 Payment confirmed
- **Ticket Created** - 🎫 Support ticket opened
- **Milestone Reached** - 🎯 Project milestone completed

## 📱 Responsive Design

### Mobile Layout (< 768px)
```
┌─────────────────────────────────┐
│ [Mobile Header]                 │
│ [Hamburger Menu] [Logo] [User]  │
├─────────────────────────────────┤
│ [Full Width Content]            │
│ ┌─────────────────────────────┐ │
│ │ [Metrics Cards Stack]       │ │
│ │ [4 cards vertical]          │ │
│ ├─────────────────────────────┤ │
│ │ [Recent Projects]           │ │
│ │ [Full width grid]           │ │
│ ├─────────────────────────────┤ │
│ │ [Recent Activity]           │ │
│ │ [Full width]                │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Tablet Layout (768px - 1024px)
```
┌─────────────────────────────────┐
│ [Header - Same as desktop]      │
├─────────────────────────────────┤
│ [Sidebar - Collapsible]         │
├─────────────────────────────────┤
│ [Main Content - Single column]  │
│ ┌─────────────────────────────┐ │
│ │ [Metrics - 2x2 grid]        │ │
│ ├─────────────────────────────┤ │
│ │ [Projects - 1 column]       │ │
│ │ [Activity - Sidebar]        │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## 🎨 Visual Design Elements

### Color Coding System
- **Project Status**: Color-coded badges dan progress bars
- **Priority Levels**: Different colors untuk low/medium/high/urgent
- **Activity Types**: Icons dan colors untuk different activity types
- **Alerts/Notifications**: Color-coded untuk importance levels

### Interactive Elements
- **Hover States**: Subtle animations dan color changes
- **Focus Indicators**: Clear focus rings untuk keyboard navigation
- **Loading States**: Skeleton screens dan progress indicators
- **Empty States**: Helpful illustrations dan call-to-action buttons

### Data Visualization
- **Progress Bars**: Animated progress dengan color coding
- **Status Indicators**: Dots, badges, dan icons untuk quick status
- **Trend Arrows**: Up/down indicators untuk metrics changes
- **Charts/Graphs**: Simple charts untuk key metrics (future enhancement)

## 🚀 User Experience Flow

### First Time User Experience
1. **Welcome Message** - Personalized greeting
2. **Quick Setup** - Profile completion prompts
3. **Feature Highlights** - Key features tour
4. **Sample Data** - Demo projects untuk exploration

### Regular User Flow
1. **Login** - Seamless authentication
2. **Dashboard Load** - Fast loading dengan cached data
3. **Quick Overview** - Immediate access to important information
4. **Action Taking** - Easy navigation to desired features

### Advanced User Flow
1. **Customization** - Dashboard personalization options
2. **Bulk Actions** - Multi-select dan batch operations
3. **Advanced Filtering** - Custom views dan filters
4. **Export/Reporting** - Data export capabilities

## 📋 Component Specifications

### Metrics Card Component
```typescript
interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
  href?: string;
}
```

### Project Card Component
```typescript
interface ProjectCardProps {
  project: Project;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  showProgress?: boolean;
  showTeam?: boolean;
}
```

### Activity Feed Component
```typescript
interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
  showTimeAgo?: boolean;
  filterBy?: ActivityType[];
}
```

## 🔧 Technical Implementation

### Performance Considerations
- **Lazy Loading**: Load metrics data asynchronously
- **Caching**: Cache dashboard data untuk 5 minutes
- **Skeleton Screens**: Show loading states untuk better UX
- **Pagination**: Untuk activity feed dan project lists

### Accessibility Features
- **ARIA Labels**: Comprehensive labeling untuk screen readers
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus handling untuk modals/cards
- **Color Independence**: Information tidak bergantung pada color saja

### Responsive Breakpoints
- **Mobile**: < 640px - Single column, touch-optimized
- **Tablet**: 640px - 1024px - Two column, collapsible sidebar
- **Desktop**: 1024px+ - Full layout dengan persistent sidebar

## 📈 Success Metrics

### User Engagement Metrics
- **Time to First Action**: < 30 seconds
- **Feature Adoption**: > 80% pengguna menggunakan key features
- **Task Completion**: > 95% success rate untuk common tasks
- **User Satisfaction**: > 4.5/5.0 average rating

### Performance Metrics
- **Page Load Time**: < 2 seconds
- **First Contentful Paint**: < 1.5 seconds
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

---

*Dashboard Design Specification v1.0.0*
*Last updated: 2025-01-07*