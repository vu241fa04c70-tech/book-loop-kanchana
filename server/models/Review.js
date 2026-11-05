const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reviewedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    transactionType: {
      type: String,
      enum: ['purchase', 'exchange'],
      required: true
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: [true, 'Please provide review comments'],
      maxlength: [500, 'Comment cannot exceed 500 characters']
    }
  },
  {
    timestamps: true
  }
);

// Prevent multiple reviews from the same reviewer for the exact same transaction
reviewSchema.index({ reviewer: 1, transactionId: 1 }, { unique: true });
reviewSchema.index({ reviewedUser: 1, rating: 1 });

module.exports = mongoose.model('Review', reviewSchema);
