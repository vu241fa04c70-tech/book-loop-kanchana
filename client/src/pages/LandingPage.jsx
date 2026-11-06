import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  ArrowRight,
  ArrowRightLeft,
  DollarSign,
  Gift,
  PlusCircle,
  Sparkles,
  TreePine,
  CheckCircle2,
  Users,
  MapPin,
  Star,
  ShieldCheck,
  ChevronRight,
  HeartHandshake,
  GraduationCap
} from 'lucide-react';
import api from '../services/api';
import BookCard from '../components/BookCard';
import { BookGridSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const LandingPage = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [bookClubs, setBookClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLandingData = async () => {
      setLoading(true);
      try {
        const [featuredRes, recentRes, recsRes, postsRes, clubsRes] = await Promise.all([
          api.get('/books?featured=true&limit=8').catch(() => ({ data: { success: false } })),
          api.get('/books?limit=8&sort=latest').catch(() => ({ data: { success: false } })),
          api.get('/books/recommendations?limit=4').catch(() => ({ data: { success: false } })),
          api.get('/community/posts?limit=3').catch(() => ({ data: { success: false } })),
          api.get('/book-clubs').catch(() => ({ data: { success: false } }))
        ]);

        if (featuredRes.data?.success) {
          if (featuredRes.data.books && featuredRes.data.books.length > 0) {
            setFeaturedBooks(featuredRes.data.books);
          } else if (recentRes.data?.books && recentRes.data.books.length > 0) {
            setFeaturedBooks(recentRes.data.books.slice(0, 4));
          }
        }

        if (recentRes.data?.success) {
          setRecentBooks(recentRes.data.books || []);
        }

        if (recsRes.data?.success) {
          setRecommendations(recsRes.data.books || []);
        }

        if (postsRes.data?.success) {
          setCommunityPosts(postsRes.data.posts || []);
        }

        if (clubsRes.data?.success) {
          setBookClubs(clubsRes.data.clubs?.slice(0, 2) || []);
        }
      } catch (err) {
        console.error('Error fetching landing page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const categories = [
    {
      name: 'Programming',
      query: 'Programming',
      icon: '💻',
      desc: 'Python, Clean Code & Web Dev'
    },
    {
      name: 'Computer Science',
      query: 'Computer Science',
      icon: '⚡',
      desc: 'Operating Systems & Networks'
    },
    {
      name: 'Data Structures',
      query: 'Data Structures and Algorithms',
      icon: '🌳',
      desc: 'CLRS, LeetCode & Algorithms'
    },
    {
      name: 'Artificial Intelligence',
      query: 'Artificial Intelligence',
      icon: '🤖',
      desc: 'Machine Learning & Deep Learning'
    },
    {
      name: 'Mathematics',
      query: 'Mathematics',
      icon: '📐',
      desc: 'Calculus & Linear Algebra'
    },
    {
      name: 'Science',
      query: 'Science',
      icon: '🔬',
      desc: 'Physics, Chemistry & Biology'
    },
    {
      name: 'Novels',
      query: 'Novels',
      icon: '📖',
      desc: 'Classic & Modern Literature'
    },
    {
      name: 'Competitive Exams',
      query: 'Competitive Examination Preparation',
      icon: '🎯',
      desc: 'GRE, GMAT, MCAT & SAT'
    }
  ];

  const whyBookLoop = [
    {
      icon: DollarSign,
      title: 'Save Money',
      description: 'Get required course textbooks for up to 80% less than new bookstore retail prices.'
    },
    {
      icon: ArrowRightLeft,
      title: 'Exchange Knowledge',
      description: 'Swap textbooks you have finished with classmates who have the books you need next.'
    },
    {
      icon: TreePine,
      title: 'Reduce Book Waste',
      description: 'Give physical books a continuous second life and minimize paper and environmental waste.'
    },
    {
      icon: Users,
      title: 'Connect with Students',
      description: 'Meet verified peers across your campus library and build a helpful learning community.'
    }
  ];

  const testimonials = [
    {
      name: 'Samantha Lee',
      college: 'UC Berkeley, Class of 2026',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      text: 'I traded my Organic Chemistry book for Campbell Biology in less than 24 hours. The exchange process is straightforward and zero hassle!',
      rating: 5
    },
    {
      name: 'Alex Rivera',
      college: 'Stanford University, CS Major',
      image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      text: 'Finding affordable algorithms textbooks on campus used to be frustrating. BookLoop connected me with a senior selling CLRS in like-new condition.',
      rating: 5
    },
    {
      name: 'Marcus Johnson',
      college: 'Columbia University, Economics',
      image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
      text: 'The free book donation section is incredible. Senior students pass down their MCAT and GRE study sets to juniors at no cost.',
      rating: 5
    }
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-cream-100/70 via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Campus Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-bold text-primary">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>Campus Book Exchange & Student Marketplace</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-primary tracking-tight leading-[1.15]">
              Every Book Deserves <br />
              <span className="text-accent underline decoration-cream-200 underline-offset-8">
                Another Reader.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Buy affordable used textbooks, trade books with classmates, discover peer reading clubs, and build a sustainable campus library.
            </p>

            {/* Prominent Search Bar */}
            <form onSubmit={handleHeroSearch} className="relative max-w-2xl mx-auto pt-2">
              <div className="relative flex items-center shadow-soft-lg rounded-2xl bg-white border border-slate-200 overflow-hidden focus-within:ring-4 focus-within:ring-accent/30 focus-within:border-accent transition-all">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by title, author, ISBN, course, or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-32 py-4 text-sm sm:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-soft"
                >
                  Find Books
                </button>
              </div>
            </form>

            {/* Quick Campus Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 font-semibold mr-1">Trending Campuses:</span>
              {['Stanford', 'UC Berkeley', 'Columbia', 'MIT', 'All Campuses'].map((campus) => (
                <button
                  key={campus}
                  type="button"
                  onClick={() =>
                    navigate(campus === 'All Campuses' ? '/explore' : `/explore?college=${encodeURIComponent(campus)}`)
                  }
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-cream-100 text-slate-600 hover:text-navy border border-slate-200 font-medium transition-colors"
                >
                  {campus}
                </button>
              ))}
            </div>

            {/* Three Large Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-3">
              <Link
                to="/explore"
                className="px-6 py-3.5 rounded-2xl bg-primary hover:bg-primary-light text-white font-bold text-sm shadow-soft hover:shadow-soft-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-accent" />
                <span>Find a Book</span>
              </Link>
              <Link
                to="/add-book"
                className="px-6 py-3.5 rounded-2xl bg-accent hover:bg-accent-hover text-white font-bold text-sm shadow-soft hover:shadow-soft-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Sell Your Book</span>
              </Link>
              <Link
                to="/exchange"
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-cream-50 text-primary border border-slate-200 font-bold text-sm shadow-soft hover:shadow-soft-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                <span>Exchange Books</span>
              </Link>
            </div>

            {/* Quick Hero Banner Proof */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Zero Listing Fees
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" /> Verified Student Accounts
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-accent" /> Convenient Campus Meetups
              </span>
            </div>
          </div>
        </div>

        {/* Ambient Decorative Background elements */}
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-accent/15 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* 2. How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-slate-100 shadow-soft space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-accent">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              How BookLoop Works
            </h2>
            <p className="text-sm text-slate-600">
              No complicated steps. Anyone can buy, trade, or share books in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-cream-50/60 border border-cream-200/50 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary text-accent flex items-center justify-center shadow-soft">
                <Search className="w-8 h-8" />
              </div>
              <span className="text-xs font-black uppercase text-accent tracking-wider">
                STEP 1 – FIND A BOOK
              </span>
              <h3 className="text-xl font-bold text-slate-900">Search Books You Love</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                "Search for books you love or need." Explore textbooks, study guides, and novels listed by fellow campus peers.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-cream-50/60 border border-cream-200/50 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-accent text-white flex items-center justify-center shadow-soft">
                <ArrowRightLeft className="w-8 h-8" />
              </div>
              <span className="text-xs font-black uppercase text-primary tracking-wider">
                STEP 2 – CHOOSE YOUR OPTION
              </span>
              <h3 className="text-xl font-bold text-slate-900">Buy, Swap, or Request Free</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                "Buy it, exchange it, or request a free donated book." Choose whatever fits your budget and study needs best.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-cream-50/60 border border-cream-200/50 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-light text-white flex items-center justify-center shadow-soft">
                <HeartHandshake className="w-8 h-8 text-accent" />
              </div>
              <span className="text-xs font-black uppercase text-accent tracking-wider">
                STEP 3 – CONNECT AND READ
              </span>
              <h3 className="text-xl font-bold text-slate-900">Connect with the Owner</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                "Connect with the owner and get your book." Chat safely, coordinate a campus library meetup, and enjoy reading!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6B. Community Circles & Campus Reading Clubs Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Peer Circles & Discussions
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Campus Readers & Clubs
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Connect with fellow students reading course classics, novels, and study guides.
            </p>
          </div>
          <Link
            to="/community"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-accent transition-colors"
          >
            <span>Visit Community Hub</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Discussions Column */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" /> Trending Campus Discussions
            </h3>
            {communityPosts.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                Join our first discussion on textbooks, recommendations, and study guides!
              </div>
            ) : (
              communityPosts.slice(0, 3).map((post) => (
                <div
                  key={post._id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-accent uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded">
                      {post.category}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{post.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {post.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="font-medium text-slate-700">By {post.author?.name || 'Reader'}</span>
                    <Link to="/community" className="text-primary hover:text-accent font-semibold flex items-center gap-1">
                      Join Topic <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Book Clubs Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" /> Active Reading Clubs
            </h3>
            {bookClubs.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                No active reading clubs yet. Create one today!
              </div>
            ) : (
              bookClubs.slice(0, 2).map((club) => (
                <div
                  key={club._id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{club.name}</h4>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                      {club.membersCount || club.members?.length || 1} members
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{club.description}</p>
                  {club.currentBook?.title && (
                    <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-700 border border-slate-200/50">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Read:</span>
                      <span className="font-semibold text-slate-900">{club.currentBook.title}</span>
                    </div>
                  )}
                  <Link
                    to="/community"
                    className="block text-center bg-navy hover:bg-navy/90 text-white text-xs font-bold py-2 rounded-xl transition-colors"
                  >
                    View Club Details
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 3. Featured Books Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent">
              Editor's Handpicked Selection
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Popular Books for You
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Top-rated textbooks and popular reads available on campus right now.
            </p>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-accent transition-colors"
          >
            <span>See All Books</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <BookGridSkeleton count={4} />
        ) : featuredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBooks.slice(0, 4).map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No featured books right now"
            message="Check back soon or explore our freshly added catalog!"
            actionText="Explore All Books"
            actionLink="/explore"
          />
        )}
      </section>

      {/* 3B. Recommended Books for You Section */}
      {recommendations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Personalized Picks
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Recommended For You
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Based on trending coursework and peer reader engagement.
              </p>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-accent transition-colors"
            >
              <span>Explore Personalized</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        </section>
      )}

      {/* 4. Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            Curated Collections
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Browse by Category
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Click any category to instantly explore matched textbooks and literature.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/explore?category=${encodeURIComponent(cat.query)}`}
              className="group p-5 rounded-2xl bg-white border border-slate-100 shadow-soft hover:shadow-card-hover hover:border-accent/40 transition-all duration-300 flex flex-col items-center text-center space-y-2"
            >
              <div className="w-14 h-14 rounded-2xl bg-cream-50 group-hover:bg-accent/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                {cat.icon}
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-primary transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-1">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Recently Added Books Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Live Campus Listings
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Freshly Added Books
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Newly uploaded books by students and campus community members.
            </p>
          </div>
          <Link
            to="/explore?sort=latest"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-accent transition-colors"
          >
            <span>View Latest Additions</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <BookGridSkeleton count={8} />
        ) : recentBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentBooks.slice(0, 8).map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No books available yet"
            message="No books available yet. Be the first to share a book with the community!"
            actionText="List Your Book"
            actionLink="/add-book"
          />
        )}
      </section>

      {/* 6. Why BookLoop Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-8 sm:p-14 text-white shadow-soft-lg space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-accent">
              Our Student-First Mission
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Why BookLoop?
            </h2>
            <p className="text-slate-300 text-sm">
              Built by students, for students. Here is how BookLoop makes campus life better.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyBookLoop.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-3 hover:bg-white/10 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent text-white flex items-center justify-center font-bold shadow-soft">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6B. Community Circles & Campus Reading Clubs Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Peer Circles & Discussions
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Campus Readers & Clubs
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Connect with fellow students reading course classics, novels, and study guides.
            </p>
          </div>
          <Link
            to="/community"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-accent transition-colors"
          >
            <span>Visit Community Hub</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Discussions Column */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" /> Trending Campus Discussions
            </h3>
            {communityPosts.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                Join our first discussion on textbooks, recommendations, and study guides!
              </div>
            ) : (
              communityPosts.slice(0, 3).map((post) => (
                <div
                  key={post._id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-accent uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded">
                      {post.category}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{post.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {post.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="font-medium text-slate-700">By {post.author?.name || 'Reader'}</span>
                    <Link to="/community" className="text-primary hover:text-accent font-semibold flex items-center gap-1">
                      Join Topic <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Book Clubs Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" /> Active Reading Clubs
            </h3>
            {bookClubs.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                No active reading clubs yet. Create one today!
              </div>
            ) : (
              bookClubs.slice(0, 2).map((club) => (
                <div
                  key={club._id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{club.name}</h4>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                      {club.membersCount || club.members?.length || 1} members
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{club.description}</p>
                  {club.currentBook?.title && (
                    <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-700 border border-slate-200/50">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Read:</span>
                      <span className="font-semibold text-slate-900">{club.currentBook.title}</span>
                    </div>
                  )}
                  <Link
                    to="/community"
                    className="block text-center bg-navy hover:bg-navy/90 text-white text-xs font-bold py-2 rounded-xl transition-colors"
                  >
                    View Club Details
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 7. Community Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            Student Stories
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Loved by Campus Book Swappers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                  "{t.text}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h5 className="font-bold text-xs sm:text-sm text-slate-900">{t.name}</h5>
                  <p className="text-[11px] text-slate-500">{t.college}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-cream-100 border border-cream-200 rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black text-primary tracking-tight">
            Ready to Give Your Books a Second Life?
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Join thousands of college students exchanging, selling, and donating textbooks today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/add-book"
              className="px-6 py-3 rounded-2xl bg-accent hover:bg-accent-hover text-white text-sm font-bold shadow-soft transition-all"
            >
              Sell or Share a Book Now
            </Link>
            <Link
              to="/explore"
              className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 text-sm font-bold hover:bg-slate-50 transition-all"
            >
              Explore Available Books
            </Link>
          </div>
        </div>
      </section>

      {/* 6B. Community Circles & Campus Reading Clubs Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Peer Circles & Discussions
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Campus Readers & Clubs
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Connect with fellow students reading course classics, novels, and study guides.
            </p>
          </div>
          <Link
            to="/community"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-accent transition-colors"
          >
            <span>Visit Community Hub</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Discussions Column */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" /> Trending Campus Discussions
            </h3>
            {communityPosts.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                Join our first discussion on textbooks, recommendations, and study guides!
              </div>
            ) : (
              communityPosts.slice(0, 3).map((post) => (
                <div
                  key={post._id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-accent uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded">
                      {post.category}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{post.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {post.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="font-medium text-slate-700">By {post.author?.name || 'Reader'}</span>
                    <Link to="/community" className="text-primary hover:text-accent font-semibold flex items-center gap-1">
                      Join Topic <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Book Clubs Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" /> Active Reading Clubs
            </h3>
            {bookClubs.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                No active reading clubs yet. Create one today!
              </div>
            ) : (
              bookClubs.slice(0, 2).map((club) => (
                <div
                  key={club._id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{club.name}</h4>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                      {club.membersCount || club.members?.length || 1} members
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{club.description}</p>
                  {club.currentBook?.title && (
                    <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-700 border border-slate-200/50">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Read:</span>
                      <span className="font-semibold text-slate-900">{club.currentBook.title}</span>
                    </div>
                  )}
                  <Link
                    to="/community"
                    className="block text-center bg-navy hover:bg-navy/90 text-white text-xs font-bold py-2 rounded-xl transition-colors"
                  >
                    View Club Details
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
