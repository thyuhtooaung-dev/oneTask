# Product Vision & Architectural Manifesto: oneTask 🚀

This document serves as the North Star for the design, architecture, and implementation of **oneTask**—a production-minded internal collaboration platform inspired by Linear, Slack, GitHub Activity, and Notion.

---

## 💡 Core Philosophy: "Everything in the system is an event"

The app is not meant to be a clone of existing project management tools. Instead, it focuses on a single event-driven loop:

```
User Action ➔ DB Mutation ➔ Activity Event ➔ Realtime Broadcaster ➔ UI Refresh
```

### Supported Event Types

- `task.created`
- `task.updated`
- `task.deleted`
- `comment.created`
- `member.joined`
- `project.created`
- `workspace.created`

---

## 🛠️ Technology Stack

### Frontend

- **Core**: React, TypeScript, Next.js / Vite
- **Styling**: Vanilla CSS / Tailwind CSS v4 variables
- **State Management**: TanStack Query (Server State), Zustand (Lightweight UI State)

### Backend

- **Core**: NestJS, PostgreSQL, TypeORM
- **Realtime**: Redis, WebSockets / Socket.io

### Infrastructure

- **DevOps**: Docker Compose, GitHub Actions CI/CD, Nginx

---

## 📂 Frontend Architecture (Feature-Based)

To maintain a scalable frontend structure, the client code follows feature-based scoping:

```
features/
  ├── auth/
  ├── workspace/
  ├── projects/
  ├── tasks/
  ├── comments/
  └── activity/
shared/
  ├── ui/
  ├── hooks/
  └── lib/
```

### Frontend State Principles

1. **Prioritize TanStack Query**: Server state is cached and queried using TanStack Query.
2. **No Server State Duplication**: Avoid replicating query data inside Zustand stores.
3. **Lightweight Zustand**: Zustand is strictly reserved for lightweight UI states (e.g. sidebar toggle, drawer collapse, active task selection).
4. **Optimistic Updates**: Mutating data should immediately update the query cache to feel instantaneous, recovering gracefully if an error occurs.

---

## 🏢 Backend Architectural Principles

1. **Strict Separation of Concerns**:
   - **Controllers**: Handle HTTP serialization, decorators, routing, and guards.
   - **Services**: Encapsulate pure business logic, access repositories, and emit events.
   - **Entities / Repositories**: Manage direct database schema structures.
2. **Event-Driven Evolution**:
   - Every meaningful state change must emit an event.
   - **Phase 1**: Trigger `ActivitiesService.logEvent()` directly.
   - **Phase 2**: Evolve toward a centralized `EventBus.emit("event", payload)` allowing downstream systems (realtime socket broads, notifications, third-party hooks) to subscribe cleanly without tight coupling.

---

## 📈 Feature Tracker & Current Project Status

### Core MVP (Steps 1–9) — ✅ All Complete

| Step  | Feature                        | Backend                                                                                | Frontend                                                                                                           | Status  |
| :---- | :----------------------------- | :------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- | :------ |
| **1** | **App Shell & Auth Hydration** | JWT sign-in / registration routes, custom global `AuthGuard`.                          | `AuthContext` provider, `AuthGuard` route protector, custom glassmorphism login & register views.                  | ✅ Done |
| **2** | **Workspace Sidebar**          | Workspace & project controllers + repositories.                                        | Sidebar with interactive Workspace/Project creators, select controls, and Zustand state synchronization.           | ✅ Done |
| **3** | **Task List View**             | Retrieval endpoint (`GET workspaces/:id/tasks`).                                       | Modern list grid fetching tasks via TanStack Query.                                                                | ✅ Done |
| **4** | **Task CRUD Flow**             | Task creation, PATCH (status/title/description/assignee), and DELETE endpoints.        | Dynamic forms inside task dialog.                                                                                  | ✅ Done |
| **5** | **Task Detail Drawer**         | Detail retrieval endpoint (`GET /tasks/:taskId`).                                      | Compact modal for creating, expanding to split-panel detail view on edit.                                          | ✅ Done |
| **6** | **Comments System**            | Comment creation and query endpoints (`POST` & `GET`).                                 | Live scrollable comment thread + author avatars in Task Edit Modal.                                                | ✅ Done |
| **7** | **Activity Feed**              | Database logging logic and query endpoint (`GET workspaces/:workspaceId/activities`).  | Chronological timeline feed showing member joins, task mutations, and comments with custom icons.                  | ✅ Done |
| **8** | **Realtime WebSockets**        | WebSocket Gateway with Socket.io, workspace room subscription, and JWT authentication. | `SocketProvider` wrapping the dashboard to join workspace channels and trigger TanStack Query cache invalidations. | ✅ Done |
| **9** | **Kanban Board**               | Reused existing task `PATCH` status updates.                                           | Drag-and-drop board view with columns, drag state visuals, & List/Board view toggling.                             | ✅ Done |

---

### Post-MVP Features — ✅ All Complete

| #      | Feature                       | Backend                                                                                                                                                              | Frontend                                                                                                                                             | Status  |
| :----- | :---------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- | :------ |
| **10** | **Workspace Invites & Email** | Token-based single-use invites with 2-day expiration, invite accept/revoke endpoints, Gmail SMTP email delivery via `nodemailer`.                                    | Invite form with role picker, pending invite list with copy-link & revoke, invite acceptance page.                                                   | ✅ Done |
| **11** | **Member Management & RBAC**  | `WorkspacePolicyService` with `Owner`/`Admin`/`Member` role matrix, role update & member removal endpoints, cascading permission checks.                             | `WorkspaceSettings` screen with member list, role change dropdowns, remove member confirm dialog, permission-aware UI via `useWorkspacePermissions`. | ✅ Done |
| **12** | **In-App Notifications**      | `NotificationsService` with create, list, mark-as-read, mark-all-read. Realtime broadcast of `notification_created` via socket.                                      | `NotificationBell` component with unread badge and dropdown.                                                                                         | ✅ Done |
| **13** | **Event Explorer**            | Activity query endpoint with type/actor/limit filters.                                                                                                               | `WorkspaceEventExplorer` page with search bar, event type and member dropdown filters, `ActivityEventCard` components.                               | ✅ Done |
| **14** | **Realtime Presence**         | Socket-based online user tracking per workspace room, `presence_sync` broadcasts on join/leave/disconnect, `removeUserFromWorkspace` for eviction on member removal. | Presence sync via `SocketContext`.                                                                                                                   | ✅ Done |

---

## 🔮 What's Next

| Priority  | Feature                         | Scope              | Details                                                                                                                                                                                              |
| :-------- | :------------------------------ | :----------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔴 High   | **Project CRUD & Settings**     | Backend + Frontend | Currently only create and list exist. Add endpoints and UI for editing project name/description, archiving, and deleting projects. Build a project-specific dashboard with task completion stats.    |
| 🔴 High   | **Analytics Dashboard**         | Backend + Frontend | The `analytics/` module exists but is empty. Build aggregation queries for task completion rates, activity trends over time, and per-member contribution stats. Create a dashboard page with charts. |
| 🟡 Medium | **Task Due Dates & Priorities** | Backend + Frontend | Add `dueDate` and `priority` fields to the task entity. Surface priority badges and due date pickers in the task modal and Kanban cards. Enable sorting/filtering by priority and due date.          |
| 🟡 Medium | **User Profile & Settings**     | Backend + Frontend | Allow users to update their display name, avatar, and password. Add a profile page accessible from the sidebar.                                                                                      |
| 🟡 Medium | **Session Report Emails**       | Backend            | Automated email summaries of workspace activity (daily/weekly digest) sent to members via the existing Gmail SMTP service.                                                                           |
| 🟢 Low    | **Global Search**               | Backend + Frontend | Full-text search across tasks, comments, and activity events within a workspace. Add a search bar to the sidebar or top nav.                                                                         |
| 🟢 Low    | **Task Labels & Tags**          | Backend + Frontend | Customizable color-coded labels that can be attached to tasks for categorization beyond status. Filter tasks by label in list and board views.                                                       |
| 🟢 Low    | **File Attachments**            | Backend + Frontend | Allow file uploads on tasks and comments. Store in S3-compatible storage with download links in the task detail drawer.                                                                              |
