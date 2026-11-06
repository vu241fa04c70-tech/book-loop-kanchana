const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a post title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    content: {
      type: String,
      required: [true, 'Please provide post content'],
      trim: true,
      maxlength: [3000, 'Content cannot exceed 3000 characters']
    },
    category: {
      type: String,
      enum: ['Recommendation', 'Discussion', 'Review', 'Book Club', 'Ask Community', 'Study Group', 'Question', 'General'],
      default: 'General'
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bookReferenced: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    },
    bookTitleText: {
      type: String,
      trim: true,
      default: ''
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    commentsCount: {
      type: Number,
      default: 0
    },
    tags: {
      type: [String],
      default: []
    },
    isPinned: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

communityPostSchema.index({ category: 1, createdAt: -1 });
communityPostSchema.index({ author: 1 });
communityPostSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
