const mongoose = require('mongoose');

const purchaseRequestSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      sparse: true
    },
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
      enum: ['pending', 'counter_offered', 'accepted', 'rejected', 'cancelled', 'completed', 'disputed'],
      default: 'pending'
    },
    counterOfferPrice: {
      type: Number,
      min: [0, 'Counter offer cannot be negative']
    },
    counterOfferMessage: {
      type: String,
      trim: true,
      default: ''
    },
    counterOfferStatus: {
      type: String,
      enum: ['none', 'pending', 'accepted', 'rejected'],
      default: 'none'
    },
    meetingLocation: {
      type: String,
      default: 'Campus Library / Student Union'
    },
    handoverConfirmedByBuyer: {
      type: Boolean,
      default: false
    },
    handoverConfirmedBySeller: {
      type: Boolean,
      default: false
    },
    handoverConfirmedAt: {
      type: Date
    },
    disputeReason: {
      type: String,
      trim: true,
      default: ''
    },
    disputeStatus: {
      type: String,
      enum: ['none', 'open', 'resolved'],
      default: 'none'
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
