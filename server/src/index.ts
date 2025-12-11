import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import propertyRoutes from './routes/properties.js';
import tenantRoutes from './routes/tenants.js';
import maintenanceRoutes from './routes/maintenance.js';
import paymentRoutes from './routes/payments.js';
import { authRoutes } from './routes/auth.js';
import { mpesaRoutes } from './routes/mpesa.js';
import notificationRoutes from './routes/notifications.js';
import userRoutes from './routes/users.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { initRentScheduler, generateMonthlyRent } from './services/rentGenerator.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Initialize Rent Scheduler
initRentScheduler();

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development to avoid blocking resources
    crossOriginEmbedderPolicy: false, // Allow cross-origin requests
})); // Security headers

// CORS configuration - support multiple origins
const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map(url => url.trim())
    : ['http://localhost:5173'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize user input to prevent NoSQL injection
app.use(mongoSanitize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

// Serve static files
const uploadsPath = path.join(__dirname, '../uploads');
console.log('Serving static files from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Root route
app.get('/', (req, res) => {
    res.send('Rental Management API is running');
});

// Manual trigger for rent generation (Admin only - protected in real app)
app.post('/api/admin/generate-rent', async (req, res) => {
    await generateMonthlyRent();
    res.json({ message: 'Rent generation triggered successfully' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Auth routes registered');
});
