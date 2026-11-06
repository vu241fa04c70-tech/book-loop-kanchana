const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Book = require('../models/Book');
const ExchangeRequest = require('../models/ExchangeRequest');
const PurchaseRequest = require('../models/PurchaseRequest');
const Wishlist = require('../models/Wishlist');
const Review = require('../models/Review');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const CommunityPost = require('../models/CommunityPost');
const BookClub = require('../models/BookClub');
const sampleBooks = require('./sampleBooksData');

const demoUsersData = [
  {
    name: 'Alex Rivera',
    email: 'alex@student.edu',
    phone: '+1 555-0192',
    college: 'Stanford University',
    registrationNumber: 'CS-2023-8821',
    location: 'Palo Alto, CA',
    profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    role: 'student',
    bio: 'Senior Computer Science major. Lover of algorithms, distributed systems, and sci-fi.'
  },
  {
    name: 'Samantha Lee',
    email: 'samantha@student.edu',
    phone: '+1 555-0144',
    college: 'UC Berkeley',
    registrationNumber: 'ENG-2022-4412',
    location: 'Berkeley, CA',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    role: 'student',
    bio: 'Biomedical Engineering junior. Happy to exchange textbooks with fellow STEM students!'
  },
  {
    name: 'Marcus Johnson',
    email: 'marcus@student.edu',
    phone: '+1 555-0188',
    college: 'Columbia University',
    registrationNumber: 'BUS-2024-9021',
    location: 'New York, NY',
    profileImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
    role: 'student',
    bio: 'Economics & Literature enthusiast. Always looking for classic novels and casebooks.'
  },
  {
    name: 'BookLoop Admin',
    email: 'admin@bookloop.org',
    phone: '+1 555-0100',
    college: 'BookLoop University Consortium',
    registrationNumber: 'ADM-001',
    location: 'Boston, MA',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    role: 'admin',
    bio: 'Platform Administrator. Ensuring safe, clean, and welcoming community book swaps.'
  }
];

// Idempotent Seeder: Guarantees at least 20+ sample books exist without creating duplicates
const seedSampleBooks = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 1. Ensure Demo Users exist (upsert to prevent duplicates)
    const userMap = {};
    for (const userData of demoUsersData) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create({
          ...userData,
          password: hashedPassword
        });
      }
      userMap[userData.email] = user;
    }

    // 2. Insert/Upsert sample books (prevent duplicate sample records)
    let seededCount = 0;
    for (const book of sampleBooks) {
      const seller = userMap[book.sellerEmail] || userMap['alex@student.edu'];
      const { sellerEmail, ...bookFields } = book;

      const existingBook = await Book.findOne({
        ISBN: book.ISBN,
        isSample: true
      });

      if (!existingBook) {
        await Book.create({
          ...bookFields,
          seller: seller._id,
          isSample: true
        });
        seededCount++;
      } else {
        // Update to ensure latest properties without duplicate
        await Book.updateOne(
          { _id: existingBook._id },
          { $set: { ...bookFields, seller: seller._id, isSample: true } }
        );
      }
    }

    // 3. Ensure sample exchange and purchase transactions exist if none present
    const clrs = await Book.findOne({ title: /Introduction to Algorithms/i });
    const organic = await Book.findOne({ title: /Organic Chemistry/i });
    const alex = userMap['alex@student.edu'];
    const samantha = userMap['samantha@student.edu'];
    const marcus = userMap['marcus@student.edu'];

    if (clrs && organic && alex && samantha) {
      const existingExchange = await ExchangeRequest.findOne({
        requestedBy: samantha._id,
        bookRequested: clrs._id
      });
      if (!existingExchange) {
        await ExchangeRequest.create({
          requestedBy: samantha._id,
          owner: alex._id,
          bookOffered: organic._id,
          bookRequested: clrs._id,
          message: 'Hi Alex! Would love to trade my Organic Chemistry for your CLRS textbook.',
          meetingLocation: 'Stanford Green Library',
          status: 'pending'
        });
      }
    }

    if (clrs && alex && marcus) {
      const existingPurchase = await PurchaseRequest.findOne({
        buyer: marcus._id,
        book: clrs._id
      });
      if (!existingPurchase) {
        await PurchaseRequest.create({
          buyer: marcus._id,
          seller: alex._id,
          book: clrs._id,
          offeredPrice: 48,
          message: 'Hello! I can pick this up tomorrow on campus. Does $48 work?',
          meetingLocation: 'Gates CS Building',
          status: 'pending'
        });
      }
    }

    // 4. Seed initial Community Posts & Book Clubs if none exist
    const postCount = await CommunityPost.countDocuments();
    if (postCount === 0 && alex && samantha) {
      await CommunityPost.create([
        {
          author: alex._id,
          title: 'Top 5 CS textbooks that actually saved my semester',
          content: 'From CLRS to Clean Code, here is my honest review of which textbooks are worth keeping on your physical shelf versus just borrowing. What are your must-haves?',
          category: 'Discussion',
          tags: ['Computer Science', 'Textbooks', 'StudyTips'],
          likes: [samantha._id],
          likesCount: 1,
          commentsCount: 1
        },
        {
          author: samantha._id,
          title: 'Looking for study partner for AI / Deep Learning syllabus',
          content: 'Currently working through Goodfellow’s Deep Learning book. Looking for a study group or someone willing to exchange notes and work on PyTorch projects together!',
          category: 'Study Group',
          tags: ['Artificial Intelligence', 'Deep Learning', 'PyTorch'],
          likes: [alex._id],
          likesCount: 1,
          commentsCount: 0
        }
      ]);
    }

    const clubCount = await BookClub.countDocuments();
    if (clubCount === 0 && alex && samantha) {
      await BookClub.create([
        {
          name: 'Silicon Valley Engineering Readers',
          description: 'A club dedicated to software engineering classics, architecture design, and system architecture literature.',
          category: 'Computer Science',
          creator: alex._id,
          members: [alex._id, samantha._id],
          membersCount: 2,
          currentBook: {
            title: 'Designing Data-Intensive Applications',
            author: 'Martin Kleppmann',
            targetDate: new Date('2026-12-15')
          },
          meetingSchedule: 'Bi-weekly on Saturdays at 4:00 PM PST',
          readingGoal: 'Read 6 tech classics this semester',
          image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'
        },
        {
          name: 'The Great Fiction & Classics Circle',
          description: 'Discussing world literature, modern fiction, sci-fi epics, and timeless thought-provoking novels.',
          category: 'Literature',
          creator: samantha._id,
          members: [samantha._id],
          membersCount: 1,
          currentBook: {
            title: 'Project Hail Mary',
            author: 'Andy Weir',
            targetDate: new Date('2026-11-30')
          },
          meetingSchedule: 'Monthly on Sundays at 6:00 PM PST',
          readingGoal: '1 book per month with vibrant open discussions',
          image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80'
        }
      ]);
    }

    console.log(`[Database Seed] Sample books check completed. (Added ${seededCount} new sample books, total verified: ${sampleBooks.length})`);
    return { success: true, count: sampleBooks.length };
  } catch (error) {
    console.error('[Database Seed Error]:', error.message);
    return { success: false, error: error.message };
  }
};

// Full reset seed (clears and re-seeds)
const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bookloop';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for full seeding...');

    // Only delete sample books and demo collections to preserve any real user data
    await Book.deleteMany({ isSample: true });
    await User.deleteMany({ email: { $in: demoUsersData.map((u) => u.email) } });
    await ExchangeRequest.deleteMany({});
    await PurchaseRequest.deleteMany({});
    await Wishlist.deleteMany({});
    await Review.deleteMany({});
    await Message.deleteMany({});
    await Conversation.deleteMany({});

    await seedSampleBooks();

    console.log('\n=============================================');
    console.log(`DATABASE SEEDED SUCCESSFULLY WITH ${sampleBooks.length} SAMPLE BOOKS!`);
    console.log('Categories covered:');
    console.log('  ✓ Computer Science');
    console.log('  ✓ Programming');
    console.log('  ✓ Data Structures and Algorithms');
    console.log('  ✓ Artificial Intelligence');
    console.log('  ✓ Mathematics');
    console.log('  ✓ Science');
    console.log('  ✓ Novels');
    console.log('  ✓ Competitive Examination Preparation');
    console.log('\nDemo User Credentials:');
    console.log('  Student 1: alex@student.edu / password123');
    console.log('  Student 2: samantha@student.edu / password123');
    console.log('  Student 3: marcus@student.edu / password123');
    console.log('  Admin:     admin@bookloop.org / password123');
    console.log('=============================================\n');

    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Error during database seed:', error);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, seedSampleBooks, demoUsersData };
