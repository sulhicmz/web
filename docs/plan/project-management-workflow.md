# Project Management Workflow - Design Specification

Comprehensive design specification untuk sistem manajemen proyek dalam portal klien dengan fokus pada collaboration dan productivity.

## 🎯 Project Management Overview

### Core Features
1. **Project Creation** - Easy project setup dengan templates
2. **Task Management** - Kanban-style task tracking
3. **Team Collaboration** - Real-time updates dan communication
4. **Progress Tracking** - Visual progress indicators
5. **File Management** - Document sharing dan version control
6. **Time Tracking** - Effort estimation dan time logging

## 📋 Project Creation Flow

### Project Setup Wizard
```
┌─────────────────────────────────────────────────┐
│              Create New Project                 │
├─────────────────────────────────────────────────┤
│ [Step 1: Basic Information]                     │
│ • Project Name *                                │
│ • Description                                   │
│ • Client Selection                              │
│ • Project Type (Web, Mobile, Consulting)        │
│                                                 │
│ [Step 2: Team & Timeline]                       │
│ • Team Members                                  │
│ • Start Date                                   │
│ • Due Date                                     │
│ • Priority Level                               │
│                                                 │
│ [Step 3: Budget & Scope]                        │
│ • Budget Amount                                 │
│ • Payment Terms                                │
│ • Deliverables Checklist                       │
│                                                 │
│ [Step 4: Review & Launch]                       │
│ • Summary Review                               │
│ • Template Selection                           │
│ • Launch Project                               │
└─────────────────────────────────────────────────┘
```

### Project Types & Templates

#### Web Development Project
- **Phases**: Planning → Design → Development → Testing → Launch
- **Default Tasks**: Setup repository, design mockups, frontend development, backend API, testing, deployment
- **Milestones**: Design approval, development complete, user testing, go-live

#### Mobile App Project
- **Phases**: Research → UI/UX → Development → Beta Testing → Launch
- **Default Tasks**: Market research, wireframing, iOS development, Android development, app store submission
- **Milestones**: Beta release, app store approval, marketing launch

#### Consulting Project
- **Phases**: Assessment → Strategy → Implementation → Review
- **Default Tasks**: Current state analysis, recommendation report, implementation plan, progress reviews
- **Milestones**: Assessment complete, strategy approved, implementation complete

## 📊 Project Dashboard Layout

### Main Project View
```
┌─────────────────────────────────────────────────┐
│  [Project Header]                               │
│  [Title] [Status Badge] [Progress Bar] [Menu]   │
├─────────────────────────────────────────────────┤
│  [Project Tabs]                                 │
│  Overview | Tasks | Files | Team | Timeline     │
├─────────────────────────────────────────────────┤
│  [Tab Content Area]                             │
│  ┌─────────────────────────────────────────────┐ │
│  │ [Active Tab Content]                        │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Project Header Design
```css
.project-header {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  margin-bottom: var(--space-6);
}

.project-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.project-meta {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.status-badge {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  text-transform: uppercase;
}

.progress-container {
  flex: 1;
  min-width: 200px;
}

.progress-bar {
  height: 8px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-1);
}

.progress-fill {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  transition: width var(--transition-base);
}
```

## 🎯 Task Management System

### Kanban Board Layout
```
┌─────────────────────────────────────────────────┐
│  [Kanban Controls]                              │
│  [Filter] [Group By] [View Options] [New Task]  │
├─────────────────────────────────────────────────┤
│  [Kanban Columns]                               │
│  ┌─────────────┬─────────────┬─────────────┬──────┐
│  │   To Do     │  In Progress│   Review    │ Done │
│  │  [3 tasks]  │  [2 tasks]  │  [1 task]   │ [5]  │
│  │             │             │             │      │
│  │ • Task A    │ • Task D    │ • Task G    │      │
│  │ • Task B    │ • Task E    │             │      │
│  │ • Task C    │             │             │      │
│  └─────────────┴─────────────┴─────────────┴──────┘
└─────────────────────────────────────────────────┘
```

### Task Card Design
```css
.task-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-3);
  transition: all var(--transition-base);
  cursor: grab;
}

.task-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.task-card.dragging {
  opacity: 0.5;
  transform: rotate(5deg);
  box-shadow: var(--shadow-lg);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-3);
}

.task-title {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
  margin: 0;
}

.task-priority {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.priority-high {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

.priority-medium {
  background: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
}

.task-description {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-3);
}

.task-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.task-assignee {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.assignee-avatar {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.task-due-date {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  padding: var(--space-1) var(--space-2);
  background: var(--color-surface-elevated);
  border-radius: var(--radius-sm);
}

.task-labels {
  display: flex;
  gap: var(--space-1);
  flex-wrap: wrap;
}

.task-label {
  background: rgba(124, 58, 237, 0.1);
  color: var(--color-primary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
}
```

### Task Creation Modal
```css
.task-modal {
  width: 90vw;
  max-width: 600px;
}

.task-form {
  display: grid;
  gap: var(--space-4);
}

.form-section {
  padding: var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-surface-light);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
```

## 👥 Team Collaboration Features

### Team Member Cards
```css
.team-member {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.team-member:hover {
  border-color: var(--color-primary);
  background: rgba(124, 58, 237, 0.05);
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-bold);
  font-size: var(--text-base);
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.member-role {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.member-status {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.status-online {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}

.status-offline {
  background: rgba(107, 114, 128, 0.1);
  color: var(--color-text-secondary);
}
```

### Comments & Activity Section
```css
.activity-section {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
}

.activity-timeline {
  position: relative;
  padding-left: var(--space-8);
}

.activity-timeline::before {
  content: '';
  position: absolute;
  left: 16px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-border);
}

.activity-item {
  position: relative;
  padding-bottom: var(--space-4);
  margin-bottom: var(--space-4);
}

.activity-item::before {
  content: '';
  position: absolute;
  left: -24px;
  top: 6px;
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  border: 2px solid var(--color-surface-elevated);
}

.activity-content {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.activity-author {
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
}

.activity-time {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.activity-text {
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}
```

## 📁 File Management Interface

### File Upload Area
```css
.file-upload-area {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  text-align: center;
  transition: all var(--transition-base);
  background: var(--color-surface-light);
}

.file-upload-area:hover,
.file-upload-area.drag-over {
  border-color: var(--color-primary);
  background: rgba(124, 58, 237, 0.05);
}

.upload-icon {
  font-size: var(--text-3xl);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
}

.upload-text {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
}

.upload-button {
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-6);
  font-weight: var(--font-medium);
  cursor: pointer;
}
```

### File List Component
```css
.file-list {
  display: grid;
  gap: var(--space-3);
}

.file-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.file-item:hover {
  border-color: var(--color-primary);
  background: rgba(124, 58, 237, 0.05);
}

.file-icon {
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

.file-info {
  flex: 1;
}

.file-name {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.file-meta {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.file-actions {
  display: flex;
  gap: var(--space-2);
}

.file-action-btn {
  padding: var(--space-2);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}

.file-action-btn:hover {
  background: rgba(124, 58, 237, 0.1);
  color: var(--color-primary);
}
```

## ⏱️ Time Tracking Interface

### Time Entry Form
```css
.time-entry-form {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  margin-bottom: var(--space-6);
}

.time-entry-grid {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: var(--space-4);
  align-items: end;
  margin-bottom: var(--space-4);
}

.time-input {
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-size: var(--text-base);
}

.time-submit-btn {
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-6);
  font-weight: var(--font-medium);
  cursor: pointer;
}
```

### Time Log Display
```css
.time-logs {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
}

.time-log-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.time-log-item:last-child {
  border-bottom: none;
}

.time-log-info {
  flex: 1;
}

.time-log-description {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.time-log-meta {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.time-log-duration {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--color-primary);
  min-width: 80px;
  text-align: right;
}
```

## 📊 Progress Tracking UI

### Project Progress Overview
```css
.progress-overview {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  margin-bottom: var(--space-6);
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-6);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-primary);
  margin-bottom: var(--space-1);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.progress-chart {
  height: 200px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  position: relative;
}
```

### Milestone Tracking
```css
.milestones {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4) 0;
  overflow-x: auto;
}

.milestone {
  flex: 0 0 auto;
  padding: var(--space-4);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  min-width: 200px;
  position: relative;
}

.milestone.completed {
  border-color: var(--color-success);
  background: rgba(16, 185, 129, 0.05);
}

.milestone.current {
  border-color: var(--color-primary);
  background: rgba(124, 58, 237, 0.05);
}

.milestone::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  background: var(--color-surface-elevated);
  border: 2px solid var(--color-border);
}

.milestone.completed::before {
  background: var(--color-success);
  border-color: var(--color-success);
}

.milestone.current::before {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.milestone-title {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.milestone-date {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
```

## 📱 Responsive Design

### Mobile Project Management
- **Single Column** layout untuk semua views
- **Touch-optimized** buttons dan interactions
- **Collapsible sections** untuk detailed information
- **Swipe gestures** untuk task movement

### Tablet Project Management
- **Two-column** layout untuk overview screens
- **Collapsible sidebar** untuk navigation
- **Modal dialogs** untuk detailed views
- **Touch and mouse** support

## 🎨 Visual Design System

### Color Coding for Project Management
- **Task Priorities**: High (red), Medium (yellow), Low (gray)
- **Project Status**: Active (green), On Hold (yellow), Completed (purple)
- **Progress States**: Behind (red), On Track (green), Ahead (blue)
- **Team Roles**: Owner (purple), Member (blue), Viewer (gray)

### Interactive States
- **Hover Effects**: Subtle background changes dan elevation
- **Drag States**: Visual feedback untuk drag and drop
- **Loading States**: Skeleton screens dan progress indicators
- **Error States**: Clear error messages dengan actionable solutions

## 🔧 Technical Implementation

### State Management
- **Real-time Updates**: WebSocket atau Server-Sent Events
- **Optimistic Updates**: Immediate UI feedback dengan rollback on error
- **Offline Support**: Queue actions untuk offline users
- **Conflict Resolution**: Handle concurrent edits gracefully

### Performance Optimization
- **Virtual Scrolling**: Untuk large lists of tasks
- **Lazy Loading**: Load project data on demand
- **Caching Strategy**: Smart caching untuk frequently accessed data
- **Bundle Optimization**: Code splitting untuk different views

---

*Project Management Workflow Design v1.0.0*
*Last updated: 2025-01-07*