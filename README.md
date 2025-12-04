# Rental Management Application

A comprehensive full-stack rental property management system built with React, TypeScript, Node.js, and MongoDB.

## Features

- **Dashboard**: Overview of properties, tenants, and financial metrics
- **Property Management**: Add, edit, and track rental properties
- **Tenant Management**: Manage tenant information and lease details
- **Maintenance Requests**: Track and manage property maintenance
- **Financial Management**: Rent collection, payment tracking, and reporting
- **M-Pesa Integration**: Direct mobile money payments via Safaricom Daraja API
- **Automated Rent Generation**: Monthly rent records created automatically
- **Notifications**: Bulk email notifications to tenants
- **Role-based Access**: Separate dashboards for admins and tenants

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Node-cron** for scheduled tasks
- **Helmet** & **CORS** for security

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- M-Pesa Developer Account (optional, for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd rental-management-app
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Configure environment variables**

   **Frontend**: Create `.env` in the root directory
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

   **Backend**: Create `.env` in the `server` directory
   ```bash
   cd server
   cp .env.example .env
   ```
   Edit `server/.env` and configure:
   - MongoDB connection string
   - M-Pesa credentials (if using payments)
   - CORS settings

### Running Locally

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   Backend runs on http://localhost:5000

2. **Start the frontend** (in a new terminal)
   ```bash
   npm run dev
   ```
   Frontend runs on http://localhost:5173

3. **Access the application**
   - Open http://localhost:5173 in your browser
   - Default admin credentials (if seeded):
     - Email: admin@rental.com
     - Password: admin123

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to Render.

### Quick Deploy to Render

1. Push your code to GitHub
2. Connect your repository to Render
3. Render will detect `render.yaml` and deploy both services
4. Configure environment variables in Render dashboard
5. Access your deployed application

## Project Structure

```
rental-management-app/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── context/           # React context providers
│   └── types/             # TypeScript type definitions
├── server/                # Backend source code
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── middleware/    # Express middleware
│   └── package.json
├── public/                # Static assets
├── .env.example           # Frontend environment template
├── render.yaml           # Render deployment config
├── DEPLOYMENT.md         # Deployment guide
└── package.json          # Frontend dependencies
```

## Key Features Explained

### Automated Rent Generation
- Runs daily at midnight (configurable via cron)
- Automatically creates monthly rent records for all active tenants
- Calculates total rent including utilities

### M-Pesa Integration
- STK Push for direct mobile payments
- Payment status tracking
- Automatic payment recording

### Role-Based Access
- **Admin**: Full access to all features
- **Tenant**: View own information, make payments, submit maintenance requests

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Properties
- `GET /api/properties` - List all properties
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Tenants
- `GET /api/tenants` - List all tenants
- `GET /api/tenants/me` - Get current tenant profile
- `POST /api/tenants/:id/record-payment` - Record payment

### Maintenance
- `GET /api/maintenance` - List maintenance requests
- `POST /api/maintenance` - Create maintenance request
- `PUT /api/maintenance/:id` - Update request status

### Payments
- `POST /api/mpesa/stk-push` - Initiate M-Pesa payment
- `GET /api/mpesa/query/:id` - Check payment status

## Development

### Running Tests
```bash
npm test
```

### Building for Production

**Frontend:**
```bash
npm run build
```

**Backend:**
```bash
cd server
npm run build
```

### Linting
```bash
npm run lint
```

## Environment Variables

### Frontend (.env)
- `VITE_API_URL` - Backend API URL

### Backend (server/.env)
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 5000)
- `CLIENT_URL` - Frontend URL for CORS
- `MPESA_*` - M-Pesa API credentials

## Security

- JWT-based authentication
- Password hashing with bcrypt
- MongoDB injection prevention
- CORS configuration
- Helmet.js security headers
- Rate limiting on API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For issues and questions:
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
- Review API documentation
- Check server logs for errors

## Acknowledgments

- Built with React and Node.js
- M-Pesa integration via Safaricom Daraja API
- Deployed on Render
- Database hosted on MongoDB Atlas
