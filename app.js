import express from 'express'
import cors from "cors"
import { config } from "dotenv";
import { errorHandler } from './middleware/error.js'
import connectToDatabase from './config/db.js'
import authRouter from "./routes/auth.js";
import studRouter from "./routes/student.js"
import courseRouter from "./routes/courses.js"

// Express App
const app = express()
app.use(
  cors({
    allowedHeaders: ["authorization", "Content-Type"], // you can change the headers
    exposedHeaders: ["authorization"], // you can change the headers
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
  })
);

// Middlewares
config()
app.use(express.json());
connectToDatabase(process.env.MONGO_URL);
app.use("/auth", authRouter);
app.use("/stud", studRouter);
app.use("/courses", courseRouter);


app.get('/', (req, res) => {
    res.send('Student Hello World!')
})

// Error handling
app.use(errorHandler);

export default app;