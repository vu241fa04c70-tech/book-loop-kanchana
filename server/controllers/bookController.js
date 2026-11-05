const mongoose = require('mongoose');
const Book = require('../models/Book');
const fallbackDb = require('../utils/fallbackDb');

// @desc    Get all books with search, filters, sorting & pagination
// @route   GET /api/books
// @access  Public
exports.getBooks = async (req, res, next) => {
  try {
    const {
      search,
      category,
      listingType,
      condition,
      college,
      minPrice,
      maxPrice,
      availability,
      sort,
      page = 1,
      limit = 12,
      featured
    } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = {};

      if (availability && availability !== 'all') {
        query.availability = availability;
      } else if (!availability) {
        query.availability = 'available';
      }

      if (search && search.trim() !== '') {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [
          { title: searchRegex },
          { author: searchRegex },
          { subject: searchRegex },
          { description: searchRegex }
        ];
      }

      if (category && category !== 'All') query.category = category;
      if (listingType && listingType !== 'All') query.listingType = listingType;
      if (condition && condition !== 'All') query.condition = condition;
      if (college && college !== 'All') query.college = new RegExp(college.trim(), 'i');

      if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined && minPrice !== '') query.price.$gte = Number(minPrice);
        if (maxPrice !== undefined && maxPrice !== '') query.price.$lte = Number(maxPrice);
      }

      if (featured === 'true') query.featured = true;

      let sortOption = { createdAt: -1 };
      if (sort === 'price-asc') sortOption = { price: 1 };
      else if (sort === 'price-desc') sortOption = { price: -1 };
      else if (sort === 'views') sortOption = { viewsCount: -1 };
      else if (sort === 'oldest') sortOption = { createdAt: 1 };

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const skip = (pageNum - 1) * limitNum;

      const total = await Book.countDocuments(query);
      const books = await Book.find(query)
        .populate('seller', 'name email college location profileImage createdAt')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum);

      return res.status(200).json({
        success: true,
        count: books.length,
        total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        books
      });
    } else {
      // Fallback query engine
      let filtered = [...fallbackDb.books];

      // Availability
      if (availability && availability !== 'all') {
        filtered = filtered.filter((b) => b.availability === availability);
      } else if (!availability) {
        filtered = filtered.filter((b) => b.availability === 'available');
      }

      // Search
      if (search && search.trim() !== '') {
        const q = search.trim().toLowerCase();
        filtered = filtered.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q) ||
            (b.subject && b.subject.toLowerCase().includes(q)) ||
            (b.description && b.description.toLowerCase().includes(q))
        );
      }

      // Category
      if (category && category !== 'All') {
        filtered = filtered.filter((b) => b.category === category);
      }

      // ListingType
      if (listingType && listingType !== 'All') {
        filtered = filtered.filter((b) => b.listingType === listingType);
      }

      // Condition
      if (condition && condition !== 'All') {
        filtered = filtered.filter((b) => b.condition === condition);
      }

      // College
      if (college && college !== 'All') {
        const cLower = college.toLowerCase();
        filtered = filtered.filter((b) => b.college.toLowerCase().includes(cLower));
      }

      // Price
      if (minPrice !== undefined && minPrice !== '') {
        filtered = filtered.filter((b) => b.price >= Number(minPrice));
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        filtered = filtered.filter((b) => b.price <= Number(maxPrice));
      }

      // Featured
      if (featured === 'true') {
        filtered = filtered.filter((b) => b.featured === true);
      }

      // Sort
      if (sort === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sort === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sort === 'views') {
        filtered.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
      } else if (sort === 'oldest') {
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else {
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      const total = filtered.length;
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const skip = (pageNum - 1) * limitNum;
      const paginated = filtered.slice(skip, skip + limitNum);

      return res.status(200).json({
        success: true,
        count: paginated.length,
        total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        books: paginated
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get single book details by ID
// @route   GET /api/books/:id
// @access  Public
exports.getBook = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const book = await Book.findById(req.params.id).populate(
        'seller',
        'name email phone college location profileImage createdAt bio'
      );

      if (!book) {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }

      book.viewsCount = (book.viewsCount || 0) + 1;
      await book.save({ validateBeforeSave: false });

      return res.status(200).json({ success: true, book });
    } else {
      const book = fallbackDb.books.find((b) => b._id.toString() === req.params.id.toString());
      if (!book) {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }

      book.viewsCount = (book.viewsCount || 0) + 1;
      return res.status(200).json({ success: true, book });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new book listing
// @route   POST /api/books
// @access  Private
exports.createBook = async (req, res, next) => {
  try {
    const {
      title,
      author,
      ISBN,
      description,
      category,
      subject,
      condition,
      price,
      originalPrice,
      images,
      listingType,
      college,
      location
    } = req.body;

    if (!title || !author || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide book title, author, and description'
      });
    }

    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      const book = await Book.create({
        title,
        author,
        ISBN: ISBN || '',
        description,
        category: category || 'Other',
        subject: subject || '',
        condition: condition || 'Good',
        price: listingType === 'Donate' ? 0 : Number(price) || 0,
        originalPrice: Number(originalPrice) || 0,
        images: images && images.length > 0 ? images : undefined,
        listingType: listingType || 'Sell',
        seller: userId,
        college: college || req.user.college,
        location: location || req.user.location,
        availability: 'available'
      });

      return res.status(201).json({ success: true, book });
    } else {
      const newBookId = '66b2' + Math.random().toString(16).substring(2, 10).padEnd(20, '0');
      const sellerUser = fallbackDb.users.find((u) => u._id.toString() === userId.toString()) || req.user;

      const newBook = {
        _id: newBookId,
        title,
        author,
        ISBN: ISBN || '',
        description,
        category: category || 'Other',
        subject: subject || '',
        condition: condition || 'Good',
        price: listingType === 'Donate' ? 0 : Number(price) || 0,
        originalPrice: Number(originalPrice) || 0,
        images:
          images && images.length > 0
            ? images
            : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'],
        listingType: listingType || 'Sell',
        seller: sellerUser,
        college: college || req.user.college,
        location: location || req.user.location,
        availability: 'available',
        featured: false,
        viewsCount: 1,
        createdAt: new Date()
      };

      fallbackDb.books.unshift(newBook);
      return res.status(201).json({ success: true, book: newBook });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update book listing
// @route   PUT /api/books/:id
// @access  Private
exports.updateBook = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();

    if (mongoose.connection.readyState === 1) {
      let book = await Book.findById(req.params.id);

      if (!book) {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }

      if (book.seller.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to update this book listing'
        });
      }

      book = await Book.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      }).populate('seller', 'name email college location profileImage');

      return res.status(200).json({ success: true, book });
    } else {
      const bookIndex = fallbackDb.books.findIndex(
        (b) => b._id.toString() === req.params.id.toString()
      );

      if (bookIndex === -1) {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }

      const book = fallbackDb.books[bookIndex];
      const sellerId = (book.seller._id || book.seller).toString();

      if (sellerId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to update this book listing'
        });
      }

      fallbackDb.books[bookIndex] = {
        ...book,
        ...req.body
      };

      return res.status(200).json({ success: true, book: fallbackDb.books[bookIndex] });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Delete book listing
// @route   DELETE /api/books/:id
// @access  Private
exports.deleteBook = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();

    if (mongoose.connection.readyState === 1) {
      const book = await Book.findById(req.params.id);

      if (!book) {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }

      if (book.seller.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to delete this book listing'
        });
      }

      await book.deleteOne();
      return res.status(200).json({ success: true, message: 'Book listing deleted successfully' });
    } else {
      const bookIndex = fallbackDb.books.findIndex(
        (b) => b._id.toString() === req.params.id.toString()
      );

      if (bookIndex === -1) {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }

      const book = fallbackDb.books[bookIndex];
      const sellerId = (book.seller._id || book.seller).toString();

      if (sellerId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to delete this book listing'
        });
      }

      fallbackDb.books.splice(bookIndex, 1);
      return res.status(200).json({ success: true, message: 'Book listing deleted successfully' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get my listed books
// @route   GET /api/books/my-listings
// @access  Private
exports.getMyListings = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();

    if (mongoose.connection.readyState === 1) {
      const books = await Book.find({ seller: userId }).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: books.length, books });
    } else {
      const books = fallbackDb.books.filter((b) => {
        const sellerId = (b.seller._id || b.seller).toString();
        return sellerId === userId;
      });

      return res.status(200).json({ success: true, count: books.length, books });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Upload book image
// @route   POST /api/books/upload
// @access  Private
exports.uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image file'
    });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    imageUrl: fileUrl,
    filename: req.file.filename
  });
};
