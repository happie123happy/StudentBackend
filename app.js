import express from 'express'
import cors from "cors"
import { config } from "dotenv";
import { errorHandler } from './middleware/error.js'
import connectToDatabase from './config/db.js'
import authRouter from "./routes/auth.js";
// import studRouter from "./routes/student.js"

// Express App
const app = express()
app.use(cors());

// Middlewares
config()
app.use(express.json());
connectToDatabase(process.env.MONGO_URL);
app.use("/auth", authRouter);
// app.use("/stud", studRouter);


app.get('/', (req, res) => {
    res.send('Student Hello World!')
})

// Error handling
app.use(errorHandler);

export default app;