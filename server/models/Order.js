const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true
    },
    purchaseRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseRequest',
      required: true
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
    finalPrice: {
      type: Number,
      required: true,
      min: [0, 'Final price cannot be negative']
    },
    handoverLocation: {
      type: String,
      default: 'Campus Library / Student Center'
    },
    status: {
      type: String,
      enum: ['in_progress', 'handover_pending', 'completed', 'cancelled', 'disputed'],
      default: 'in_progress'
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
      default: ''
    }
  },
  {
    timestamps: true
  }
);

orderSchema.index({ buyer: 1, status: 1 });
orderSchema.index({ seller: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);
