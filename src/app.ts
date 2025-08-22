import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
import router from "./routes";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

//corse setup :
const corsOptions = {
  origin: "*",
  credentials: true,
};

app.use(cors(corsOptions));

// app.use('/api/users', userRoutes)
app.use("/api/v1", router);

app.use(notFound as never);
app.use(globalErrorHandler);

export default app;
