const mongoose = require('mongoose');

const donationRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    purpose: {
      type: String,
      trim: true,
      default: 'Semester Coursework'
    },
    message: {
      type: String,
      trim: true,
      default: ''
    },
    meetingLocation: {
      type: String,
      default: 'Campus Library / Student Assistance Desk'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
      default: 'pending'
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('DonationRequest', donationRequestSchema);
