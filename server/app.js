import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
const app = express()
const port = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL
import connectDB from './config/connectDb.js'
import userRoutes from './routes/userRoutes.js'
import cors from 'cors';


// CORS Policy
app.use(cors())

// Database Connection
connectDB(DATABASE_URL)

// JSON
app.use(express.json());

// URL-encoded Form Data Parsing
app.use(express.urlencoded({ extended: true }));

// Load Routes
app.use("/api/user", userRoutes)

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})