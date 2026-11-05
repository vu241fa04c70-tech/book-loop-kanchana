import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRightLeft,
  Search,
  BookOpen,
  MapPin,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
  PlusCircle,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Send,
  X
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BookGridSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const ExchangePage = () => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Exchange books browsing
  const [exchangeBooks, setExchangeBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Exchange Modal Flow
  const [selectedBook, setSelectedBook] = useState(null);
  const [myBooks, setMyBooks] = useState([]);
  const [loadingMyBooks, setLoadingMyBooks] = useState(false);
  const [offeredBookId, setOfferedBookId] = useState('');
  const [exchangeMessage, setExchangeMessage] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('Campus Library or Student Center');
  const [submitting, setSubmitting] = useState(false);
  const [exchangeStep, setExchangeStep] = useState(1); // 1: Select book, 2: Confirm & send

  // My Exchange Requests tracker
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'my-swaps'
  const [mySwaps, setMySwaps] = useState([]);
  const [loadingSwaps, setLoadingSwaps] = useState(false);

  const categories = [
    'All',
    'Computer Science',
    'Programming',
    'Data Structures and Algorithms',
    'Artificial Intelligence',
    'Mathematics',
    'Science',
    'Novels',
    'Competitive Examination Preparation'
  ];

  // Fetch books available for exchange
  useEffect(() => {
    const fetchExchangeBooks = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('listingType', 'Exchange');
        if (selectedCategory !== 'All') params.set('category', selectedCategory);
        if (search.trim()) params.set('search', search.trim());
        params.set('limit', '24');

        const res = await api.get(`/books?${params.toString()}`);
        if (res.data.success) {
          // If exchange-specific listings are few, also include all available books
          let booksList = res.data.books;
          if (booksList.length < 4 && selectedCategory === 'All' && !search.trim()) {
            const allRes = await api.get('/books?limit=24');
            if (allRes.data.success) {
              booksList = allRes.data.books;
            }
          }
          setExchangeBooks(booksList);
        }
      } catch (err) {
        console.error('Error fetching exchange books:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeBooks();
  }, [selectedCategory, search]);

  // Fetch user's exchange requests
  const fetchMySwaps = async () => {
    if (!isAuthenticated) return;
    setLoadingSwaps(true);
    try {
      const [sentRes, recRes] = await Promise.all([
        api.get('/exchanges/sent'),
        api.get('/exchanges/received')
      ]);
      const combined = [
        ...(sentRes.data.success ? sentRes.data.exchanges.map((e) => ({ ...e, type: 'sent' })) : []),
        ...(recRes.data.success ? recRes.data.exchanges.map((e) => ({ ...e, type: 'received' })) : [])
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setMySwaps(combined);
    } catch (err) {
      console.error('Error fetching swaps:', err);
    } finally {
      setLoadingSwaps(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'my-swaps' && isAuthenticated) {
      fetchMySwaps();
    }
  }, [activeTab, isAuthenticated]);

  // Open the Exchange Modal
  const handleOpenExchangeModal = async (book) => {
    if (!isAuthenticated) {
      showToast('Please sign in to exchange books', 'info');
      navigate('/login');
      return;
    }

    const sellerId = book.seller?._id || book.seller;
    const currentUserId = user?._id || user?.id;
    if (sellerId === currentUserId) {
      showToast('You cannot exchange your own book listing', 'warning');
      return;
    }

    setSelectedBook(book);
    setExchangeStep(1);
    setExchangeMessage('');
    setLoadingMyBooks(true);

    try {
      const res = await api.get('/books/my-listings');
      if (res.data.success) {
        const available = res.data.books.filter((b) => b.availability === 'available');
        setMyBooks(available);
        if (available.length > 0) {
          setOfferedBookId(available[0]._id);
        } else {
          setOfferedBookId('');
        }
      }
    } catch (err) {
      showToast('Could not load your book listings', 'error');
    } finally {
      setLoadingMyBooks(false);
    }
  };

  // Submit the Exchange Request
  const handleSubmitExchange = async () => {
    if (!offeredBookId) {
      showToast('Please select one of your books to offer for exchange', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/exchanges', {
        bookRequestedId: selectedBook._id,
        bookOfferedId: offeredBookId,
        message: exchangeMessage.trim() || 'Hi! I would love to swap books with you.',
        meetingLocation
      });

      if (res.data.success) {
        showToast('Exchange request sent successfully! The owner will be notified.', 'success');
        setSelectedBook(null);
        setActiveTab('my-swaps');
        fetchMySwaps();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not send exchange request';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Friendly Status Pill
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" /> Waiting for Response
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5" /> Not Accepted
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Exchange Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const selectedOfferedBook = myBooks.find((b) => b._id === offeredBookId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-primary to-primary-light rounded-3xl p-8 sm:p-12 text-white shadow-soft relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-accent text-xs font-bold tracking-wide">
            <ArrowRightLeft className="w-4 h-4" />
            <span>Zero-Cost Peer Swapping</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Swap a Book. Discover Something New!
          </h1>

          <p className="text-slate-200 text-base sm:text-lg leading-relaxed">
            Give a book you have finished, get a book you need. No money needed — just students sharing knowledge and cutting textbook costs together.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'browse'
                  ? 'bg-accent text-white shadow-soft'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Browse Books to Swap
            </button>
            {isAuthenticated && (
              <button
                onClick={() => setActiveTab('my-swaps')}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'my-swaps'
                    ? 'bg-accent text-white shadow-soft'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                My Swap Requests
              </button>
            )}
            <Link
              to="/add-book"
              className="px-5 py-2.5 rounded-xl bg-white text-primary text-sm font-bold hover:bg-cream transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-accent" />
              <span>List a Book for Swap</span>
            </Link>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
      </div>

      {/* 2. Three Simple Steps Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-cream-50 border border-cream-200/60 p-6 sm:p-8 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary text-accent flex items-center justify-center font-black text-sm shrink-0">
            1
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Pick a Book You Want</h4>
            <p className="text-xs text-slate-600 mt-1">
              Browse textbooks or novels listed by fellow campus students.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary text-accent flex items-center justify-center font-black text-sm shrink-0">
            2
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Offer One of Yours</h4>
            <p className="text-xs text-slate-600 mt-1">
              Select any book from your own listings that you are ready to trade.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary text-accent flex items-center justify-center font-black text-sm shrink-0">
            3
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Meet & Swap</h4>
            <p className="text-xs text-slate-600 mt-1">
              Once accepted, meet at the library or campus center to swap your books.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Content: Browse Books or My Swaps */}
      {activeTab === 'browse' ? (
        <div className="space-y-6">
          {/* Search & Category Pills */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search books available for exchange..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-soft'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Books Grid */}
          {loading ? (
            <BookGridSkeleton count={8} />
          ) : exchangeBooks.length === 0 ? (
            <EmptyState
              title="No exchange books found"
              message="Be the first to list a book for exchange in this category!"
              actionText="List a Book to Exchange"
              actionLink="/add-book"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {exchangeBooks.map((book) => {
                const cover = book.images?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                return (
                  <div
                    key={book._id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-soft hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden group"
                  >
                    <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                      <img
                        src={cover}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-lg bg-purple-700 text-white text-xs font-bold shadow-sm flex items-center gap-1">
                          <ArrowRightLeft className="w-3 h-3" /> Ready to Swap
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-3">
                        <span className="px-2 py-0.5 rounded-md bg-white/95 text-slate-800 text-[11px] font-semibold shadow-xs">
                          {book.condition}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[11px] font-bold text-accent uppercase tracking-wider block">
                          {book.category}
                        </span>
                        <Link to={`/books/${book._id}`}>
                          <h3 className="font-bold text-base text-slate-900 group-hover:text-primary transition-colors line-clamp-1 mt-0.5">
                            {book.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                          by {book.author}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                          <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                          <span className="truncate">{book.college}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Owner: <span className="font-semibold text-slate-700">{book.seller?.name || 'Student'}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                        <button
                          onClick={() => handleOpenExchangeModal(book)}
                          className="flex-1 py-2 px-3 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>Exchange This Book</span>
                        </button>
                        <Link
                          to={`/books/${book._id}`}
                          className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* My Exchange Requests Tab */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">My Book Exchange Proposals</h2>
            <button
              onClick={fetchMySwaps}
              className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
            >
              Refresh Status
            </button>
          </div>

          {loadingSwaps ? (
            <div className="p-12 text-center text-slate-500 font-medium">Loading your swap requests...</div>
          ) : mySwaps.length === 0 ? (
            <EmptyState
              title="No swap requests yet"
              message="Explore books and click 'Exchange This Book' to initiate a swap."
              actionText="Browse Exchange Books"
              onAction={() => setActiveTab('browse')}
            />
          ) : (
            <div className="space-y-4">
              {mySwaps.map((swap) => {
                const isSent = swap.type === 'sent';
                const requested = swap.bookRequested;
                const offered = swap.bookOffered;
                const otherParty = isSent ? swap.owner : swap.requestedBy;

                return (
                  <div
                    key={swap._id}
                    className="bg-white rounded-2xl border border-slate-100 p-5 shadow-soft hover:shadow-soft-lg transition-all space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isSent ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {isSent ? 'Proposal Sent by You' : 'Proposal Received'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(swap.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div>{renderStatusBadge(swap.status)}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Book You Want */}
                      <div className="bg-slate-50 p-3.5 rounded-xl flex items-center gap-3">
                        <img
                          src={requested?.images?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80'}
                          alt={requested?.title}
                          className="w-14 h-18 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {isSent ? 'Book You Want' : 'Your Book Requested'}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 truncate">
                            {requested?.title || 'Book Title'}
                          </h4>
                          <p className="text-xs text-slate-600 truncate">by {requested?.author}</p>
                          <span className="text-[11px] text-accent font-semibold">{requested?.college}</span>
                        </div>
                      </div>

                      {/* Book Offered */}
                      <div className="bg-slate-50 p-3.5 rounded-xl flex items-center gap-3">
                        <img
                          src={offered?.images?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80'}
                          alt={offered?.title}
                          className="w-14 h-18 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {isSent ? 'Book You Offered' : 'Book Offered to You'}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 truncate">
                            {offered?.title || 'Offered Book'}
                          </h4>
                          <p className="text-xs text-slate-600 truncate">by {offered?.author}</p>
                          <span className="text-[11px] text-accent font-semibold">{offered?.condition}</span>
                        </div>
                      </div>
                    </div>

                    {swap.message && (
                      <div className="text-xs bg-cream-50 text-slate-700 p-3 rounded-xl border border-cream-200/50">
                        <span className="font-bold text-slate-800">Message: </span>
                        {swap.message}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-accent" />
                        <span>Meetup Location: <strong className="text-slate-700">{swap.meetingLocation || 'Campus Library'}</strong></span>
                      </div>

                      {/* Action buttons if received and pending */}
                      {!isSent && swap.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              try {
                                await api.put(`/exchanges/${swap._id}/status`, { status: 'accepted' });
                                showToast('Exchange proposal accepted!', 'success');
                                fetchMySwaps();
                              } catch (err) {
                                showToast('Could not accept proposal', 'error');
                              }
                            }}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                          >
                            Accept Swap
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await api.put(`/exchanges/${swap._id}/status`, { status: 'rejected' });
                                showToast('Exchange proposal declined', 'info');
                                fetchMySwaps();
                              } catch (err) {
                                showToast('Could not decline proposal', 'error');
                              }
                            }}
                            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. Exchange Proposal Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-accent uppercase tracking-wider">
                  Book Exchange Proposal
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {exchangeStep === 1 ? 'Step 1: Choose a Book to Offer' : 'Step 2: Confirm Exchange'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBook(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Book Summary */}
            <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-2xl border border-cream-200/50">
              <img
                src={selectedBook.images?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80'}
                alt={selectedBook.title}
                className="w-12 h-16 object-cover rounded-lg border border-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-500 uppercase">You want</span>
                <h4 className="font-bold text-sm text-slate-900 truncate">{selectedBook.title}</h4>
                <p className="text-xs text-slate-600 truncate">by {selectedBook.author}</p>
                <p className="text-[11px] text-accent font-semibold">{selectedBook.college}</p>
              </div>
            </div>

            {exchangeStep === 1 ? (
              /* Step 1: Select Your Book */
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Select one of your listed books to trade:
                </label>

                {loadingMyBooks ? (
                  <div className="text-center py-6 text-sm text-slate-500 font-medium">
                    Loading your available books...
                  </div>
                ) : myBooks.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded-2xl p-4 border border-dashed border-slate-300 space-y-3">
                    <p className="text-sm text-slate-700 font-medium">
                      You haven't listed any books yet to offer in an exchange.
                    </p>
                    <Link
                      to="/add-book"
                      onClick={() => setSelectedBook(null)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-hover transition-colors"
                    >
                      <PlusCircle className="w-4 h-4" /> List a Book First
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {myBooks.map((b) => (
                      <div
                        key={b._id}
                        onClick={() => setOfferedBookId(b._id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          offeredBookId === b._id
                            ? 'border-accent bg-accent/5 ring-2 ring-accent/30'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="offeredBook"
                          checked={offeredBookId === b._id}
                          onChange={() => setOfferedBookId(b._id)}
                          className="accent-accent"
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-sm text-slate-900 truncate">{b.title}</h5>
                          <p className="text-xs text-slate-500 truncate">
                            {b.author} • {b.condition}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Optional Note to Owner:
                  </label>
                  <textarea
                    rows={2}
                    value={exchangeMessage}
                    onChange={(e) => setExchangeMessage(e.target.value)}
                    placeholder="Hi! I'd love to swap for this book. Let me know if that works!"
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setSelectedBook(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!offeredBookId}
                    onClick={() => setExchangeStep(2)}
                    className="flex-1 py-2.5 rounded-xl bg-accent hover:bg-accent-hover disabled:bg-slate-300 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Next: Review & Confirm</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: Confirmation Screen */
              <div className="space-y-5">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h5 className="text-xs font-bold text-slate-500 uppercase">Exchange Summary:</h5>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-600">You Receive:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[200px]">{selectedBook.title}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-600">You Give:</span>
                    <span className="font-bold text-accent truncate max-w-[200px]">{selectedOfferedBook?.title}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-600">Owner:</span>
                    <span className="font-bold text-slate-900">{selectedBook.seller?.name || 'Student'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-600">Campus:</span>
                    <span className="font-bold text-slate-900">{selectedBook.college}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Proposed Meetup Location:
                  </label>
                  <input
                    type="text"
                    value={meetingLocation}
                    onChange={(e) => setMeetingLocation(e.target.value)}
                    placeholder="e.g. Main Library 1st Floor"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setExchangeStep(1)}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    disabled={submitting}
                    onClick={handleSubmitExchange}
                    className="flex-1 py-2.5 rounded-xl bg-accent hover:bg-accent-hover disabled:bg-slate-300 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-soft"
                  >
                    {submitting ? (
                      <span>Sending Proposal...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Book Exchange Request</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangePage;
