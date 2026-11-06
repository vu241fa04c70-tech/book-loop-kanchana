const bcrypt = require('bcryptjs');
const sampleBooks = require('./sampleBooksData');

class FallbackDatabase {
  constructor() {
    this.initialized = false;
    this.users = [];
    this.books = [];
    this.exchangeRequests = [];
    this.purchaseRequests = [];
    this.wishlists = [];
    this.reviews = [];
    this.messages = [];
    this.conversations = [];
    this.reports = [];
    this.notifications = [];
    this.communityPosts = [];
    this.comments = [];
    this.bookClubs = [];
    this.init();
  }

  init() {
    if (this.initialized) return;

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('password123', salt);

    this.users = [
      {
        _id: '66a100000000000000000001',
        name: 'Alex Rivera',
        email: 'alex@student.edu',
        password: hashedPassword,
        phone: '+1 555-0192',
        college: 'Stanford University',
        registrationNumber: 'CS-2023-8821',
        location: 'Palo Alto, CA',
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        role: 'student',
        bio: 'Senior Computer Science major. Lover of algorithms, distributed systems, and sci-fi.',
        createdAt: new Date('2026-09-01')
      },
      {
        _id: '66a100000000000000000002',
        name: 'Samantha Lee',
        email: 'samantha@student.edu',
        password: hashedPassword,
        phone: '+1 555-0144',
        college: 'UC Berkeley',
        registrationNumber: 'ENG-2022-4412',
        location: 'Berkeley, CA',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        role: 'student',
        bio: 'Biomedical Engineering junior. Happy to exchange textbooks with fellow STEM students!',
        createdAt: new Date('2026-09-05')
      },
      {
        _id: '66a100000000000000000003',
        name: 'Marcus Johnson',
        email: 'marcus@student.edu',
        password: hashedPassword,
        phone: '+1 555-0188',
        college: 'Columbia University',
        registrationNumber: 'BUS-2024-9021',
        location: 'New York, NY',
        profileImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
        role: 'student',
        bio: 'Economics & Literature enthusiast. Always looking for classic novels and casebooks.',
        createdAt: new Date('2026-09-10')
      },
      {
        _id: '66a100000000000000000004',
        name: 'BookLoop Admin',
        email: 'admin@bookloop.org',
        password: hashedPassword,
        phone: '+1 555-0100',
        college: 'BookLoop University Consortium',
        registrationNumber: 'ADM-001',
        location: 'Boston, MA',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
        role: 'admin',
        bio: 'Platform Administrator. Ensuring safe, clean, and welcoming community book swaps.',
        createdAt: new Date('2026-08-15')
      }
    ];

    const userEmailMap = {
      'alex@student.edu': this.users[0],
      'samantha@student.edu': this.users[1],
      'marcus@student.edu': this.users[2],
      'admin@bookloop.org': this.users[3]
    };

    // Load all 24 sample books
    this.books = sampleBooks.map((b, idx) => {
      const hexId = (idx + 1).toString(16).padStart(8, '0');
      const seller = userEmailMap[b.sellerEmail] || this.users[0];
      const { sellerEmail, ...bookFields } = b;
      return {
        _id: `66b2000000000000${hexId}`,
        ...bookFields,
        seller,
        isSample: true,
        createdAt: new Date(Date.now() - (sampleBooks.length - idx) * 3600000)
      };
    });

    // Sample active exchange request
    this.exchangeRequests = [
      {
        _id: '66c300000000000000000001',
        requestedBy: this.users[1],
        owner: this.users[0],
        bookOffered: this.books[7],
        bookRequested: this.books[2],
        message: 'Hi Alex! I need this book for distributed systems. Would love to trade my Cracking the Coding Interview text!',
        status: 'pending',
        meetingLocation: 'Stanford Green Library',
        createdAt: new Date('2026-10-20')
      }
    ];

    // Sample active purchase request
    this.purchaseRequests = [
      {
        _id: '66d400000000000000000001',
        buyer: this.users[2],
        seller: this.users[0],
        book: this.books[0],
        offeredPrice: 40,
        message: 'Hello Alex, I can pick this up tomorrow after 2 PM at the campus library. Does $40 work for you?',
        status: 'pending',
        meetingLocation: 'Gates Computer Science Building',
        createdAt: new Date('2026-10-22')
      }
    ];

    this.wishlists = [
      {
        _id: '66e500000000000000000001',
        user: this.users[2]._id,
        book: this.books[0],
        createdAt: new Date('2026-10-23')
      },
      {
        _id: '66e500000000000000000002',
        user: this.users[1]._id,
        book: this.books[5],
        createdAt: new Date('2026-10-24')
      }
    ];

    this.reviews = [
      {
        _id: '66f600000000000000000001',
        reviewer: this.users[1],
        reviewedUser: this.users[0]._id,
        transactionType: 'exchange',
        transactionId: '66c300000000000000000001',
        rating: 5,
        comment: 'Super easy book exchange! The book was in crisp condition and Alex was right on time at the campus cafe.',
        createdAt: new Date('2026-10-25')
      },
      {
        _id: '66f600000000000000000002',
        reviewer: this.users[0],
        reviewedUser: this.users[2]._id,
        transactionType: 'purchase',
        transactionId: '66d400000000000000000001',
        rating: 5,
        comment: 'Great communication and prompt meetup. Highly recommend exchanging or buying from Marcus!',
        createdAt: new Date('2026-10-26')
      }
    ];

    const convId = [this.users[0]._id, this.users[1]._id].sort().join('_') + `_${this.books[2]._id}`;
    this.conversations = [
      {
        _id: '660700000000000000000001',
        conversationId: convId,
        participants: [this.users[0], this.users[1]],
        lastMessage: 'Sounds great! Let’s meet outside the library at 3 PM on Thursday.',
        lastSender: this.users[0]._id,
        book: this.books[2],
        updatedAt: new Date('2026-10-27')
      }
    ];

    this.messages = [
      {
        _id: '660800000000000000000001',
        conversationId: convId,
        sender: this.users[1],
        receiver: this.users[0],
        message: 'Hey Alex! Is Designing Data-Intensive Applications still open for trade?',
        book: this.books[2],
        read: true,
        createdAt: new Date('2026-10-27T10:00:00Z')
      },
      {
        _id: '660800000000000000000002',
        conversationId: convId,
        sender: this.users[0],
        receiver: this.users[1],
        message: 'Yes Samantha! I saw your Algorithms book, looks like a great match.',
        book: this.books[2],
        read: true,
        createdAt: new Date('2026-10-27T10:05:00Z')
      },
      {
        _id: '660800000000000000000003',
        conversationId: convId,
        sender: this.users[1],
        receiver: this.users[0],
        message: 'Awesome. Would Thursday afternoon work for a quick swap?',
        book: this.books[2],
        read: true,
        createdAt: new Date('2026-10-27T10:10:00Z')
      },
      {
        _id: '660800000000000000000004',
        conversationId: convId,
        sender: this.users[0],
        receiver: this.users[1],
        message: 'Sounds great! Let’s meet outside the library at 3 PM on Thursday.',
        book: this.books[2],
        read: false,
        createdAt: new Date('2026-10-27T10:15:00Z')
      }
    ];

    this.communityPosts = [
      {
        _id: '66d000000000000000000001',
        author: this.users[0],
        title: 'Top 5 CS textbooks that actually saved my semester',
        content: 'From CLRS to Clean Code, here is my honest review of which textbooks are worth keeping on your physical shelf versus just borrowing. What are your must-haves?',
        category: 'Discussion',
        tags: ['Computer Science', 'Textbooks', 'StudyTips'],
        likes: [this.users[1]._id],
        likesCount: 1,
        commentsCount: 2,
        createdAt: new Date('2026-10-28T09:00:00Z')
      },
      {
        _id: '66d000000000000000000002',
        author: this.users[1],
        title: 'Looking for study partner for AI / Deep Learning syllabus',
        content: 'Currently working through Goodfellow’s Deep Learning book. Looking for a study group or someone willing to exchange notes and work on PyTorch projects together!',
        category: 'Study Group',
        tags: ['Artificial Intelligence', 'Deep Learning', 'PyTorch'],
        likes: [this.users[0]._id],
        likesCount: 1,
        commentsCount: 1,
        createdAt: new Date('2026-10-29T14:30:00Z')
      }
    ];

    this.comments = [
      {
        _id: '66d100000000000000000001',
        post: '66d000000000000000000001',
        author: this.users[1],
        content: '100% agree on CLRS! I reference it even during technical interview prep.',
        likes: [],
        createdAt: new Date('2026-10-28T10:15:00Z')
      }
    ];

    this.bookClubs = [
      {
        _id: '66d200000000000000000001',
        name: 'Silicon Valley Engineering Readers',
        description: 'A club dedicated to software engineering classics, architecture design, and system architecture literature.',
        category: 'Computer Science',
        creator: this.users[0],
        members: [this.users[0]._id, this.users[1]._id],
        membersCount: 2,
        currentBook: {
          title: 'Designing Data-Intensive Applications',
          author: 'Martin Kleppmann',
          targetDate: new Date('2026-12-15')
        },
        meetingSchedule: 'Bi-weekly on Saturdays at 4:00 PM PST',
        readingGoal: 'Read 6 tech classics this semester',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
        createdAt: new Date('2026-10-20')
      },
      {
        _id: '66d200000000000000000002',
        name: 'The Great Fiction & Classics Circle',
        description: 'Discussing world literature, modern fiction, sci-fi epics, and timeless thought-provoking novels.',
        category: 'Literature',
        creator: this.users[1],
        members: [this.users[1]._id],
        membersCount: 1,
        currentBook: {
          title: 'Project Hail Mary',
          author: 'Andy Weir',
          targetDate: new Date('2026-11-30')
        },
        meetingSchedule: 'Monthly on Sundays at 6:00 PM PST',
        readingGoal: '1 book per month with vibrant open discussions',
        image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
        createdAt: new Date('2026-10-22')
      }
    ];

    this.initialized = true;
  }
}

const fallbackDb = new FallbackDatabase();
module.exports = fallbackDb;
