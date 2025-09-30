const express = require('express');
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Blog = require('../models/Blog');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get comments for a blog
router.get('/blog/:blogId', async (req, res) => {
  try {
    const comments = await Comment.find({ 
      blog: req.params.blogId,
      parentComment: null 
    })
    .populate('author', 'username profile')
    .populate({
      path: 'replies',
      populate: {
        path: 'author',
        select: 'username profile'
      }
    })
    .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create comment
router.post('/', [
  auth,
  body('content').notEmpty().withMessage('Content is required'),
  body('blog').notEmpty().withMessage('Blog ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const blog = await Blog.findById(req.body.blog);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const comment = new Comment({
      ...req.body,
      author: req.user.id
    });

    await comment.save();
    
    // Update blog comments count
    blog.commentsCount += 1;
    await blog.save();

    // If it's a reply, add to parent comment's replies
    if (req.body.parentComment) {
      await Comment.findByIdAndUpdate(req.body.parentComment, {
        $push: { replies: comment._id }
      });
    }

    await comment.populate('author', 'username profile');

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update comment
router.put('/:id', auth, async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { 
        content: req.body.content,
        isEdited: true,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('author', 'username profile');

    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment or is admin
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update blog comments count
    await Blog.findByIdAndUpdate(comment.blog, {
      $inc: { commentsCount: -1 }
    });

    await Comment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike comment
router.post('/:id/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const hasLiked = comment.likes.includes(req.user.id);

    if (hasLiked) {
      // Unlike
      comment.likes = comment.likes.filter(like => like.toString() !== req.user.id);
    } else {
      // Like
      comment.likes.push(req.user.id);
    }

    await comment.save();
    res.json({ likes: comment.likes, hasLiked: !hasLiked });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;