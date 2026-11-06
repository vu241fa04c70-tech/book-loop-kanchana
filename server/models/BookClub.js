const mongoose = require('mongoose');

const bookClubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a club name'],
      trim: true,
      maxlength: [80, 'Club name cannot exceed 80 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a club description'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    category: {
      type: String,
      default: 'General'
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    currentBook: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    currentBookTitle: {
      type: String,
      default: ''
    },
    readingGoal: {
      type: String,
      default: '1 book per month'
    },
    meetingSchedule: {
      type: String,
      default: 'Bi-weekly on Sundays'
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80'
    },
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

bookClubSchema.index({ category: 1 });
bookClubSchema.index({ creator: 1 });

module.exports = mongoose.model('BookClub', bookClubSchema);
