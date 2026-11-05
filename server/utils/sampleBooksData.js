// 24+ Realistic Sample Book Records across all required categories
const sampleBooks = [
  // --- Category: Computer Science ---
  {
    title: 'Operating System Concepts (10th Edition)',
    author: 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne',
    ISBN: '978-1119456339',
    description: 'The tenth edition of Operating System Concepts (the classic dinosaur book). Covers virtualization, distributed storage, process synchronization, security, and Linux/Windows internal architectures. Crisp pages with zero writing.',
    category: 'Computer Science',
    subject: 'Operating Systems',
    condition: 'Like New',
    price: 42,
    originalPrice: 95,
    images: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
    ],
    listingType: 'Sell',
    sellerEmail: 'alex@student.edu',
    college: 'Stanford University',
    location: 'Gates Computer Science Building, Palo Alto',
    availability: 'available',
    featured: true,
    viewsCount: 168,
    isSample: true
  },
  {
    title: 'Computer Systems: A Programmer\'s Perspective (3rd Edition)',
    author: 'Randal E. Bryant, David R. O\'Hallaron',
    ISBN: '978-0134092669',
    description: 'The renowned CS:APP textbook explaining machine-level code representations, processor architecture, cache memories, virtual memory, and system-level I/O. Essential for systems programming courses.',
    category: 'Computer Science',
    subject: 'Computer Architecture & Systems',
    condition: 'Good',
    price: 48,
    originalPrice: 140,
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
    ],
    listingType: 'Sell',
    sellerEmail: 'alex@student.edu',
    college: 'Stanford University',
    location: 'Huang Engineering Center',
    availability: 'available',
    featured: true,
    viewsCount: 140,
    isSample: true
  },
  {
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    ISBN: '978-1449373320',
    description: 'The definitive handbook for modern backend systems. Deep dives into storage engines, distributed consensus, transactions, batch pipelines, and stream processing.',
    category: 'Computer Science',
    subject: 'Distributed Systems',
    condition: 'Like New',
    price: 28,
    originalPrice: 55,
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80'
    ],
    listingType: 'Exchange',
    sellerEmail: 'alex@student.edu',
    college: 'Stanford University',
    location: 'Tressider Memorial Union',
    availability: 'available',
    featured: true,
    viewsCount: 195,
    isSample: true
  },

  // --- Category: Programming ---
  {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin (Uncle Bob)',
    ISBN: '978-0132350884',
    description: 'Best-selling classic on producing readable, robust, and maintainable software. Covers meaningful naming, modular functions, formatting, exception handling, and code smell analysis with practical case studies.',
    category: 'Programming',
    subject: 'Software Engineering & Craftsmanship',
    condition: 'Like New',
    price: 24,
    originalPrice: 50,
    images: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'
    ],
    listingType: 'Sell',
    sellerEmail: 'alex@student.edu',
    college: 'Stanford University',
    location: 'Packard Electrical Engineering',
    availability: 'available',
    featured: true,
    viewsCount: 220,
    isSample: true
  },
  {
    title: 'The Pragmatic Programmer: Your Journey to Mastery (20th Anniversary)',
    author: 'David Thomas, Andrew Hunt',
    ISBN: '978-0135957059',
    description: 'Illustrates the core philosophies of software engineering: orthogonal code, tracer bullets, refactoring, defensive coding, and continuous career learning. In pristine condition.',
    category: 'Programming',
    subject: 'Software Engineering',
    condition: 'Like New',
    price: 26,
    originalPrice: 55,
    images: [
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80'
    ],
    listingType: 'Exchange',
    sellerEmail: 'samantha@student.edu',
    college: 'UC Berkeley',
    location: 'Moffitt Library Cafe',
    availability: 'available',
    featured: false,
    viewsCount: 110,
    isSample: true
  },
  {
    title: 'Fluent Python: Clear, Concise, and Effective Programming',
    author: 'Luciano Ramalho',
    ISBN: '978-1492056355',
    description: 'Hands-on guide to idiomatic Python 3. Covers data structures, functions as objects, object-oriented idioms, control flow, metaprogramming, and asyncio concurrency.',
    category: 'Programming',
    subject: 'Python Development',
    condition: 'Good',
    price: 32,
    originalPrice: 65,
    images: [
      'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80'
    ],
    listingType: 'Sell',
    sellerEmail: 'marcus@student.edu',
    college: 'Columbia University',
    location: 'Butler Library',
    availability: 'available',
    featured: false,
    viewsCount: 94,
    isSample: true
  },

  // --- Category: Data Structures and Algorithms ---
  {
    title: 'Introduction to Algorithms (CLRS 4th Edition)',
    author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
    ISBN: '978-0262046305',
    description: 'The international gold standard in algorithm study. Rigorous mathematical proofs, dynamic programming, greedy algorithms, graph search, maximum flow, and multithreaded algorithms. Clean interior.',
    category: 'Data Structures and Algorithms',
    subject: 'Algorithms & Complexity',
    condition: 'Like New',
    price: 52,
    originalPrice: 130,
    images: [
      'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=800&q=80'
    ],
    listingType: 'Sell',
    sellerEmail: 'alex@student.edu',
    college: 'Stanford University',
    location: 'Gates Computer Science Building',
    availability: 'available',
    featured: true,
    viewsCount: 310,
    isSample: true
  },
  {
    title: 'Cracking the Coding Interview: 189 Programming Questions & Solutions',
    author: 'Gayle Laakmann McDowell',
    ISBN: '978-0984782857',
    description: 'Indispensable preparation text for FAANG and campus software engineering tech interviews. Covers big-O time complexity, tree traversals, dynamic programming, and systems design.',
    category: 'Data Structures and Algorithms',
    subject: 'Technical Interview Prep',
    condition: 'Good',
    price: 22,
    originalPrice: 45,
    images: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'
    ],
    listingType: 'Exchange',
    sellerEmail: 'samantha@student.edu',
    college: 'UC Berkeley',
    location: 'Hearst Memorial Mining Building',
    availability: 'available',
    featured: true,
    viewsCount: 260,
    isSample: true
  },
  {
    title: 'Algorithms (4th Edition)',
    author: 'Robert Sedgewick, Kevin Wayne',
    ISBN: '978-0321573513',
    description: 'Surveys the most important computer algorithms in use today. Full Java implementations of sorting, searching, graph processing, and string processing. Giving away for free donation to support a peer!',
    category: 'Data Structures and Algorithms',
    subject: 'Computer Algorithms',
    condition: 'Fair',
    price: 0,
    originalPrice: 85,
    images: [
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80'
    ],
    listingType: 'Donate',
    sellerEmail: 'alex@student.edu',
    college: 'Stanford University',
    location: 'Green Library Rotunda',
    availability: 'available',
    featured: false,
    viewsCount: 180,
    isSample: true
  },

  // --- Category: Artificial Intelligence ---
  {
    title: 'Artificial Intelligence: A Modern Approach (4th Edition)',
    author: 'Stuart Russell, Peter Norvig',
    ISBN: '978-0134610993',
    description: 'The universally adopted university standard in AI. Comprehensive exploration of intelligent agent architectures, search algorithms, probabilistic reasoning, reinforcement learning, NLP, and ethics.',
    category: 'Artificial Intelligence',
    subject: 'AI & Autonomous Agents',
    condition: 'Like New',
    price: 60,
    originalPrice: 160,
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
    ],
    listingType: 'Sell',
    sellerEmail: 'alex@student.edu',
    college: 'Stanford University',
    location: 'Gates CS Building',
    availability: 'available',
    featured: true,
    viewsCount: 290,
    isSample: true
  },
  {
    title: 'Deep Learning (Adaptive Computation and Machine Learning)',
    author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
    ISBN: '978-0262035613',
    description: 'Written by pioneers in deep learning. Mathematical foundation covering applied math, convolutional networks, sequence modeling with RNNs/transformers, autoencoders, and generative models.',
    category: 'Artificial Intelligence',
    subject: 'Neural Networks & Deep Learning',
    condition: 'Like New',
    price: 45,
    originalPrice: 90,
    images: [
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80'
    ],
    listingType: 'Exchange',
    sellerEmail: 'samantha@student.edu',
    college: 'UC Berkeley',
    location: 'Soda Hall, Computer Science Dept',
    availability: 'available',
    featured: true,
    viewsCount: 235,
    isSample: true
  },
  {
    title: 'Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow (3rd Edition)',
    author: 'Aurélien Géron',
    ISBN: '978-1098125974',
    description: 'Concrete examples, minimal theory, and production-ready Python code for training deep neural nets, computer vision models, and natural language transformers.',
    category: 'Artificial Intelligence',
    subject: 'Applied Machine Learning',
    condition: 'Good',
    price: 35,
    originalPrice: 75,
    images: [
      'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=800&q=80'
    ],
    listingType: 'Sell',
    sellerEmail: 'marcus@student.edu',
    college: 'Columbia University',
    location: 'Morningside Campus Library',
    availability: 'available',
    featured: false,
    viewsCount: 145,
    isSample: true
  },

  // --- Category: Mathematics ---
  {
    title: 'Calculus: Early Transcendentals (9th Edition)',
    author: 'James Stewart, Daniel K. Clegg, Saleem Watson',
    ISBN: '978-1337613927',
    description: 'Comprehensive college single and multivariable calculus textbook. Features real-world modeling problems, vector calculus, parametric equations, and infinite series.',
    category: 'Mathematics',
    subject: 'Calculus I, II, & III',
    condition: 'Good',
    price: 38,
    originalPrice: 120,
    images: [
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80'
    ],
    listingType: 'Sell',
    sellerEmail: 'samantha@student.edu',
    college: 'UC Berkeley',
    location: 'Evans Hall / Math Building',
    availability: 'available',
    featured: true,
    viewsCount: 175,
    isSample: true
  },
  {
    title: 'Linear Algebra and Its Applications (5th Edition)',
    author: 'David C. Lay, Steven R. Lay, Judi J. McDonald',
    ISBN: '978-0321982384',
    description: 'Fundamental linear algebra: vector spaces, matrix factorizations, eigenvalues and eigenvectors, singular value decomposition, and geometric transformations.',
    category: 'Mathematics',
    subject: 'Linear Algebra',
    condition: 'Like New',
    price: 30,
    originalPrice: 95,
    images: [
      'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=800&q=80'
    ],
    listingType: 'Exchange',
    sellerEmail: 'marcus@student.edu',
    college: 'Columbia University',
    location: 'Uris Hall Center',
    availability: 'available',
    featured: false,
    viewsCount: 112,
    isSample: true
  },
  {
    title: 'Introduction to Probability (2nd Edition)',
    author: 'Dimitri P. Bertsekas, John N. Tsitsiklis',
    ISBN: '978-1886529236',
    description: 'Standard textbook for MIT undergraduate probability courses. Intuitive explanations of discrete and continuous random variables, Bayes theorem, limit theorems, and Markov chains. Free donation!',
    category: 'Mathematics',
    subject: 'Probability & Stochastic Models',
    condition: 'Fair',
    price: 0,
    originalPrice: 70,
    images: [
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80'
    ],
    listingType: 'Donate',
    sellerEmail: 'alex@student.edu',
    college: 'Stanford University',
    location: 'Tressider Union Entrance',
    availability: 'available',
    featured: false,
    viewsCount: 130,
    isSample: true
  },

  // --- Category: Science ---
  {
    title: 'University Physics with Modern Physics (15th Edition)',
    author: 'Hugh D. Young, Roger A. Freedman',
    ISBN: '978-0135159552',
    description: 'Classic textbook in university physics. Covers classical mechanics, thermal physics, electromagnetism, wave optics, relativity, and quantum mechanics with worked calculus examples.',
    category: 'Science',
    subject: 'General Physics I & II',
    condition: 'Good',
    price: 50,
    originalPrice: 155,
    images: [
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80'
    ],
    listingType: 'Sell',
    sellerEmail: 'samantha@student.edu',
    college: 'UC Berkeley',
    location: 'LeConte Hall / Physics Quad',
    availability: 'available',
    featured: true,
    viewsCount: 140,
    isSample: true
  },
  {
    title: 'Organic Chemistry (8th Edition)',
    author: 'Paula Yurkanis Bruice',
    ISBN: '978-0134042282',
    description: 'Focuses on reaction mechanisms, electron flow, retrosynthetic analysis, and NMR spectroscopy. Illustrated in full color with problem-solving strategy breakdowns.',
    category: 'Science',
    subject: 'Organic Chemistry',
    condition: 'Like New',
    price: 45,
    originalPrice: 140,
    images: [
      'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?auto=format&fit=crop&w=800&q=80'
    ],
    listingType: 'Exchange',
    sellerEmail: 'samantha@student.edu',
    college: 'UC Berkeley',
    location: 'Valley Life Sciences Building',
    availability: 'available',
    featured: false,
    viewsCount: 98,
    isSample: true
  },
  {
    title: 'Campbell Biology (12th Edition)',
    author: 'Lisa A. Urry, Michael L. Cain, Steven A. Wasserman',
    ISBN: '978-0135188743',
    description: 'Unmatched introductory biology manual covering genetics, cell communication, evolutionary mechanisms, and plant/animal physiology. Offering as a free donation to assist first-year biology majors!',
    category: 'Science',
    subject: 'Introductory Biology',
    condition: 'Good',
    price: 0,
    originalPrice: 160,
    images: [
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80'
    ],
    listingType: 'Donate',
    sellerEmail: 'samantha@student.edu',
    college: 'UC Berkeley',
    location: 'Moffitt Undergraduate Library',
    availability: 'available',
    featured: false,
    viewsCount: 215,
    isSample: true
  },

  // --- Category: Novels ---
  {
    title: 'To Kill a Mockingbird (Perennial Modern Classics)',
    author: 'Harper Lee',
    ISBN: '978-0060935467',
    description: 'Harper Lee\'s Pulitzer Prize-winning masterpiece exploring empathy, racism, morality, and justice in the deep South. Required reading for university literature and ethics courses.',
    category: 'Novels',
    subject: 'American Literature',
    condition: 'Like New',
    price: 8,
    originalPrice: 18,
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
    ],
    listingType: 'Sell',
    sellerEmail: 'marcus@student.edu',
    college: 'Columbia University',
    location: 'Butler Library Steps',
    availability: 'available',
    featured: false,
    viewsCount: 75,
    isSample: true
  },
  {
    title: '1984 (Signet Classic Edition)',
    author: 'George Orwell',
    ISBN: '978-0451524935',
    description: 'George Orwell\'s seminal dystopian masterpiece exploring totalitarianism, surveillance states, doublethink, and bureaucratic control. Crisp paperback edition in clean condition.',
    category: 'Novels',
    subject: 'World Literature & Dystopian Fiction',
    condition: 'Like New',
    price: 9,
    originalPrice: 19,
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80'
    ],
    listingType: 'Exchange',
    sellerEmail: 'marcus@student.edu',
    college: 'Columbia University',
    location: 'College Walk / Low Memorial Library',
    availability: 'available',
    featured: true,
    viewsCount: 160,
    isSample: true
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    ISBN: '978-0743273565',
    description: 'The defining narrative of the Jazz Age, roaring twenties, and the tragic illusion of the American Dream. Giving away for free donation to fellow literature lovers on campus!',
    category: 'Novels',
    subject: '20th Century Fiction',
    condition: 'Good',
    price: 0,
    originalPrice: 16,
    images: [
      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=800&q=80'
    ],
    listingType: 'Donate',
    sellerEmail: 'marcus@student.edu',
    college: 'Columbia University',
    location: 'Philosophy Hall Courtyard',
    availability: 'available',
    featured: false,
    viewsCount: 120,
    isSample: true
  },

  // --- Category: Competitive Examination Preparation ---
  {
    title: 'Official GRE Super Power Pack (3 Books in 1)',
    author: 'Educational Testing Service (ETS)',
    ISBN: '978-1259862410',
    description: 'Official test preparation package straight from ETS (creators of the actual GRE). Includes Official Guide, Quantitative Reasoning Practice, and Verbal Reasoning Practice with real questions and simulated computer test problems.',
    category: 'Competitive Examination Preparation',
    subject: 'GRE Graduate Admissions',
    condition: 'Like New',
    price: 28,
    originalPrice: 75,
    images: [
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80'
    ],
    listingType: 'Sell',
    sellerEmail: 'alex@student.edu',
    college: 'Stanford University',
    location: 'Green Library Study Rooms',
    availability: 'available',
    featured: true,
    viewsCount: 240,
    isSample: true
  },
  {
    title: 'The Official Guide to the TOEFL iBT Test (6th Edition)',
    author: 'Educational Testing Service (ETS)',
    ISBN: '978-1260470352',
    description: 'Comprehensive study companion for international students preparing for university admissions. Includes 4 real full-length authentic practice tests, audio transcript exercises, and scoring rubrics.',
    category: 'Competitive Examination Preparation',
    subject: 'TOEFL iBT Language Proficiency',
    condition: 'Good',
    price: 18,
    originalPrice: 40,
    images: [
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80'
    ],
    listingType: 'Exchange',
    sellerEmail: 'samantha@student.edu',
    college: 'UC Berkeley',
    location: 'International House Berkeley',
    availability: 'available',
    featured: false,
    viewsCount: 135,
    isSample: true
  },
  {
    title: 'MCAT Complete 7-Book Subject Review Boxed Set',
    author: 'Kaplan Test Prep',
    ISBN: '978-1506248868',
    description: 'Exhaustive medical school admissions preparation manuals: Behavioral Sciences, Biochemistry, Biology, General Chemistry, Organic Chemistry, Physics, and Critical Analysis. Free donation for pre-med peers!',
    category: 'Competitive Examination Preparation',
    subject: 'MCAT Medical Admissions',
    condition: 'Fair',
    price: 0,
    originalPrice: 180,
    images: [
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80'
    ],
    listingType: 'Donate',
    sellerEmail: 'samantha@student.edu',
    college: 'UC Berkeley',
    location: 'Valley Life Sciences Building',
    availability: 'available',
    featured: true,
    viewsCount: 295,
    isSample: true
  }
];

module.exports = sampleBooks;
