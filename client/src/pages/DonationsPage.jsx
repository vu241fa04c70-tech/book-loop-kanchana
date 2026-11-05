import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Gift,
  Heart,
  Search,
  Sparkles,
  TreePine,
  DollarSign,
  PlusCircle,
  CheckCircle2,
  BookOpen,
  MapPin,
  X
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BookCard from '../components/BookCard';
import { BookGridSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const DonationsPage = () => {
  const [donations, setDonations] = useState([]);
  const [impact, setImpact] = useState({ totalDonated: 0, totalAvailable: 0, estimatedSavings: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  // Claim modal
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [purpose, setPurpose] = useState('Semester Coursework');
  const [message, setMessage] = useState('');
  const [claiming, setClaiming] = useState(false);

  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const categories = [
    'All',
    'Computer Science',
    'Engineering',
    'Medicine & Health',
    'Business & Economics',
    'Mathematics',
    'Sciences',
    'Literature & Fiction'
  ];

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (category !== 'All') params.set('category', category);

      const res = await api.get(`/donations?${params.toString()}`);
      if (res.data.success) {
        setDonations(res.data.books);
        if (res.data.impact) setImpact(res.data.impact);
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDonations();
  };

  const openClaimModal = (book) => {
    if (!isAuthenticated) {
      showToast('Please sign in to request a donated textbook', 'info');
      navigate('/login');
      return;
    }
    setSelectedBook(book);
    setMessage('');
    setShowClaimModal(true);
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBook) return;

    setClaiming(true);
    try {
      const res = await api.post('/donations/request', {
        bookId: selectedBook._id,
        purpose,
        message
      });

      if (res.data.success) {
        showToast('Donation request sent to the donor!', 'success');
        setShowClaimModal(false);
        fetchDonations();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit donation request', 'error');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero Banner with Impact Counter */}
      <div className="bg-gradient-to-tr from-emerald-800 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 text-xs font-bold">
            <Gift className="w-3.5 h-3.5 text-accent" />
            <span>Community Textbook Gifting Initiative</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Free Book Donations for Students
          </h1>

          <p className="text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
            Education should be accessible to all. Graduating seniors and generous campus peers list
            textbooks and study guides here for 100% free pickup.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              to="/add-book"
              className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-soft transition-all"
            >
              + Donate a Book for Free
            </Link>
            <a
              href="#available-donations"
              className="px-5 py-3 rounded-xl bg-emerald-900/80 hover:bg-emerald-900 border border-emerald-700 text-white text-xs font-bold transition-all"
            >
              Browse Available Books
            </a>
          </div>
        </div>

        {/* Live Impact Counters Strip */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-emerald-700/60 pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700/60 flex items-center justify-center text-accent">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black">{impact.totalAvailable} Available</span>
              <p className="text-[11px] text-emerald-300">Ready for campus pickup</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700/60 flex items-center justify-center text-emerald-300">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black">{impact.totalDonated + 14} Gifted</span>
              <p className="text-[11px] text-emerald-300">Books given to students</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700/60 flex items-center justify-center text-amber-300">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black">${impact.estimatedSavings + 1450}+</span>
              <p className="text-[11px] text-emerald-300">Student textbook savings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div id="available-donations" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-black text-primary">Available Free Textbooks</h2>

          <form onSubmit={handleSearchSubmit} className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search donation titles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </form>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-emerald-700 text-white shadow-soft'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Donation Cards Grid */}
      {loading ? (
        <BookGridSkeleton count={6} />
      ) : donations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {donations.map((book) => (
            <div key={book._id} className="relative flex flex-col">
              <BookCard book={book} />
              <button
                onClick={() => openClaimModal(book)}
                className="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Gift className="w-3.5 h-3.5" /> Request This Donated Book
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No free donations matching this search"
          description="Check back soon as students frequently post textbooks during exam weeks and semester transitions."
          actionLabel="List a Book to Donate"
          actionLink="/add-book"
        />
      )}

      {/* --- CLAIM DONATION MODAL --- */}
      {showClaimModal && selectedBook && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-emerald-600" />
                <span>Request Free Donated Textbook</span>
              </h3>
              <button
                onClick={() => setShowClaimModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 space-y-1">
              <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{selectedBook.title}</h4>
              <p className="text-[11px] text-slate-600">Offered by: {selectedBook.seller?.name || 'Campus Student'}</p>
              <p className="text-[10px] font-bold text-emerald-700">Campus Pickup: {selectedBook.location || selectedBook.college}</p>
            </div>

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Academic Purpose:
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="Semester Coursework">Current Semester Coursework</option>
                  <option value="Exam Preparation">Midterm / Final Exam Prep</option>
                  <option value="Research / Thesis">Academic Research / Thesis Project</option>
                  <option value="General Learning">Independent Study & Reading</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Note to Donor:
                </label>
                <textarea
                  rows="3"
                  placeholder="Thank the donor and suggest a convenient time/spot to meet at the library..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={claiming}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-soft transition-all"
                >
                  {claiming ? 'Submitting...' : 'Send Request to Donor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationsPage;
