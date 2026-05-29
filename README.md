# oneTask

A collaborative task management application that helps teams organize, track, and collaborate on projects in real-time.

🌐 **Live Demo**: [https://one-task-sand.vercel.app](https://one-task-sand.vercel.app)

## Features

- ✅ **Task Management** - Create, update, and manage tasks with ease
- 👥 **Team Collaboration** - Work together with real-time updates using WebSockets
- 🔐 **User Authentication** - Secure login with JWT-based authentication
- 📊 **GitHub Integration** - Built with modern development practices
- 💬 **Real-time Communication** - Instant updates across all team members
- 🎨 **Responsive Design** - Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) - React meta-framework
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) - Lightweight state management
- **Data Fetching**: [TanStack React Query 5](https://tanstack.com/query/) - Async data management
- **Real-time**: [Socket.io Client](https://socket.io/) - WebSocket communication
- **HTTP Client**: [Axios](https://axios-http.com/) - Promise-based HTTP client
- **UI Components**: [Lucide React](https://lucide.dev/) - Beautiful icons
- **Language**: TypeScript

### Backend
- **Framework**: [NestJS](https://nestjs.com/) - Node.js framework for building scalable applications
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [TypeORM](https://typeorm.io/)
- **Real-time**: [Socket.io](https://socket.io/) - WebSocket server
- **Authentication**: [JWT](https://jwt.io/) with [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Throttling**: Rate limiting with NestJS throttler
- **Language**: TypeScript

### DevOps
- **Containerization**: Docker
- **Package Manager**: npm/pnpm

## Project Structure

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
├── Dockerfile             # Docker configuration
└── README.md             # This file
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- Docker (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/thyuhtooaung-dev/oneTask.git
cd oneTask
```

2. **Setup Backend**
```bash
cd server
npm install
npm run build
```

3. **Setup Frontend**
```bash
cd ../client
npm install
npm run build
```

### Running Locally

#### Backend
```bash
cd server
npm run start:dev
```
The server will run on `http://localhost:3000` (or configured port)

#### Frontend
```bash
cd client
npm run dev
```
The client will run on `http://localhost:3000`

### Environment Variables

Create `.env` files in both client and server directories with necessary configurations:

**Server (.env)**
```
DATABASE_URL=postgresql://user:password@localhost:5432/onetask
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=7d
```

**Client (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

## Development

### Available Scripts

**Frontend**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Check code quality with Biome
- `npm run format` - Format code with Biome

**Backend**
- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run lint` - Lint and fix code
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:cov` - Run tests with coverage

## Docker Deployment

Build and run the application with Docker:

```bash
docker build -t onetask .
docker run -p 3000:3000 -p 3001:3001 onetask
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Code Quality

This project uses:
- **Linting**: ESLint and Biome for code quality
- **Formatting**: Biome and Prettier for consistent code style
- **Testing**: Jest for unit and integration tests

## Topics

- `github-integration` - GitHub-integrated development workflow
- `tasks-manager` - Task and project management
- `team-collaboration` - Real-time team collaboration features

## License

This project is currently unlicensed. See the LICENSE file for details.

## Author

Created by [thyuhtooaung-dev](https://github.com/thyuhtooaung-dev)

## Support

For issues and questions, please use the [GitHub Issues](https://github.com/thyuhtooaung-dev/oneTask/issues) page.

---

**Built with ❤️ using modern web technologies**
