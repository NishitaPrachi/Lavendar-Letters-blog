const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./models/User");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { upload } = require("./middlewares/multer.middleware");
const { uploadOnCloudinary } = require("./utils/cloudinary");
const Post = require("./models/Post");
const salt = bcrypt.genSaltSync(10);
require("dotenv").config();

app.use(
  cors({
    credentials: true,
    methods: ["POST", "GET", "PUT"],
    origin: "http://localhost:3000",
  })
);

app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });
  if (!userDoc) {
    return res.status(400).json("Invalid credentials");
  }
  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    jwt.sign(
      { username, id: userDoc._id },
      process.env.JWT_SECRET,
      {},
      (err, token) => {
        if (err) throw err;
        res.cookie("token", token, { httpOnly: true }).json({
          id: userDoc._id,
          username,
        });
      }
    );
  } else {
    res.status(400).json("Invalid credentials");
  }
});

app.get("/api/profile", (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json("No token provided");
  }
  jwt.verify(token, process.env.JWT_SECRET, {}, (err, info) => {
    if (err) return res.status(403).json("Invalid token");
    res.json(info);
  });
});

app.post("/api/logout", (req, res) => {
  res.cookie("token", "", { httpOnly: true }).json("ok");
});

app.post("/api/post", upload.single("file"), async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json("No token provided");
  }
  jwt.verify(token, process.env.JWT_SECRET, {}, async (err, info) => {
    if (err) return res.status(403).json("Invalid token");

    const { title, summary, content } = req.body;
    try {
      const result = await uploadOnCloudinary(req.file.buffer);
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: result.secure_url,
        author: info.id,
      });

      res.json(postDoc);
    } catch (error) {
      res.status(500).json("Error uploading to Cloudinary");
    }
  });
});

app.put("/api/post", upload.single("file"), async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json("No token provided");
  }
  jwt.verify(token, process.env.JWT_SECRET, {}, async (err, info) => {
    if (err) return res.status(403).json("Invalid token");
    const { id, title, summary, content } = req.body;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json("You are not the author");
    }

    postDoc.title = title;
    postDoc.summary = summary;
    postDoc.content = content;
    if (req.file) {
      try {
        const result = await uploadOnCloudinary(req.file.buffer);
        postDoc.cover = result.secure_url;
      } catch (error) {
        return res.status(500).json("Error uploading to Cloudinary");
      }
    }
    await postDoc.save();

    res.json(postDoc);
  });
});

app.get("/api/post", async (req, res) => {
  res.json(
    await Post.find()
      .populate("author", ["username"])
      .sort({ createdAt: -1 })
      .limit(20)
  );
});

app.get("/api/post/:id", async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate("author", ["username"]);
  res.json(postDoc);
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
