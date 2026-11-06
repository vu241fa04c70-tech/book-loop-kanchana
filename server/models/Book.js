const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a book title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    author: {
      type: String,
      required: [true, 'Please add author name(s)'],
      trim: true
    },
    ISBN: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      required: [true, 'Please add a description of the book'],
      maxlength: [2500, 'Description cannot exceed 2500 characters']
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Computer Science',
        'Programming',
        'Data Structures and Algorithms',
        'Artificial Intelligence',
        'Mathematics',
        'Science',
        'Sciences',
        'Novels',
        'Competitive Examination Preparation',
        'Engineering',
        'Medicine & Health',
        'Business & Economics',
        'Law',
        'Literature & Fiction',
        'Social Sciences',
        'Exam Preparation',
        'General Non-Fiction',
        'Other'
      ],
      default: 'Other'
    },
    subject: {
      type: String,
      trim: true,
      default: ''
    },
    condition: {
      type: String,
      required: [true, 'Please state the condition of the book'],
      enum: ['Like New', 'Good', 'Fair', 'Poor'],
      default: 'Good'
    },
    price: {
      type: Number,
      required: [true, 'Please enter a price (use 0 for free donations)'],
      min: [0, 'Price cannot be negative'],
      default: 0
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
      default: 0
    },
    images: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
      ]
    },
    listingType: {
      type: String,
      required: [true, 'Please choose listing type'],
      enum: ['Sell', 'Exchange', 'Donate'],
      default: 'Sell'
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    college: {
      type: String,
      required: [true, 'College name is required'],
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    publisher: {
      type: String,
      trim: true,
      default: ''
    },
    edition: {
      type: String,
      trim: true,
      default: ''
    },
    exchangePreferences: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      trim: true,
      default: ''
    },
    availability: {
      type: String,
      enum: ['available', 'pending', 'in-transaction', 'exchanged', 'sold', 'donated'],
      default: 'available'
    },
    featured: {
      type: Boolean,
      default: false
    },
    viewsCount: {
      type: Number,
      default: 0
    },
    isSample: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Text index for search across title, author, subject, description, ISBN, publisher, and category
bookSchema.index({ title: 'text', author: 'text', subject: 'text', description: 'text', ISBN: 'text', publisher: 'text', category: 'text' });
bookSchema.index({ category: 1, listingType: 1, college: 1, city: 1, availability: 1, isSample: 1 });

module.exports = mongoose.model('Book', bookSchema);
