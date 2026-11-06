const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityPost',
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: [true, 'Please enter a comment'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

commentSchema.index({ post: 1, createdAt: 1 });
commentSchema.index({ author: 1 });

module.exports = mongoose.model('Comment', commentSchema);
