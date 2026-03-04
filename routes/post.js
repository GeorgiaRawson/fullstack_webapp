// create a new router
const app = require("express").Router();

// import the models
const { Post } = require("../models/index");
// importing middleware
const { authMiddleware } = require("../utils/auth");

// Route to add a new post
app.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content, postedBy} = req.body;
    const post = await Post.create({ title, content, postedBy:req.user.username });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: "Error adding post" });
  }
});

// Route to get all posts
app.get("/", async (req, res) => {
  try {
    const posts = await Post.findAll();

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving posts", error });
  }
});

app.get("/:id", async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving post" });
  }
});

// Route to update a post
app.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, content} = req.body;
    const [updatedRows] = await Post.update(
      { title, content },
      { where: {  id: req.params.id, postedBy: req.user.username } 
      }
    );

    if (updatedRows === 0) {
      return res.status(403).json({ error: "Unauthorized: You do not own this post." });
    }
    res.json({ message: "Post updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating post" });
  }
});

// Route to delete a post
app.delete("/:id", authMiddleware, async (req, res) => {
  try {
  console.log(`User ${req.user.username} is trying to delete post ${req.params.id}`);
   const deletedRows = await Post.destroy({ 
      where: { id: req.params.id, postedBy: req.user.username } 
    });

    if (deletedRows === 0) {
      return res.status(403).json({ error: "Unauthorized: You cannot delete this post." });
    }

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting post" });
  }
});

// export the router
module.exports = app;
