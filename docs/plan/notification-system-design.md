# Notification System - Design Specification

Comprehensive design specification untuk sistem notifikasi dalam portal klien dengan real-time updates dan user preferences.

## 🔔 Notification System Overview

### Purpose & Goals
1. **Real-time Communication** - Instant updates untuk important events
2. **User Engagement** - Keep users informed tentang project progress
3. **Actionable Alerts** - Notifications yang mendorong user action
4. **Preference Management** - User control over notification types
5. **Multi-channel Delivery** - In-app, email, dan WhatsApp notifications

### Notification Types

#### System Notifications
- **Project Updates**: Status changes, milestone completions
- **Task Assignments**: New tasks assigned to user
- **Deadline Alerts**: Upcoming deadlines dan overdue items
- **Team Changes**: Team member additions/removals
- **File Updates**: New files uploaded atau modified

#### User Activity Notifications
- **Comments & Mentions**: Comments on tasks atau @mentions
- **Project Invitations**: Invitations to join projects
- **Payment Updates**: Invoice status changes
- **Support Tickets**: Ticket responses dan status updates

#### Marketing & Engagement
- **Tips & Tricks**: Platform usage tips
- **Feature Updates**: New features announcement
- **Maintenance Notices**: Scheduled maintenance alerts
- **Newsletter**: Weekly/monthly summaries

## 📱 In-App Notification Center

### Notification Center Layout
```
┌─────────────────────────────────────────────────┐
│  [Notification Center Header]                   │
│  [Title] [Filter Tabs] [Mark All Read] [Settings]│
├─────────────────────────────────────────────────┤
│  [Filter Tabs]                                   │
│  All | Unread | Mentions | Projects | System    │
├─────────────────────────────────────────────────┤
│  [Notification List]                            │
│  ┌─────────────────────────────────────────────┐ │
│  │ [Notification Item]                         │ │
│  │ [Avatar] [Content] [Time] [Actions]         │ │
│  ├─────────────────────────────────────────────┤ │
│  │ [Notification Item]                         │ │
│  │ [Avatar] [Content] [Time] [Actions]         │ │
│  ├─────────────────────────────────────────────┤ │
│  │ [Load More Button]                          │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Notification Item Design
```css
.notification-item {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-2);
  transition: all var(--transition-base);
  position: relative;
}

.notification-item.unread {
  border-color: var(--color-primary);
  background: rgba(124, 58, 237, 0.05);
}

.notification-item.unread::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--gradient-primary);
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
}

.notification-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
  line-height: var(--leading-tight);
}

.notification-message {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-2);
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.notification-time {
  color: var(--color-text-secondary);
}

.notification-project {
  padding: var(--space-1) var(--space-2);
  background: rgba(124, 58, 237, 0.1);
  color: var(--color-primary);
  border-radius: var(--radius-sm);
  font-weight: var(--font-medium);
}

.notification-actions {
  display: flex;
  gap: var(--space-1);
  flex-shrink: 0;
}

.notification-action-btn {
  padding: var(--space-2);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}

.notification-action-btn:hover {
  background: rgba(124, 58, 237, 0.1);
  color: var(--color-primary);
}
```

## ⚙️ Notification Preferences

### Settings Page Layout
```
┌─────────────────────────────────────────────────┐
│  [Settings Header]                              │
│  Notification Preferences                       │
├─────────────────────────────────────────────────┤
│  [Preference Categories]                        │
│  ┌─────────────────────────────────────────────┐ │
│  │ 📱 In-App Notifications                     │ │
│  │ ⏰ Email Notifications                      │ │
│  │ 💬 WhatsApp Notifications                   │ │
│  └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│  [In-App Settings]                              │
│  ┌─────────────────────────────────────────────┐ │
│  │ Project Updates                    [Toggle]  │ │
│  │ Task Assignments                   [Toggle]  │ │
│  │ Deadline Reminders                 [Toggle]  │ │
│  │ Team Changes                       [Toggle]  │ │
│  │ Comments & Mentions                [Toggle]  │ │
│  │ System Announcements               [Toggle]  │ │
│  └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│  [Email Settings]                               │
│  ┌─────────────────────────────────────────────┐ │
│  │ Daily Digest                       [Toggle]  │ │
│  │ Weekly Summary                     [Toggle]  │ │
│  │ Project Updates                    [Toggle]  │ │
│  │ Payment Notifications              [Toggle]  │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Preference Categories Design
```css
.preference-category {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  margin-bottom: var(--space-6);
}

.preference-category-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
}

.preference-category-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-lg);
}

.preference-category-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.preference-category-description {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.preference-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.preference-item:last-child {
  border-bottom: none;
}

.preference-item-info {
  flex: 1;
}

.preference-item-title {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.preference-item-description {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.preference-toggle {
  position: relative;
  width: 48px;
  height: 24px;
}

.preference-toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.preference-toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-border);
  border-radius: var(--radius-full);
  transition: all var(--transition-base);
}

.preference-toggle-slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: var(--radius-full);
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
}

.preference-toggle-input:checked + .preference-toggle-slider {
  background: var(--gradient-primary);
}

.preference-toggle-input:checked + .preference-toggle-slider:before {
  transform: translateX(24px);
}
```

## 🔔 Real-Time Notification System

### Live Notification Indicator
```css
.notification-bell {
  position: relative;
  padding: var(--space-2);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.notification-bell:hover {
  background: rgba(124, 58, 237, 0.1);
  color: var(--color-primary);
}

.notification-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: var(--color-error);
  color: white;
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  padding: 0 var(--space-1);
  border-radius: var(--radius-full);
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-pulse {
  animation: notification-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes notification-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

### Toast Notifications
```css
.toast-notification {
  position: fixed;
  top: var(--space-6);
  right: var(--space-6);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-xl);
  max-width: 400px;
  z-index: var(--z-toast);
  transform: translateX(400px);
  transition: transform var(--transition-base);
}

.toast-notification.show {
  transform: translateX(0);
}

.toast-notification.success {
  border-color: var(--color-success);
  background: rgba(16, 185, 129, 0.05);
}

.toast-notification.error {
  border-color: var(--color-error);
  background: rgba(239, 68, 68, 0.05);
}

.toast-notification.warning {
  border-color: var(--color-warning);
  background: rgba(245, 158, 11, 0.05);
}

.toast-content {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
}

.toast-icon {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  flex-shrink: 0;
}

.toast-text {
  flex: 1;
}

.toast-title {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.toast-message {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.toast-close {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
}

.toast-close:hover {
  background: rgba(124, 58, 237, 0.1);
  color: var(--color-primary);
}
```

## 📧 Email Notification Templates

### Email Layout Structure
```css
.email-container {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  font-family: var(--font-primary);
}

.email-header {
  background: var(--gradient-primary);
  color: white;
  padding: var(--space-6);
  text-align: center;
}

.email-logo {
  width: 120px;
  height: auto;
  margin-bottom: var(--space-4);
}

.email-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  margin: 0;
}

.email-body {
  padding: var(--space-6);
  color: #374151;
}

.email-content {
  background: #F9FAFB;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  margin: var(--space-4) 0;
}

.email-button {
  display: inline-block;
  background: var(--gradient-primary);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  text-decoration: none;
  font-weight: var(--font-medium);
  margin: var(--space-4) 0;
}

.email-footer {
  background: #F3F4F6;
  padding: var(--space-4);
  text-align: center;
  font-size: var(--text-sm);
  color: #6B7280;
}
```

### Email Notification Types

#### Project Update Email
- **Subject**: "Project '[Project Name]' has been updated"
- **Content**: Project status change, new tasks, milestone completion
- **CTA**: "View Project" button linking to portal

#### Task Assignment Email
- **Subject**: "New task assigned: [Task Title]"
- **Content**: Task details, due date, project context
- **CTA**: "View Task" button linking to task

#### Payment Reminder Email
- **Subject**: "Payment reminder: [Invoice Number]"
- **Content**: Invoice details, amount due, due date
- **CTA**: "Pay Now" button linking to payment portal

## 💬 WhatsApp Notification Templates

### WhatsApp Message Templates
```javascript
// Project Update Template
`🔔 Project Update

Project: {projectName}
Status: {newStatus}
Updated by: {userName}

{updateMessage}

View details: {projectUrl}`

// Task Assignment Template
`📋 New Task Assigned

Task: {taskTitle}
Project: {projectName}
Due: {dueDate}
Priority: {priority}

{taskDescription}

View task: {taskUrl}`

// Payment Reminder Template
`💰 Payment Reminder

Invoice: {invoiceNumber}
Amount: {amount}
Due Date: {dueDate}

Please complete your payment to continue services.

Pay now: {paymentUrl}`
```

### WhatsApp Formatting
- **Emojis**: Visual indicators untuk message types
- **Bold Text**: **Important information**
- **Links**: Direct links to relevant portal sections
- **Structured Layout**: Clear sections dengan line breaks

## 🔧 Technical Implementation

### Real-Time Updates Architecture
```css
.notification-system {
  /* WebSocket connection status */
}

.connection-status {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface-elevated);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--color-success);
}

.status-indicator.disconnected {
  background: var(--color-error);
}

.status-text {
  color: var(--color-text-secondary);
}
```

### Notification Filtering & Sorting
```css
.notification-filters {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--color-surface-light);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-4);
}

.filter-btn {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  background: var(--color-surface-elevated);
  color: var(--color-text-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.filter-btn.active {
  background: var(--gradient-primary);
  color: white;
  border-color: var(--color-primary);
}

.filter-btn:hover {
  border-color: var(--color-primary);
  background: rgba(124, 58, 237, 0.05);
}
```

### Notification Actions
- **Mark as Read/Unread**: Toggle read status
- **Archive**: Move to archive folder
- **Delete**: Remove notification permanently
- **Mark All Read**: Bulk action untuk all notifications
- **Settings**: Quick access to preferences

## 📱 Responsive Design

### Mobile Notification Center
- **Full-screen overlay** untuk notification center
- **Touch-optimized** buttons dan interactions
- **Swipe gestures** untuk mark as read/delete
- **Collapsible sections** untuk filtering options

### Tablet Notification View
- **Slide-out panel** dari right side
- **Two-column layout** pada landscape mode
- **Touch and mouse** support
- **Keyboard shortcuts** untuk power users

## 🎨 Visual Design System

### Notification Color Coding
- **Project Updates**: Purple theme (#7C3AED)
- **Task Assignments**: Blue theme (#3B82F6)
- **Deadline Alerts**: Red theme (#EF4444)
- **Team Changes**: Green theme (#10B981)
- **System Notifications**: Gray theme (#6B7280)

### Notification Icons
- **Project**: 📁 Folder icon
- **Task**: 📋 Clipboard icon
- **Payment**: 💰 Money icon
- **Team**: 👥 People icon
- **System**: ⚙️ Gear icon
- **Comment**: 💬 Chat bubble icon

## 🚀 User Experience Flow

### First-Time Setup
1. **Welcome Notification** - Explain notification features
2. **Preference Wizard** - Guide user melalui setup preferences
3. **Test Notifications** - Send test notifications untuk verification
4. **Channel Setup** - Configure email dan WhatsApp settings

### Daily Usage Flow
1. **Login Check** - See notification badge count
2. **Quick Review** - Scan recent notifications
3. **Action Taking** - Click notifications untuk take action
4. **Preference Tuning** - Adjust settings based on needs

### Advanced Features
1. **Smart Filtering** - AI-powered notification prioritization
2. **Batch Actions** - Bulk mark as read/archive operations
3. **Notification Scheduling** - Set quiet hours dan digest preferences
4. **Integration Management** - Connect external tools dan services

## 📊 Analytics & Insights

### Notification Metrics
- **Delivery Rate**: Percentage of notifications successfully delivered
- **Open Rate**: Percentage of notifications viewed by users
- **Click Rate**: Percentage of notifications that drive user action
- **Unsubscribe Rate**: Users opting out of certain notification types

### User Engagement Insights
- **Peak Activity Times**: When users are most active
- **Preferred Channels**: Email vs in-app vs WhatsApp preferences
- **Notification Fatigue**: Identify users receiving too many notifications
- **Feature Adoption**: Track usage of notification features

---

*Notification System Design Specification v1.0.0*
*Last updated: 2025-01-07*