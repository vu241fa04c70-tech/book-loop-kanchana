import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  ArrowRight,
  RefreshCw,
  DollarSign,
  ShieldCheck,
  Sparkles,
  TreePine,
  CheckCircle2,
  Users,
  MapPin,
  Gift,
  Star,
  PlusCircle,
  BookX
} from 'lucide-react';
import api from '../services/api';
import BookCard from '../components/BookCard';
import { BookGridSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const LandingPage = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLandingData = async () => {
      setLoading(true);
      try {
        const [featuredRes, recentRes] = await Promise.all([
          api.get('/books?featured=true&limit=8'),
          api.get('/books?limit=12&sort=latest')
        ]);

        if (featuredRes.data.success) {
          // If no specific featured flags are set, take first 4 books as featured
          if (featuredRes.data.books && featuredRes.data.books.length > 0) {
            setFeaturedBooks(featuredRes.data.books);
          } else if (recentRes.data.books && recentRes.data.books.length > 0) {
            setFeaturedBooks(recentRes.data.books.slice(0, 4));
          }
        }

        if (recentRes.data.success) {
          setRecentBooks(recentRes.data.books);
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
    { name: 'Computer Science', icon: '💻', count: 'Algorithms & Systems' },
    { name: 'Programming', icon: '⚡', count: 'Clean Code, Python, Web' },
    { name: 'Data Structures and Algorithms', icon: '🌳', count: 'CLRS, LeetCode, Java' },
    { name: 'Artificial Intelligence', icon: '🤖', count: 'Deep Learning & ML' },
    { name: 'Mathematics', icon: '📐', count: 'Calculus, Linear Algebra' },
    { name: 'Science', icon: '🔬', count: 'Physics, Chemistry, Bio' },
    { name: 'Novels', icon: '📖', count: 'Classic & Modern Fiction' },
    { name: 'Competitive Examination Preparation', icon: '🎯', count: 'GRE, TOEFL, MCAT' }
  ];

  const stats = [
    { label: 'Sample & Student Books', value: '24+', icon: BookOpen },
    { label: 'Estimated Savings', value: '$45,000+', icon: DollarSign },
    { label: 'Successful Swaps', value: '480+', icon: RefreshCw },
    { label: 'Campus Communities', value: '18+', icon: Users }
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'List Your Used Books',
      description: 'Snap a photo, pick your price or choose trade/donation, and list in under 60 seconds.'
    },
    {
      step: '02',
      title: 'Find What You Need',
      description: 'Filter by college, subject, course code, condition, and price to find textbooks nearby.'
    },
    {
      step: '03',
      title: 'Swap or Buy Locally',
      description: 'Chat directly with fellow campus students to agree on an exchange or convenient meetup.'
    },
    {
      step: '04',
      title: 'Save Money & Planet',
      description: 'Cut textbook costs by up to 80% while saving trees and building campus friendships.'
    }
  ];

  const testimonials = [
    {
      name: 'Elena Rostova',
      college: 'UC Berkeley, Class of 2025',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      text: 'I saved over $350 this semester alone by exchanging my Organic Chemistry notes and textbook for Molecular Biology. BookLoop made campus meetups so effortless!',
      rating: 5
    },
    {
      name: 'David Chen',
      college: 'Stanford University, CS Sophomore',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      text: 'Traded my Algorithms textbook for Distributed Systems in 2 days. The exchange request workflow was completely seamless.',
      rating: 5
    },
    {
      name: 'Maya Patel',
      college: 'Columbia University, Economics',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      text: 'I love the free donation section! Graduating seniors donate their prep manuals and literature books to freshmen. An incredible community initiative.',
      rating: 5
    }
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-cream-100/60 via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Campus Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-bold text-primary">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>Smart Student Book Exchange & Marketplace</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-primary tracking-tight leading-[1.15]">
              Give Books a Second Life. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-hover font-serif italic">
                Read More. Spend Less.
              </span>
            </h1>

            {/* Tagline description */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
              Join thousands of college students exchanging, buying, and donating pre-owned course
              textbooks. Keep educational expenses low, reduce paper waste, and share knowledge.
            </p>

            {/* Big Search Bar */}
            <form
              onSubmit={handleHeroSearch}
              className="max-w-2xl mx-auto bg-white p-2 sm:p-2.5 rounded-2xl shadow-soft-lg border border-slate-200/80 flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="flex items-center gap-3 w-full px-3 py-1">
                <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search by title, author, course, or ISBN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-primary hover:bg-primary-light text-white font-bold text-sm transition-all shadow-soft flex items-center justify-center gap-2 flex-shrink-0"
              >
                <span>Find Books</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/explore"
                className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-bold shadow-soft transition-all transform hover:-translate-y-0.5"
              >
                Explore All Books
              </Link>
              <Link
                to="/add-book"
                className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold shadow-xs transition-all"
              >
                + List Your Book Free
              </Link>
              <Link
                to="/donations"
                className="px-6 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-sm font-bold transition-all flex items-center gap-2"
              >
                <Gift className="w-4 h-4 text-emerald-600" />
                <span>Free Donations</span>
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {stats.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-100 shadow-soft text-center flex flex-col items-center justify-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-cream-100 text-accent flex items-center justify-center mb-2">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
                    {item.value}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Popular Academic Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-wider">
              Browse by Subject
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-primary tracking-tight mt-1">
              Popular Academic Categories
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-sm font-bold text-primary hover:text-accent flex items-center gap-1 group"
          >
            <span>View all in catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <Link
              key={i}
              to={`/explore?category=${encodeURIComponent(cat.name)}`}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all text-left flex items-start gap-4 group"
            >
              <div className="text-3xl group-hover:scale-110 transition-transform flex-shrink-0">
                {cat.icon}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                  {cat.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Books Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-md bg-accent/20 text-accent">
                HANDPICKED
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Campus Highlights
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-primary tracking-tight mt-1">
              Featured Books
            </h2>
          </div>
          <Link
            to="/explore?featured=true"
            className="text-sm font-bold text-primary hover:text-accent flex items-center gap-1 group"
          >
            <span>Explore all featured</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <BookGridSkeleton count={4} />
        ) : featuredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredBooks.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No featured books at the moment"
            description="Be the first to list a textbook on your campus!"
            actionLabel="Add Your First Book"
            actionLink="/add-book"
          />
        )}
      </section>

      {/* 4. Recently Added Books Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-wider">
              Fresh From Campus
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-primary tracking-tight mt-1">
              Recently Added Books
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-sm font-bold text-primary hover:text-accent flex items-center gap-1 group"
          >
            <span>See all listings</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <BookGridSkeleton count={8} />
        ) : recentBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recentBooks.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No books available yet"
            description="Start building your campus sharing circle by adding the first textbook."
            actionLabel="Add Your First Book"
            actionLink="/add-book"
          />
        )}
      </section>

      {/* 5. How BookLoop Works */}
      <section id="how-it-works" className="bg-primary text-white py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-accent uppercase tracking-wider">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              How BookLoop Works
            </h2>
            <p className="text-sm text-slate-300">
              Designed by students for students. Trade, buy, or gift textbooks right inside your university campus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, idx) => (
              <div
                key={idx}
                className="bg-primary-light/50 border border-primary-light/80 rounded-2xl p-6 relative flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl font-black text-accent/80 font-serif mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/add-book"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-bold shadow-soft transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List a Book Now</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Benefits of Exchanging Books */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold text-accent uppercase tracking-wider">
              Why Choose BookLoop
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-primary tracking-tight leading-tight">
              Smarter Than Traditional Bookstores, <br />
              Kinder to Your Student Budget.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              University bookstore buybacks typically offer less than 15% of the original textbook
              cost, only to resell it at an 80% markup. BookLoop eliminates the predatory middleman
              and lets students deal directly with each other.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Drastically Lower Textbook Bills</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Swap books 1-to-1 for zero dollars, or purchase at fair second-hand student prices.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TreePine className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Eco-Friendly & Sustainable</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Every reused textbook saves approximately 30 liters of water and prevents tree harvesting.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Safe Campus Connections</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Meet directly at your campus library or student center — no shipping fees or waiting for delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Showcase Card */}
          <div className="bg-gradient-to-tr from-cream-200 to-cream-50 p-8 rounded-3xl border border-cream-200 shadow-soft space-y-6">
            <div className="flex items-center justify-between border-b border-amber-200/60 pb-4">
              <span className="text-xs font-bold text-amber-900 uppercase">BookLoop Impact Metric</span>
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Live Data
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Average Student Savings per Year</p>
                  <p className="text-2xl font-black text-primary mt-0.5">$680.00</p>
                </div>
                <div className="text-2xl">💰</div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Trees Saved From Textbook Reuse</p>
                  <p className="text-2xl font-black text-emerald-600 mt-0.5">240+ Trees</p>
                </div>
                <div className="text-2xl">🌲</div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Free Book Donations Gifted</p>
                  <p className="text-2xl font-black text-accent mt-0.5">180+ Books</p>
                </div>
                <div className="text-2xl">🎁</div>
              </div>
            </div>

            <Link
              to="/donations"
              className="w-full py-3 rounded-xl bg-primary text-white text-xs font-bold text-center block hover:bg-primary-light transition-colors"
            >
              Explore Free Student Donations →
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Student Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-accent uppercase tracking-wider">
            Voices From Campus
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-primary tracking-tight mt-1">
            Loved by Students Across Universities
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed">
                  "{t.text}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-100">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{t.name}</h4>
                  <p className="text-[11px] text-slate-400">{t.college}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Call To Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary to-primary-light rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-bold text-accent uppercase tracking-widest">
              Join The Student Circle
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Have books sitting on your shelf? <br />
              Turn them into cash or your next textbook.
            </h2>
            <p className="text-sm text-slate-300">
              List in under a minute. Connect with fellow students at your university and start swapping today.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Link
                to="/add-book"
                className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-bold shadow-soft transition-all"
              >
                List a Book Now
              </Link>
              <Link
                to="/explore"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold transition-all"
              >
                Browse Books
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
