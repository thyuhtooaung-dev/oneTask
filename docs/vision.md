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

## 📈 Recommended MVP Implementation Order

We bypass complex Kanban layouts early to build solid database mutations and realtime websocket synchronization first:

1. **App Shell & Auth Hydration**: Route guards checking token presence and loading active user profile context.
2. **Workspace Sidebar**: Dynamic selector fetching user workspaces and active project lists.
3. **Task List View**: Chronological task tables/lists within the active workspace/project scope.
4. **Task CRUD Flow**: Forms and modals to create, edit, or delete tasks.
5. **Task Detail Drawer**: Collapsible sliding pane showing selected task properties.
6. **Comments System**: Live comments thread attached to individual tasks.
7. **Activity Feed**: Unified workspace-wide event log proving our event logging habit.
8. **Realtime WebSockets**: broad notifications and cache invalidations upon incoming backend socket events.
9. **Kanban Board**: Drag-and-drop board styling layered over established sync routines.
