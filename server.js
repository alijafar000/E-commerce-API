import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import authRouter from './routes/authRoutes.js'
import productRouter from './routes/productRoutes.js'
import cartRouter from './routes/cartRoutes.js'
import orderRouter from './routes/orderRoutes.js'
import paymentRouter from './routes/paymentRoute.js'
import reviewRouter from './routes/reviewRoutes.js'
import wishlistRouter from './routes/wishlistRoute.js'
import { errorHandler } from './middleware/errorMiddleware.js'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './config/swagger.js'
import { generalLimiter } from './middleware/rateLimiter.js'
import helmet from 'helmet'
import mongoSanatize from 'express-mongo-sanitize'
import xss from 'xss-clean'
import morgan from 'morgan'
import compression from 'compression'
const app = express();

app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

const allowedOrigins = [
    'http://localhost:3000',      // Local frontend
    'http://localhost:5173',      // Vite
    'https://your-frontend.vercel.app', // Production frontend
    'https://e-commerce-api-qjeq.onrender.com'
]

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(helmet())
app.use(mongoSanatize())
app.use(xss())
app.use(compression())
//morgan
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
} else {
    app.use(morgan('combined'))
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

//Add this line for raw JSON
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerSpec)
})

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
    })
})


const PORT = process.env.PORT || 5000

app.get('/', (req, res) => {
    res.json({ message: "E commerce API is running..." })
})

app.use('/api', generalLimiter)  // Global limiter

//user api
app.use('/api/auth', authRouter)

//produt api
app.use('/api/product', productRouter)

//cart api
app.use('/api/cart', cartRouter)

//order api
app.use('/api/order', orderRouter)

//payment api
app.use('/api/payment', paymentRouter)

//review api
app.use('/api/product', reviewRouter)

//wishlist api
app.use('/api/wishlist', wishlistRouter)
app.use(errorHandler)

app.listen(PORT, () => {
    connectDB()
    console.log(`Server is running at port ${PORT}`);
})
