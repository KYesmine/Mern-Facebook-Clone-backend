import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import Grid from "gridfs-stream";
import path from "path";
import Pusher from "pusher";
import dotenv from "dotenv";
import Post from "./models/postModel.js";

// Grid.mongo = mongoose.mongo;

// App config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(cors());

// DB Config & Listen

const conn = mongoose.createConnection(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gfs;

conn.once("open", () => {
  console.log("Connected to Database");
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("images");
  gfs.mongo = mongoose.mongo;
  gfs.db = conn.db;
});

const storage = new GridFsStorage({
  url: process.env.DATABASE_URL,
  file: (res, file) => {
    return new Promise((res, rej) => {
      const filename = `image-${Date.now()}${path.extname(file.originalname)}`;
      const fileInfo = {
        filename: filename,
        bucketName: "images",
      };

      res(fileInfo);
    });
  },
});

const upload = multer({ storage });

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// API Routes

// @route GET /
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello",
  });
});

// @route POST /upload/image
app.post("/upload/image", upload.single("file"), (req, res) => {
  res.status(201).json(req.file);
});

// @route POST /upload/post
app.post("/upload/post", (req, res) => {
  const post = req.body;
  console.log(post);
  Post.create(post, (err, data) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      res.status(201).json(data);
    }
  });
});

// @route GET /posts
app.get("/posts", (req, res) => {
  Post.find((err, posts) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      posts.sort((a, b) => {
        return b.timestamp - a.timestamp;
      });
      res.status(201).json(posts);
    }
  });
});

// @route GET /images/single
app.get("/images/single/:filename", (req, res) => {
  gfs.files.findOne(
    {
      filename: req.params.filename,
    },
    (err, file) => {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        if (!file || file.length === 0) {
          res.status(404).json({
            error: "file not found!",
          });
        } else {
          const readStream = gfs.createReadStream(file.filename);
          readStream.pipe(res);
        }
      }
    }
  );
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
