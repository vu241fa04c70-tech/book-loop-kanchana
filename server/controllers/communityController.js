const mongoose = require('mongoose');
const CommunityPost = require('../models/CommunityPost');
const Comment = require('../models/Comment');
const fallbackDb = require('../utils/fallbackDb');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Get all community posts with optional category filter & search
// @route   GET /api/community/posts
// @access  Public
exports.getPosts = async (req, res, next) => {
  try {
    const { category, search, sort = 'latest', page = 1, limit = 15 } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (category && category !== 'All') {
        query.category = category;
      }
      if (search && search.trim()) {
        query.$text = { $search: search.trim() };
      }

      let sortOptions = { createdAt: -1 };
      if (sort === 'popular') {
        sortOptions = { likes: -1, createdAt: -1 };
      }

      const skip = (Number(page) - 1) * Number(limit);
      const total = await CommunityPost.countDocuments(query);
      const posts = await CommunityPost.find(query)
        .populate('author', 'name profileImage college location')
        .populate('bookReferenced', 'title author images price condition')
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit));

      return res.status(200).json({
        success: true,
        count: posts.length,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)) || 1,
        posts
      });
    } else {
      if (!fallbackDb.communityPosts) fallbackDb.communityPosts = [];
      let posts = [...fallbackDb.communityPosts];

      if (category && category !== 'All') {
        posts = posts.filter((p) => p.category === category);
      }
      if (search && search.trim()) {
        const s = search.toLowerCase();
        posts = posts.filter(
          (p) =>
            p.title.toLowerCase().includes(s) ||
            p.content.toLowerCase().includes(s)
        );
      }
      if (sort === 'popular') {
        posts.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
      } else {
        posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      return res.status(200).json({
        success: true,
        count: posts.length,
        total: posts.length,
        page: 1,
        totalPages: 1,
        posts
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get single post by ID with comments
// @route   GET /api/community/posts/:id
// @access  Public
exports.getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const post = await CommunityPost.findById(id)
        .populate('author', 'name profileImage college location bio')
        .populate('bookReferenced', 'title author images price condition category');

      if (!post) {
        return res.status(404).json({ success: false, message: 'Community post not found' });
      }

      const comments = await Comment.find({ post: id })
        .populate('author', 'name profileImage college')
        .sort({ createdAt: 1 });

      return res.status(200).json({ success: true, post, comments });
    } else {
      if (!fallbackDb.communityPosts) fallbackDb.communityPosts = [];
      const post = fallbackDb.communityPosts.find((p) => p._id.toString() === id.toString());
      if (!post) {
        return res.status(404).json({ success: false, message: 'Community post not found' });
      }
      if (!fallbackDb.comments) fallbackDb.comments = [];
      const comments = fallbackDb.comments.filter((c) => c.post.toString() === id.toString());

      return res.status(200).json({ success: true, post, comments });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new community discussion or recommendation
// @route   POST /api/community/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    const { title, content, category, bookReferenced, bookTitleText, tags } = req.body;
    const userId = req.user._id || req.user.id;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and content for your post'
      });
    }

    if (mongoose.connection.readyState === 1) {
      const post = await CommunityPost.create({
        title: title.trim(),
        content: content.trim(),
        category: category || 'General',
        author: userId,
        bookReferenced: bookReferenced || undefined,
        bookTitleText: bookTitleText ? bookTitleText.trim() : '',
        tags: Array.isArray(tags) ? tags : []
      });

      const populated = await CommunityPost.findById(post._id)
        .populate('author', 'name profileImage college location')
        .populate('bookReferenced', 'title author images price');

      return res.status(201).json({ success: true, post: populated });
    } else {
      if (!fallbackDb.communityPosts) fallbackDb.communityPosts = [];
      const newPost = {
        _id: '66d1' + Math.random().toString(16).substring(2, 10).padEnd(20, '0'),
        title: title.trim(),
        content: content.trim(),
        category: category || 'General',
        author: req.user,
        bookReferenced: bookReferenced ? fallbackDb.books.find((b) => b._id.toString() === bookReferenced.toString()) : undefined,
        bookTitleText: bookTitleText || '',
        tags: Array.isArray(tags) ? tags : [],
        likes: [],
        commentsCount: 0,
        createdAt: new Date()
      };

      fallbackDb.communityPosts.unshift(newPost);
      return res.status(201).json({ success: true, post: newPost });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle like on a post
// @route   POST /api/community/posts/:id/like
// @access  Private
exports.toggleLikePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    if (mongoose.connection.readyState === 1) {
      const post = await CommunityPost.findById(id);
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }

      const likedIndex = post.likes.findIndex((l) => l.toString() === userId);
      let isLiked = false;

      if (likedIndex > -1) {
        post.likes.splice(likedIndex, 1);
        isLiked = false;
      } else {
        post.likes.push(userId);
        isLiked = true;

        if (post.author.toString() !== userId) {
          createNotification({
            recipientId: post.author,
            senderId: userId,
            type: 'community_like',
            title: 'New Like on your Community Post',
            message: `${req.user.name || 'A reader'} liked your post "${post.title}".`,
            link: `/community?post=${post._id}`
          }).catch(() => {});
        }
      }

      await post.save();
      return res.status(200).json({
        success: true,
        isLiked,
        likesCount: post.likes.length
      });
    } else {
      if (!fallbackDb.communityPosts) fallbackDb.communityPosts = [];
      const post = fallbackDb.communityPosts.find((p) => p._id.toString() === id.toString());
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
      if (!post.likes) post.likes = [];
      const likedIndex = post.likes.findIndex((l) => (l._id || l).toString() === userId);
      let isLiked = false;

      if (likedIndex > -1) {
        post.likes.splice(likedIndex, 1);
        isLiked = false;
      } else {
        post.likes.push(userId);
        isLiked = true;
      }

      return res.status(200).json({ success: true, isLiked, likesCount: post.likes.length });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Add comment to a post
// @route   POST /api/community/posts/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = (req.user._id || req.user.id).toString();

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty' });
    }

    if (mongoose.connection.readyState === 1) {
      const post = await CommunityPost.findById(id);
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }

      const comment = await Comment.create({
        post: id,
        author: userId,
        content: content.trim()
      });

      post.commentsCount = (post.commentsCount || 0) + 1;
      await post.save();

      const populated = await Comment.findById(comment._id).populate(
        'author',
        'name profileImage college'
      );

      if (post.author.toString() !== userId) {
        createNotification({
          recipientId: post.author,
          senderId: userId,
          type: 'community_comment',
          title: 'New Comment on your Post',
          message: `${req.user.name || 'A reader'} commented on "${post.title}".`,
          link: `/community?post=${post._id}`
        }).catch(() => {});
      }

      return res.status(201).json({ success: true, comment: populated });
    } else {
      if (!fallbackDb.communityPosts) fallbackDb.communityPosts = [];
      const post = fallbackDb.communityPosts.find((p) => p._id.toString() === id.toString());
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }

      const newComment = {
        _id: '66d2' + Math.random().toString(16).substring(2, 10).padEnd(20, '0'),
        post: id,
        author: req.user,
        content: content.trim(),
        createdAt: new Date()
      };

      if (!fallbackDb.comments) fallbackDb.comments = [];
      fallbackDb.comments.push(newComment);
      post.commentsCount = (post.commentsCount || 0) + 1;

      return res.status(201).json({ success: true, comment: newComment });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Delete post (author or admin)
// @route   DELETE /api/community/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = (req.user._id || req.user.id).toString();
    const isAdmin = req.user.role === 'admin';

    if (mongoose.connection.readyState === 1) {
      const post = await CommunityPost.findById(id);
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }

      if (post.author.toString() !== userId && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
      }

      await CommunityPost.findByIdAndDelete(id);
      await Comment.deleteMany({ post: id });

      return res.status(200).json({ success: true, message: 'Post deleted successfully' });
    } else {
      if (!fallbackDb.communityPosts) fallbackDb.communityPosts = [];
      const idx = fallbackDb.communityPosts.findIndex((p) => p._id.toString() === id.toString());
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
      fallbackDb.communityPosts.splice(idx, 1);
      return res.status(200).json({ success: true, message: 'Post deleted successfully' });
    }
  } catch (err) {
    next(err);
  }
};
