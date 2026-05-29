# oneTask ₍^. .^₎

A collaborative task management application that helps teams organize, track, and collaborate on projects in real-time.

₍^. .^₎ **Live Demo**: [https://one-task-sand.vercel.app](https://one-task-sand.vercel.app) /•᷅‎‎•᷄\੭

---

## About (˶˃ ᵕ ˂˶)

**oneTask** is a full-stack web application designed to streamline team collaboration and project management. It combines a modern, responsive frontend built with Next.js and a robust backend powered by NestJS.

Whether you're managing personal projects or coordinating with a large team, oneTask offers real-time synchronization, secure authentication, and an intuitive interface to keep everyone on the same page.

The project demonstrates best practices in modern full-stack development, including:
- Type-safe development with TypeScript across the stack ₍^. .^₎
- Real-time communication using Socket.io
- Scalable architecture with NestJS microservices /•᷅‎‎•᷄\੭
- Responsive UI with Tailwind CSS and modern React patterns
- Security-first approach with JWT authentication and bcrypt password hashing
- Containerized deployment with Docker (˶˃ ᵕ ˂˶)

---

## Features /•᷅‎‎•᷄\੭

- Task Management - Create, update, and manage tasks with ease ₍^. .^₎
- Team Collaboration - Work together with real-time updates using WebSockets
- User Authentication - Secure login with JWT-based authentication /•᷅‎‎•᷄\੭
- Real-time Updates - Instant synchronization across all team members (˶˃ ᵕ ˂˶)
- Real-time Communication - Live notifications and collaborative features
- Responsive Design - Works seamlessly on desktop and mobile devices ₍^. .^₎
- Modern Stack - Built with cutting-edge technologies
- Docker Ready - Easy deployment with containerization /•᷅‎‎•᷄\੭

---

## Tech Stack (˶˃ ᵕ ˂˶)

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) - React meta-framework ₍^. .^₎
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) - Lightweight state management
- **Data Fetching**: [TanStack React Query 5](https://tanstack.com/query/) - Async data management /•᷅‎‎•᷄\੭
- **Real-time**: [Socket.io Client](https://socket.io/) - WebSocket communication (˶˃ ᵕ ˂˶)
- **HTTP Client**: [Axios](https://axios-http.com/) - Promise-based HTTP client
- **UI Components**: [Lucide React](https://lucide.dev/) - Beautiful icons
- **Language**: TypeScript

### Backend
- **Framework**: [NestJS](https://nestjs.com/) - Node.js framework for building scalable applications ₍^. .^₎
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [TypeORM](https://typeorm.io/)
- **Real-time**: [Socket.io](https://socket.io/) - WebSocket server /•᷅‎‎•᷄\੭
- **Authentication**: [JWT](https://jwt.io/) with [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Throttling**: Rate limiting with NestJS throttler
- **Language**: TypeScript (˶˃ ᵕ ˂˶)

### DevOps
- **Containerization**: Docker ₍^. .^₎
- **Package Manager**: npm/pnpm

---

## Project Structure /•᷅‎‎•᷄\੭

```
oneTask/
├── client/                 # Next.js frontend application ₍^. .^₎
│   ├── src/
│   ├── public/
│   └── package.json
├── server/                 # NestJS backend application (˶˃ ᵕ ˂˶)
│   ├── src/
│   ├── test/
│   └── package.json
├── Dockerfile             # Docker configuration
└── README.md             # This file /•᷅‎‎•᷄\੭
```

---

## Getting Started (˶˃ ᵕ ˂˶)

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or pnpm package manager ₍^. .^₎

### Installation

1. Clone the repository:
```bash
git clone https://github.com/thyuhtooaung-dev/oneTask.git
cd oneTask
```

2. Install dependencies for both frontend and backend:
```bash
# Frontend /•᷅‎‎•᷄\੭
cd client
pnpm install

# Backend (˶˃ ᵕ ˂˶)
cd ../server
pnpm install
```

3. Set up environment variables:
```bash
# Server .env
DATABASE_URL=postgresql://user:password@localhost:5432/onetask
JWT_SECRET=your_secret_key
```

4. Run the development servers:
```bash
# Terminal 1: Backend ₍^. .^₎
cd server
pnpm run start:dev

# Terminal 2: Frontend /•᷅‎‎•᷄\੭
cd client
pnpm run dev
```

5. Open your browser and navigate to [http://localhost:3000](http://localhost:3000) (˶˃ ᵕ ˂˶)

---

## Contributing /•᷅‎‎•᷄\੭

Contributions are welcome! Please feel free to submit a Pull Request. ₍^. .^₎

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`) (˶˃ ᵕ ˂˶)
5. Open a Pull Request

---

## Code Quality (˶˃ ᵕ ˂˶)

This project uses:
- **Linting**: ESLint and Biome for code quality ₍^. .^₎
- **Formatting**: Biome and Prettier for consistent code style
- **Testing**: Jest for unit and integration tests /•᷅‎‎•᷄\੭

---

## Deployment ₍^. .^₎

The application is currently deployed on [Vercel](https://vercel.com) at [https://one-task-sand.vercel.app](https://one-task-sand.vercel.app)

For Docker deployment:
```bash
docker build -t onetask .
docker run -p 3000:3000 -p 3001:3001 onetask /•᷅‎‎•᷄\੭
```

---

## Topics & Tags (˶˃ ᵕ ˂˶)

- `github-integration` - GitHub-integrated development workflow ₍^. .^₎
- `tasks-manager` - Task and project management
- `team-collaboration` - Real-time team collaboration features
- `full-stack` - Full-stack web application /•᷅‎‎•᷄\੭
- `typescript` - TypeScript implementation
- `nextjs` - Next.js frontend framework (˶˃ ᵕ ˂˶)
- `nestjs` - NestJS backend framework
- `websocket` - Real-time WebSocket communication
- `react` - React-based frontend
- `postgresql` - PostgreSQL database ₍^. .^₎
- `jwt-authentication` - JWT-based secure authentication
- `tailwindcss` - Tailwind CSS styling
- `docker` - Containerized deployment
- `real-time-sync` - Real-time data synchronization /•᷅‎‎•᷄\੭

---

## License

This project is currently unlicensed. See the LICENSE file for details.

---

## Author (˶˃ ᵕ ˂˶)

Created by [thyuhtooaung-dev](https://github.com/thyuhtooaung-dev) ₍^. .^₎

## Support /•᷅‎‎•᷄\੭

For issues and questions, please use the [GitHub Issues](https://github.com/thyuhtooaung-dev/oneTask/issues) page.

---

Built with /•᷅‎‎•᷄\੭ (˶˃ ᵕ ˂˶) ₍^. .^₎ using modern web technologies
