const mongoose = require('mongoose');

const purchaseRequestSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    offeredPrice: {
      type: Number,
      required: true,
      min: [0, 'Offered price cannot be negative']
    },
    message: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
      default: 'pending'
    },
    meetingLocation: {
      type: String,
      default: 'Campus Library / Student Union'
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

purchaseRequestSchema.index({ buyer: 1, book: 1, status: 1 });
purchaseRequestSchema.index({ seller: 1, status: 1 });

module.exports = mongoose.model('PurchaseRequest', purchaseRequestSchema);
