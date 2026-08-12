# oneTask

A collaborative task management application that helps teams organize, track, and collaborate on projects in real time.

**Live Demo**: https://one-task-sand.vercel.app

---

## About

oneTask is a full-stack web application designed to streamline team collaboration and project management. It combines a modern, responsive frontend built with Next.js and a robust backend powered by NestJS.

Whether you're managing personal projects or coordinating with a large team, oneTask provides real-time synchronization, secure authentication, and an intuitive interface to keep everyone aligned.

The project demonstrates best practices in modern full-stack development, including:
- Type-safe development with TypeScript across the stack
- Real-time communication using Socket.io
- Scalable architecture with NestJS microservices
- Responsive UI with Tailwind CSS and modern React patterns
- Security-first approach with JWT authentication and bcrypt password hashing
- Containerized deployment with Docker

---

## Features

- Task management: create, update, and manage tasks efficiently
- Team collaboration with real-time updates via WebSockets
- Secure user authentication with JWT
- Real-time updates and notifications
- Responsive design for desktop and mobile
- Modern technology stack
- Docker-ready for easy deployment

---

## Tech stack

### Frontend
- Framework: Next.js
- Styling: Tailwind CSS
- State management: Zustand
- Data fetching: TanStack React Query
- Real-time: Socket.io Client
- HTTP client: Axios
- UI components: Lucide React
- Language: TypeScript

### Backend
- Framework: NestJS
- Database: PostgreSQL with TypeORM
- Real-time: Socket.io
- Authentication: JWT with bcryptjs
- Throttling: NestJS throttler
- Language: TypeScript

### DevOps
- Containerization: Docker
- Package manager: npm or pnpm

---

## Project structure

```
oneTask/
├── client/                 # Next.js frontend application
│   ├── src/
│   ├── public/
│   └── package.json
├── server/                 # NestJS backend application
│   ├── src/
│   ├── test/
│   └── package.json
├── Dockerfile              # Docker configuration
└── README.md               # This file
```

---

## Getting started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or pnpm package manager

### Installation

1. Clone the repository:

```bash
git clone https://github.com/thyuhtooaung-dev/oneTask.git
cd oneTask
```

2. Install dependencies for both frontend and backend:

```bash
# Frontend
cd client
pnpm install

# Backend
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
# Terminal 1: Backend
cd server
pnpm run start:dev

# Terminal 2: Frontend
cd client
pnpm run dev
```

5. Open your browser and navigate to http://localhost:3000

---

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -m "Add feature"
4. Push to the branch: `git push origin feature/YourFeature`
5. Open a pull request

---

## Code quality

This project uses:
- Linting: ESLint and Biome
- Formatting: Biome and Prettier
- Testing: Jest for unit and integration tests

---

## Deployment

The application is currently deployed on Vercel: https://one-task-sand.vercel.app

For Docker deployment:

```bash
docker build -t onetask .
docker run -p 3000:3000 -p 3001:3001 onetask
```

---

## Topics & tags

- `github-integration`
- `tasks-manager`
- `team-collaboration`
- `full-stack`
- `typescript`
- `nextjs`
- `nestjs`
- `websocket`
- `react`
- `postgresql`
- `jwt-authentication`
- `tailwindcss`
- `docker`
- `real-time-sync`

---

## License

This project is currently unlicensed. See the LICENSE file for details.

---

## Author

Created by [thyuhtooaung-dev](https://github.com/thyuhtooaung-dev)

## Support

For issues and questions, please use the GitHub Issues page: https://github.com/thyuhtooaung-dev/oneTask/issues

---

Built with modern web technologies.
