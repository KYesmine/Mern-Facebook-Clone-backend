import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import GridFsStorage from "multer-gridfs-storage";
import Grid from "gridfs-stream";
import path from "path";
import Pusher from "pusher";

Grid.mongo = mongoose.mongo;

// App config
const app = express();
const PORT = process.env.PORT || 5000;
// Middlewares
app.use(express.json());
app.use(cors());

// DB Config

// API Routes
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello",
  });
});

// Listen

app.listen(PORT, () => console.log("Hi!!"));
