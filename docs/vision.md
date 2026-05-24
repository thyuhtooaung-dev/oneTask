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

## 📈 MVP Feature Tracker & Current Project Status

Here is the current implementation status of the 9-step MVP roadmap:

| Step | Feature | Backend Status | Frontend Status | Status |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **App Shell & Auth Hydration** | JWT sign-in / registration routes, custom global `AuthGuard`. | `AuthContext` provider, `AuthGuard` route protector, custom glassmorphism login & register views. | **Complete** |
| **2** | **Workspace Sidebar** | Workspace & project controllers + repositories. | Sidebar with interactive Workspace/Project creators, select controls, and Zustand state synchronization. | **Complete** |
| **3** | **Task List View** | Retrieval endpoint (`GET workspaces/:id/tasks`) fully implemented. | Modern list grid fetching tasks via TanStack Query. | **Complete** |
| **4** | **Task CRUD Flow** | Task creation, PATCH (update title/description/status/assignee), and DELETE endpoints. | Dynamic forms inside task dialog. | **Complete** |
| **5** | **Task Detail Drawer** | Detail retrieval endpoint (`GET /tasks/:taskId`). | Compact modal for creating, expanding to split-panel detail view on edit. | **Complete** |
| **6** | **Comments System** | Comment creation and query endpoints (`POST` & `GET`). | Live scrollable comment thread + author avatars in Task Edit Modal. | **Complete** |
| **7** | **Activity Feed** | Database logging logic and query endpoint (`GET workspaces/:workspaceId/activities`). | Chronological timeline feed showing member joins, task mutations, and comments with custom icons. | **Complete** |
| **8** | **Realtime WebSockets** | WebSocket Gateway utilizing Socket.io with workspace room subscription and JWT authentication checks. | `SocketProvider` wrapping the dashboard to join workspace channels and trigger TanStack Query cache invalidations. | **Complete** |
| **9** | **Kanban Board** | Reused existing task `PATCH` status updates. | Drag-and-drop board view with columns, drag state visuals, & List/Board view toggling. | **Complete** |

---

## 🔮 What's Next (Immediate Action Items)

Now that the core 9-step MVP is fully complete, the immediate next priorities focus on transitioning **oneTask** into a production-ready team collaboration platform:

*   **Project Management & CRUD Settings**:
    *   **Backend**: Add endpoints to edit, archive, or delete projects and track statuses.
    *   **Frontend**: Build a project-specific dashboard to edit metadata and view completion stats.
*   **Workspace Invites & Member Management**:
    *   **Backend**: Implement token-based single-use workspace invites and role-based access control (`Owner`, `Admin`, `Member`).
    *   **Frontend**: Build a settings/members screen to manage team members, change roles, and copy/send workspace invites.
*   **Analytics & Event Metrics**:
    *   **Backend**: Query logged event history to generate aggregated activity rates.
    *   **Frontend**: Create glassmorphic charts highlighting team productivity trends, event frequencies, and task completion cycles.

