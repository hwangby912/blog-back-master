const express = require("express");
const router = express.Router();
const { Comment, validateComment } = require("../models/comment");
const auth = require("../common/auth")();
const wrapper = require("../common/wrapper");
const { Post } = require("../models/post");

router.post(
  "/",
  auth.authenticate(),
  wrapper(async (req, res, next) => {
    const { post_id, contents } = req.body;
    if (validateComment(req.body).error) {
      res.json({ error: "Not fit on the form", result: false });
      next();
      return;
    }
    const comment = new Comment({
      post_id,
      contents,
      author: req.user.id
    });
    await comment.save();
    // post는 post_id와 같은 _id를 가진 document
    const post = await Post.findById(post_id);
    post.comments.push(comment._id);
    await post.save();
    res.json({ result: true });
    next();
  })
);

router.get(
  "/",
  wrapper(async (req, res, next) => {
    const { post_id } = req.query;
    const comments = await Post.findById(post_id)
      .select("comments")
      .populate("comments", "author contents date");

    res.json({ comments });
    next();
  })
);

router.delete(
  "/:id",
  auth.authenticate(),
  wrapper(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);
    // Login id
    if (req.user.id.toString() !== comment.author.toString()) {
      res.json({ error: "unauthorized", result: false });
    } else {
      const post = await Post.findById(comment.post_id);
      const index = post.comments.indexOf(comment.id);
      post.comments.splice(index, 1);
      await post.save();
      await Comment.deleteOne({ _id: req.params.id });

      res.json({ result: true });
    }
    next();
  })
);

module.exports = router;
