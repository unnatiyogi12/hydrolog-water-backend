import express from 'express'
import morgan from 'morgan'
import authRouter from './routes/auth.routes.js'
import waterRoutes from "./routes/water.routes.js";
import pushRoutes from "./routes/push.routes.js";
import cookieParser from 'cookie-parser'
import cors from 'cors'
const app = express()
app.use(express.json())
app.use(morgan('dev'))
app.use(cookieParser())

app.use(cors({
  origin: "https://hydrolog-water-frontend.vercel.app", // Apna frontend URL yahan copy-paste karein
  credentials: true
}));

app.get("/", (req, res) => {
  res.send("Backend is running successfully for Deployment! 🚀");
});

app.use("/api/auth", authRouter);
app.use("/api/water", waterRoutes);
app.use("/api/push", pushRoutes);

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */


export default  app