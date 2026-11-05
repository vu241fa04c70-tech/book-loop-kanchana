import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Heart,
  Share2,
  Shield,
  ArrowRightLeft,
  DollarSign,
  Gift,
  MessageSquare,
  Sparkles,
  BookOpen,
  Star,
  CheckCircle2,
  Calendar,
  AlertCircle,
  X
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BookCard from '../components/BookCard';

const BookDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [sellerReviews, setSellerReviews] = useState({ averageRating: 5.0, count: 0, reviews: [] });

  // Modal States
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [myListedBooks, setMyListedBooks] = useState([]);
  const [selectedOfferedBookId, setSelectedOfferedBookId] = useState('');
  const [exchangeMessage, setExchangeMessage] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/books/${id}`);
        if (res.data.success && res.data.book) {
          const bookData = res.data.book;
          setBook(bookData);
          setPurchasePrice(bookData.price || '');

          // Check if book is saved in wishlist
          if (isAuthenticated) {
            try {
              const wishRes = await api.get(`/wishlist/check/${id}`);
              if (wishRes.data.success) {
                setIsSaved(wishRes.data.isSaved);
              }
            } catch (e) {}
          }

          // Fetch seller reviews
          const sellerId = bookData.seller?._id || bookData.seller;
          if (sellerId) {
            try {
              const reviewsRes = await api.get(`/reviews/user/${sellerId}`);
              if (reviewsRes.data.success) {
                setSellerReviews(reviewsRes.data);
              }
            } catch (e) {}
          }

          // Fetch similar books in same category
          try {
            const simRes = await api.get(`/books?category=${encodeURIComponent(bookData.category)}&limit=4`);
            if (simRes.data.success) {
              setSimilarBooks(simRes.data.books.filter((b) => b._id !== id));
            }
          } catch (e) {}
        }
      } catch (err) {
        console.error('Error fetching book details:', err);
        showToast('Could not load book details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id, isAuthenticated]);

  // Load user's books for exchange modal
  const openExchangeModal = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to request an exchange', 'info');
      navigate('/login');
      return;
    }

    try {
      const res = await api.get('/books/my-listings');
      if (res.data.success) {
        const availableBooks = res.data.books.filter(
          (b) => b._id !== id && b.availability === 'available'
        );
        setMyListedBooks(availableBooks);
        if (availableBooks.length > 0) {
          setSelectedOfferedBookId(availableBooks[0]._id);
        }
        setShowExchangeModal(true);
      }
    } catch (err) {
      showToast('Failed to load your book listings for exchange', 'error');
    }
  };

  const handleExchangeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOfferedBookId) {
      showToast('Please select one of your listed books to trade', 'error');
      return;
    }

    setSubmittingAction(true);
    try {
      const res = await api.post('/exchanges', {
        bookRequestedId: book._id,
        bookOfferedId: selectedOfferedBookId,
        message: exchangeMessage
      });

      if (res.data.success) {
        showToast('Exchange request sent to seller successfully!', 'success');
        setShowExchangeModal(false);
        setExchangeMessage('');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit exchange request';
      showToast(msg, 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to request a purchase', 'info');
      navigate('/login');
      return;
    }

    setSubmittingAction(true);
    try {
      const res = await api.post('/purchases', {
        bookId: book._id,
        offeredPrice: Number(purchasePrice),
        message: purchaseMessage
      });

      if (res.data.success) {
        showToast('Purchase request sent to seller!', 'success');
        setShowPurchaseModal(false);
        setPurchaseMessage('');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit purchase request';
      showToast(msg, 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleClaimDonation = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to request this donated book', 'info');
      navigate('/login');
      return;
    }

    try {
      const res = await api.post('/donations/request', {
        bookId: book._id,
        purpose: 'Academic Study',
        message: 'I would be extremely grateful to receive this donated textbook for my studies.'
      });

      if (res.data.success) {
        showToast('Free donation request submitted to the donor!', 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not request donation';
      showToast(msg, 'error');
    }
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to save books', 'info');
      navigate('/login');
      return;
    }

    try {
      if (isSaved) {
        await api.delete(`/wishlist/${book._id}`);
        setIsSaved(false);
        showToast('Removed from wishlist', 'info');
      } else {
        await api.post(`/wishlist/${book._id}`);
        setIsSaved(true);
        showToast('Saved to wishlist!', 'success');
      }
    } catch (err) {
      showToast('Error updating wishlist', 'error');
    }
  };

  const handleStartChat = () => {
    if (!isAuthenticated) {
      showToast('Please sign in to message this seller', 'info');
      navigate('/login');
      return;
    }

    const sellerId = book.seller?._id || book.seller;
    navigate(`/messages?user=${sellerId}&book=${book._id}`);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-accent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
          Loading book specifications...
        </p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-black text-slate-900">Book Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">
          This listing may have been exchanged, sold, or removed by its owner.
        </p>
        <Link
          to="/explore"
          className="inline-block mt-6 px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold"
        >
          Explore Other Books
        </Link>
      </div>
    );
  }

  const isOwner = user && (book.seller?._id || book.seller).toString() === user._id.toString();
  const images = book.images && book.images.length > 0 ? book.images : [
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link to="/explore" className="hover:text-primary">Explore</Link>
        <span>/</span>
        <Link to={`/explore?category=${encodeURIComponent(book.category)}`} className="hover:text-primary">
          {book.category}
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-bold truncate max-w-xs">{book.title}</span>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-soft relative group">
            <img
              src={images[activeImageIndex]}
              alt={book.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-extrabold shadow-sm ${
                  book.listingType === 'Donate'
                    ? 'bg-emerald-600 text-white'
                    : book.listingType === 'Exchange'
                    ? 'bg-purple-600 text-white'
                    : 'bg-primary text-white'
                }`}
              >
                {book.listingType === 'Donate' ? 'Free Donation' : `For ${book.listingType}`}
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-white/90 text-slate-800 shadow-xs backdrop-blur-xs">
                {book.condition}
              </span>
            </div>
          </div>

          {/* Thumbnails if multiple images */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImageIndex === idx ? 'border-accent scale-105' : 'border-slate-200 opacity-70'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Campus Safety Tips Card */}
          <div className="bg-cream-100/70 border border-cream-200 rounded-2xl p-5 space-y-2 text-xs text-amber-950">
            <h4 className="font-bold flex items-center gap-1.5 text-amber-900">
              <Shield className="w-4 h-4 text-accent" /> Campus Safety Advice
            </h4>
            <p className="leading-relaxed text-amber-900/80 text-[11px]">
              For student safety, always arrange exchanges and pick-ups at prominent public campus
              spots such as the university library entrance, student union, or campus cafe.
            </p>
          </div>
        </div>

        {/* Right Column: Book Info & Interactive Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md bg-accent/15 text-accent text-xs font-extrabold uppercase tracking-wider">
                {book.category}
              </span>
              {book.subject && (
                <span className="text-xs font-semibold text-slate-400">
                  • {book.subject}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary tracking-tight leading-tight">
              {book.title}
            </h1>

            <p className="text-sm font-semibold text-slate-600 mt-1">
              by <span className="text-slate-900">{book.author}</span>
            </p>

            {book.ISBN && (
              <p className="text-xs text-slate-400 font-mono mt-1">ISBN: {book.ISBN}</p>
            )}
          </div>

          {/* Pricing Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price</p>
              {book.listingType === 'Donate' ? (
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black text-emerald-600">FREE</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    GIFT
                  </span>
                </div>
              ) : (
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black text-primary">${book.price}</span>
                  {book.originalPrice > book.price && (
                    <>
                      <span className="text-sm text-slate-400 line-through">
                        ${book.originalPrice}
                      </span>
                      <span className="text-xs font-extrabold text-accent bg-amber-50 px-2 py-0.5 rounded-full">
                        Save ${book.originalPrice - book.price} (
                        {Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)}%)
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Availability
              </span>
              <span
                className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-extrabold capitalize ${
                  book.availability === 'available'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                ● {book.availability}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          {book.availability === 'available' && !isOwner && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {book.listingType === 'Donate' ? (
                  <button
                    onClick={handleClaimDonation}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-soft transition-all flex items-center justify-center gap-2"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Claim Free Donation</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowPurchaseModal(true)}
                    className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-light text-white text-sm font-bold shadow-soft transition-all flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-4 h-4 text-accent" />
                    <span>Request to Purchase</span>
                  </button>
                )}

                <button
                  onClick={openExchangeModal}
                  className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold shadow-soft transition-all flex items-center justify-center gap-2"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Request Book Swap</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleStartChat}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                  <span>Contact Seller</span>
                </button>

                <button
                  onClick={toggleWishlist}
                  className={`px-4 py-2.5 rounded-xl border transition-all text-xs font-bold flex items-center gap-2 ${
                    isSaved
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Wishlist'}</span>
                </button>
              </div>
            </div>
          )}

          {isOwner && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                You are the creator of this book listing.
              </span>
              <Link
                to={`/edit-book/${book._id}`}
                className="px-4 py-1.5 rounded-xl bg-primary text-white text-xs font-bold"
              >
                Edit Listing
              </Link>
            </div>
          )}

          {/* Description */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
              Book Description & Notes
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {book.description}
            </p>
          </div>

          {/* Seller Profile Card */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
              Listed by Student
            </h3>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={
                    book.seller?.profileImage ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                  }
                  alt={book.seller?.name || 'Seller'}
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{book.seller?.name || 'Fellow Student'}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    <span>{book.seller?.college || book.college}</span>
                  </p>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{sellerReviews.averageRating}</span>
                    <span className="text-slate-400 font-normal">({sellerReviews.count} reviews)</span>
                  </div>
                </div>
              </div>

              {!isOwner && (
                <button
                  onClick={handleStartChat}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-primary hover:text-white text-xs font-bold text-slate-700 transition-colors"
                >
                  Send Message
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Similar Books */}
      {similarBooks.length > 0 && (
        <div className="border-t border-slate-100 pt-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-primary tracking-tight">
              Similar Books in {book.category}
            </h3>
            <Link
              to={`/explore?category=${encodeURIComponent(book.category)}`}
              className="text-xs font-bold text-accent hover:underline"
            >
              View category →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarBooks.map((sim) => (
              <BookCard key={sim._id} book={sim} />
            ))}
          </div>
        </div>
      )}

      {/* --- EXCHANGE REQUEST MODAL --- */}
      {showExchangeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-primary font-bold">
                <ArrowRightLeft className="w-5 h-5 text-accent" />
                <span>Propose Book Swap</span>
              </div>
              <button
                onClick={() => setShowExchangeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                You are requesting:
              </p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center gap-3">
                <img
                  src={images[0]}
                  alt=""
                  className="w-12 h-14 object-cover rounded-md"
                />
                <div>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{book.title}</h4>
                  <p className="text-[11px] text-slate-500">{book.author}</p>
                  <span className="text-[10px] font-bold text-primary">${book.price} value</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleExchangeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select One of Your Listed Books to Offer:
                </label>
                {myListedBooks.length > 0 ? (
                  <select
                    value={selectedOfferedBookId}
                    onChange={(e) => setSelectedOfferedBookId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {myListedBooks.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.title} (${b.price}) - {b.condition}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-2">
                    <p>You don't have any active book listings to trade right now.</p>
                    <Link
                      to="/add-book"
                      className="inline-block font-bold text-accent underline"
                    >
                      + List a book to offer for trade
                    </Link>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Message / Meetup Proposal:
                </label>
                <textarea
                  rows="3"
                  placeholder="E.g., Hi! Would love to trade for your textbook. I can meet at the campus library this Thursday..."
                  value={exchangeMessage}
                  onChange={(e) => setExchangeMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExchangeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction || myListedBooks.length === 0}
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold shadow-soft transition-all"
                >
                  {submittingAction ? 'Sending...' : 'Send Exchange Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PURCHASE REQUEST MODAL --- */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-primary font-bold">
                <DollarSign className="w-5 h-5 text-accent" />
                <span>Submit Purchase Request</span>
              </div>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePurchaseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Offered Price ($):
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent font-bold"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Listed price: ${book.price}. You may offer a fair student counter-price.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Meetup Note / Message to Seller:
                </label>
                <textarea
                  rows="3"
                  placeholder="Hi! I want to buy your book. Can we meet after classes tomorrow near the campus center?"
                  value={purchaseMessage}
                  onChange={(e) => setPurchaseMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-6 py-2 rounded-xl bg-primary hover:bg-primary-light disabled:opacity-50 text-white text-xs font-bold shadow-soft transition-all"
                >
                  {submittingAction ? 'Submitting...' : 'Submit Purchase Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetailsPage;
