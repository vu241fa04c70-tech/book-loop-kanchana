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

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bookloop';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Book.deleteMany({});
    await ExchangeRequest.deleteMany({});
    await PurchaseRequest.deleteMany({});
    await Wishlist.deleteMany({});
    await Review.deleteMany({});
    await Message.deleteMany({});
    await Conversation.deleteMany({});

    console.log('Cleared existing collections.');

    // Create Demo Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = await User.insertMany([
      {
        name: 'Alex Rivera',
        email: 'alex@student.edu',
        password: hashedPassword,
        phone: '+1 555-0192',
        college: 'Stanford University',
        registrationNumber: 'CS-2023-8821',
        location: 'Palo Alto, CA',
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        role: 'student',
        bio: 'Senior Computer Science major. Lover of algorithms, sci-fi, and system architecture.'
      },
      {
        name: 'Samantha Lee',
        email: 'samantha@student.edu',
        password: hashedPassword,
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
        password: hashedPassword,
        phone: '+1 555-0188',
        college: 'Columbia University',
        registrationNumber: 'BUS-2024-9021',
        location: 'New York, NY',
        profileImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
        role: 'student',
        bio: 'Economics & Finance enthusiast. Always looking for classic literature and management casebooks.'
      },
      {
        name: 'BookLoop Admin',
        email: 'admin@bookloop.org',
        password: hashedPassword,
        phone: '+1 555-0100',
        college: 'BookLoop University Consortium',
        registrationNumber: 'ADM-001',
        location: 'Boston, MA',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
        role: 'admin',
        bio: 'Platform Administrator. Ensuring safe, clean, and welcoming community book swaps for students worldwide.'
      }
    ]);

    const [alex, samantha, marcus, admin] = users;
    console.log(`Created ${users.length} demo users.`);

    // Create Realistic College Book Listings
    const booksData = [
      {
        title: 'Introduction to Algorithms (CLRS)',
        author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest',
        ISBN: '978-0262033848',
        description: 'The definitive textbook for algorithms and data structures. Comprehensive coverage from sorting to graph theory, dynamic programming, and NP-completeness. In excellent condition with minimal highlighting.',
        category: 'Computer Science',
        subject: 'Algorithms & Data Structures',
        condition: 'Like New',
        price: 45,
        originalPrice: 120,
        images: [
          'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
        ],
        listingType: 'Sell',
        seller: alex._id,
        college: 'Stanford University',
        location: 'Gates Computer Science Building, Palo Alto',
        availability: 'available',
        featured: true,
        viewsCount: 142
      },
      {
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        ISBN: '978-1449373320',
        description: 'The big ideas behind reliable, scalable, and maintainable systems. Key concepts of storage engines, distributed consensus, transactions, and stream processing.',
        category: 'Computer Science',
        subject: 'Distributed Systems',
        condition: 'Like New',
        price: 28,
        originalPrice: 55,
        images: [
          'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80'
        ],
        listingType: 'Exchange',
        seller: alex._id,
        college: 'Stanford University',
        location: 'Tressider Memorial Union',
        availability: 'available',
        featured: true,
        viewsCount: 98
      },
      {
        title: 'Guyton and Hall Textbook of Medical Physiology',
        author: 'John E. Hall, Michael E. Hall',
        ISBN: '978-0323597128',
        description: 'Comprehensive medical physiology textbook. Clear text, rich full-color illustrations, and clinical correlations. Very clean interior, light wear on cover corners.',
        category: 'Medicine & Health',
        subject: 'Human Physiology',
        condition: 'Good',
        price: 55,
        originalPrice: 135,
        images: [
          'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80'
        ],
        listingType: 'Sell',
        seller: samantha._id,
        college: 'UC Berkeley',
        location: 'Valley Life Sciences Building, Berkeley',
        availability: 'available',
        featured: true,
        viewsCount: 115
      },
      {
        title: 'Molecular Biology of the Cell',
        author: 'Bruce Alberts, Rebecca Heald, Alexander Johnson',
        ISBN: '978-0393884821',
        description: 'Essential molecular biology textbook for undergraduate biology and bioengineering majors. High quality glossy pages with diagrams. Giving away for free donation to help a student!',
        category: 'Medicine & Health',
        subject: 'Cell Biology',
        condition: 'Good',
        price: 0,
        originalPrice: 160,
        images: [
          'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80'
        ],
        listingType: 'Donate',
        seller: samantha._id,
        college: 'UC Berkeley',
        location: 'Moffitt Undergraduate Library',
        availability: 'available',
        featured: false,
        viewsCount: 210
      },
      {
        title: 'Principles of Corporate Finance (13th Edition)',
        author: 'Richard A. Brealey, Stewart C. Myers, Franklin Allen',
        ISBN: '978-1260013900',
        description: 'Describes the theory and practice of corporate finance. Covers capital budgeting, risk, valuation, and debt financing with modern real-world corporate examples.',
        category: 'Business & Economics',
        subject: 'Corporate Finance',
        condition: 'Good',
        price: 35,
        originalPrice: 95,
        images: [
          'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80'
        ],
        listingType: 'Sell',
        seller: marcus._id,
        college: 'Columbia University',
        location: 'Uris Hall / Columbia Business School',
        availability: 'available',
        featured: true,
        viewsCount: 84
      },
      {
        title: 'Thinking, Fast and Slow',
        author: 'Daniel Kahneman',
        ISBN: '978-0374533557',
        description: 'Nobel Memorial Prize in Economic Sciences laureate explains the two systems that drive the way we think: System 1 (fast, intuitive) and System 2 (slow, deliberative). Fantastic read for economics and psychology students.',
        category: 'Business & Economics',
        subject: 'Behavioral Economics',
        condition: 'Like New',
        price: 12,
        originalPrice: 22,
        images: [
          'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=800&q=80'
        ],
        listingType: 'Exchange',
        seller: marcus._id,
        college: 'Columbia University',
        location: 'Butler Library Cafe',
        availability: 'available',
        featured: false,
        viewsCount: 76
      },
      {
        title: 'Calculus: Early Transcendentals (8th Edition)',
        author: 'James Stewart',
        ISBN: '978-1285741550',
        description: 'Standard calculus textbook for university engineering and math sequences. Thorough problem sets, single and multivariable calculus, and vector calculus.',
        category: 'Mathematics',
        subject: 'Calculus I - III',
        condition: 'Fair',
        price: 0,
        originalPrice: 110,
        images: [
          'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80'
        ],
        listingType: 'Donate',
        seller: alex._id,
        college: 'Stanford University',
        location: 'Green Library',
        availability: 'available',
        featured: false,
        viewsCount: 167
      },
      {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin (Uncle Bob)',
        ISBN: '978-0132350884',
        description: 'Best-selling guide on writing readable, testable, refactorable code. Meaningful names, clean functions, error handling, unit tests, and code smells.',
        category: 'Computer Science',
        subject: 'Software Engineering',
        condition: 'Like New',
        price: 22,
        originalPrice: 48,
        images: [
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'
        ],
        listingType: 'Sell',
        seller: alex._id,
        college: 'Stanford University',
        location: 'Huang Engineering Center',
        availability: 'available',
        featured: true,
        viewsCount: 189
      },
      {
        title: 'Organic Chemistry (7th Edition)',
        author: 'Paula Yurkanis Bruice',
        ISBN: '978-0321803221',
        description: 'Comprehensive organic chemistry textbook with mechanisms, synthesis strategies, and spectroscopy problems. Minor wear on spine, pages are clean.',
        category: 'Sciences',
        subject: 'Chemistry',
        condition: 'Good',
        price: 40,
        originalPrice: 140,
        images: [
          'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?auto=format&fit=crop&w=800&q=80'
        ],
        listingType: 'Exchange',
        seller: samantha._id,
        college: 'UC Berkeley',
        location: 'Hearst Memorial Mining Building',
        availability: 'available',
        featured: false,
        viewsCount: 62
      },
      {
        title: 'To Kill a Mockingbird (Special Edition)',
        author: 'Harper Lee',
        ISBN: '978-0060935467',
        description: 'Pulitzer Prize-winning masterpiece exploring justice, empathy, and innocence in the American South. Required reading for American Literature courses.',
        category: 'Literature & Fiction',
        subject: 'American Literature',
        condition: 'Like New',
        price: 8,
        originalPrice: 18,
        images: [
          'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=800&q=80'
        ],
        listingType: 'Sell',
        seller: marcus._id,
        college: 'Columbia University',
        location: 'Morningside Heights',
        availability: 'available',
        featured: false,
        viewsCount: 53
      }
    ];

    const books = await Book.insertMany(booksData);
    console.log(`Created ${books.length} book listings.`);

    // Create Sample Exchange Request (Samantha offers Organic Chemistry for Alex's Designing Data-Intensive Applications)
    const dataIntensiveBook = books.find((b) => b.title.includes('Data-Intensive'));
    const organicChemistryBook = books.find((b) => b.title.includes('Organic Chemistry'));

    if (dataIntensiveBook && organicChemistryBook) {
      await ExchangeRequest.create({
        requestedBy: samantha._id,
        owner: alex._id,
        bookOffered: organicChemistryBook._id,
        bookRequested: dataIntensiveBook._id,
        message: 'Hi Alex! I need this book for my computational biology elective. Would love to trade my Organic Chemistry text!',
        status: 'pending',
        meetingLocation: 'Stanford/Berkeley Joint Symposium or Central Library'
      });
      console.log('Created sample exchange request.');
    }

    // Create Sample Purchase Request (Marcus wants to buy CLRS from Alex)
    const clrsBook = books.find((b) => b.title.includes('Algorithms'));
    if (clrsBook) {
      await PurchaseRequest.create({
        buyer: marcus._id,
        seller: alex._id,
        book: clrsBook._id,
        offeredPrice: 40,
        message: 'Hello Alex, I can pick this up tomorrow after 2 PM at the campus library. Does $40 work for you?',
        status: 'pending',
        meetingLocation: 'Gates Computer Science Building'
      });
      console.log('Created sample purchase request.');
    }

    // Create Wishlist items
    await Wishlist.create({
      user: marcus._id,
      book: clrsBook._id
    });
    await Wishlist.create({
      user: samantha._id,
      book: dataIntensiveBook._id
    });
    console.log('Created sample wishlists.');

    // Create Reviews
    await Review.create({
      reviewer: samantha._id,
      reviewedUser: alex._id,
      transactionType: 'exchange',
      transactionId: new mongoose.Types.ObjectId(),
      rating: 5,
      comment: 'Super easy book exchange! The book was in crisp condition and Alex was right on time at the campus cafe.'
    });
    await Review.create({
      reviewer: alex._id,
      reviewedUser: marcus._id,
      transactionType: 'purchase',
      transactionId: new mongoose.Types.ObjectId(),
      rating: 5,
      comment: 'Great communication and prompt meetup. Highly recommend exchanging or buying from Marcus!'
    });
    console.log('Created sample reviews.');

    // Create sample conversation and messages
    const convId = [alex._id.toString(), samantha._id.toString()].sort().join('_') + `_${dataIntensiveBook._id}`;
    await Conversation.create({
      participants: [alex._id, samantha._id],
      lastMessage: 'Sounds great! Let’s meet outside the library at 3 PM on Thursday.',
      lastSender: alex._id,
      book: dataIntensiveBook._id
    });

    await Message.create([
      {
        conversationId: convId,
        sender: samantha._id,
        receiver: alex._id,
        message: 'Hey Alex! Is Designing Data-Intensive Applications still open for trade?',
        book: dataIntensiveBook._id
      },
      {
        conversationId: convId,
        sender: alex._id,
        receiver: samantha._id,
        message: 'Yes Samantha! I saw your Organic Chemistry book, looks like a great match.',
        book: dataIntensiveBook._id
      },
      {
        conversationId: convId,
        sender: samantha._id,
        receiver: alex._id,
        message: 'Awesome. Would Thursday afternoon work for a quick swap?',
        book: dataIntensiveBook._id
      },
      {
        conversationId: convId,
        sender: alex._id,
        receiver: samantha._id,
        message: 'Sounds great! Let’s meet outside the library at 3 PM on Thursday.',
        book: dataIntensiveBook._id
      }
    ]);
    console.log('Created sample messages.');

    console.log('\n=============================================');
    console.log('DATABASE SEEDED SUCCESSFULLY!');
    console.log('Demo Credentials:');
    console.log('  Student 1: alex@student.edu / password123');
    console.log('  Student 2: samantha@student.edu / password123');
    console.log('  Student 3: marcus@student.edu / password123');
    console.log('  Admin:     admin@bookloop.org / password123');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
