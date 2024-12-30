import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRouter from "./routes/userRoutes.js";
import videoRouter from "./routes/videoRoutes.js";
import blogRouter from "./routes/blogRoutes.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static("public"));
app.use(cookieParser());

// routes
app.use("/api/users", userRouter);
app.use("/api/videos", videoRouter);
app.use("/api/blogs", blogRouter);


connectDB().then(()=>{
    console.log("DB connected");
})
  
app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running}`);
});

