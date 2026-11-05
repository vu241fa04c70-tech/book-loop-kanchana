import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Heart,
  Share2,
  ShieldCheck,
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
  X,
  Send,
  User,
  ChevronRight,
  ArrowRight
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
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [sellerReviews, setSellerReviews] = useState({ averageRating: 5.0, count: 0, reviews: [] });

  // Modal States
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [myListedBooks, setMyListedBooks] = useState([]);
  const [selectedOfferedBookId, setSelectedOfferedBookId] = useState('');
  const [exchangeMessage, setExchangeMessage] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('Campus Library or Student Union');
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
          setPurchasePrice(bookData.price !== undefined ? bookData.price : '');

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

  // Wishlist toggle
  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to save books', 'info');
      navigate('/login');
      return;
    }
    if (savingWishlist) return;

    setSavingWishlist(true);
    try {
      if (isSaved) {
        await api.delete(`/wishlist/${id}`);
        setIsSaved(false);
        showToast('Removed from wishlist', 'info');
      } else {
        await api.post(`/wishlist/${id}`);
        setIsSaved(true);
        showToast('Saved to your wishlist!', 'success');
      }
    } catch (err) {
      showToast('Could not update wishlist', 'error');
    } finally {
      setSavingWishlist(false);
    }
  };

  // Open Exchange Modal
  const openExchangeModal = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to request an exchange', 'info');
      navigate('/login');
      return;
    }

    const sellerId = book.seller?._id || book.seller;
    const currentUserId = user?._id || user?.id;
    if (sellerId === currentUserId) {
      showToast('You cannot request an exchange for your own book', 'warning');
      return;
    }

    try {
      const res = await api.get('/books/my-listings');
      if (res.data.success) {
        const available = res.data.books.filter(
          (b) => b._id !== id && b.availability === 'available'
        );
        setMyListedBooks(available);
        if (available.length > 0) {
          setSelectedOfferedBookId(available[0]._id);
        } else {
          setSelectedOfferedBookId('');
        }
        setShowExchangeModal(true);
      }
    } catch (err) {
      showToast('Failed to load your book listings', 'error');
    }
  };

  // Submit Exchange Request
  const handleSubmitExchange = async (e) => {
    e.preventDefault();
    if (!selectedOfferedBookId) {
      showToast('Please select one of your books to offer in exchange', 'error');
      return;
    }

    setSubmittingAction(true);
    try {
      const res = await api.post('/exchanges', {
        bookRequestedId: id,
        bookOfferedId: selectedOfferedBookId,
        message: exchangeMessage.trim() || 'Hi! I would love to exchange books with you.',
        meetingLocation
      });

      if (res.data.success) {
        showToast('Book exchange proposal sent to the seller!', 'success');
        setShowExchangeModal(false);
        setExchangeMessage('');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit exchange proposal';
      showToast(msg, 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Open Purchase Modal
  const openPurchaseModal = () => {
    if (!isAuthenticated) {
      showToast('Please sign in to buy books', 'info');
      navigate('/login');
      return;
    }

    const sellerId = book.seller?._id || book.seller;
    const currentUserId = user?._id || user?.id;
    if (sellerId === currentUserId) {
      showToast('You cannot purchase your own book listing', 'warning');
      return;
    }

    setPurchasePrice(book.price || 0);
    setShowPurchaseModal(true);
  };

  // Submit Purchase Request
  const handleSubmitPurchase = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      const res = await api.post('/purchases', {
        bookId: id,
        offeredPrice: Number(purchasePrice),
        message: purchaseMessage.trim() || 'Hi! I would like to purchase your book.'
      });

      if (res.data.success) {
        showToast('Purchase request sent to the seller!', 'success');
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

  // Contact Seller directly
  const handleContactSeller = () => {
    if (!isAuthenticated) {
      showToast('Please sign in to message the seller', 'info');
      navigate('/login');
      return;
    }
    const sellerId = book.seller?._id || book.seller;
    navigate(`/messages?user=${sellerId}&book=${id}`);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Loading book details...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Book not found</h2>
        <p className="text-sm text-slate-500">This book listing may have been sold or removed.</p>
        <Link
          to="/explore"
          className="inline-block px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-soft"
        >
          Explore Other Books
        </Link>
      </div>
    );
  }

  const images =
    book.images && book.images.length > 0
      ? book.images
      : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'];

  const discountPercent =
    book.originalPrice && book.originalPrice > book.price
      ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/explore" className="hover:text-primary">Explore Books</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 font-bold truncate max-w-[200px]">{book.title}</span>
      </nav>

      {/* 2. Main Book Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Cover Gallery (5 columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-soft-lg group">
            <img
              src={images[activeImageIndex] || images[0]}
              alt={book.title}
              className="w-full h-full object-cover"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              <span
                className={`px-3 py-1 text-xs font-black rounded-xl shadow-md text-white backdrop-blur-md ${
                  book.listingType === 'Donate'
                    ? 'bg-emerald-600'
                    : book.listingType === 'Exchange'
                    ? 'bg-purple-600'
                    : 'bg-primary'
                }`}
              >
                {book.listingType === 'Donate'
                  ? 'Free Donation'
                  : book.listingType === 'Exchange'
                  ? 'For Exchange'
                  : 'For Sale'}
              </span>

              {discountPercent && book.listingType === 'Sell' && (
                <span className="px-2.5 py-0.5 text-xs font-black rounded-lg bg-accent text-white shadow-sm w-fit">
                  {discountPercent}% OFF RETAIL
                </span>
              )}

              {book.isSample && (
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-lg bg-amber-500 text-white shadow-xs w-fit flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Demo Listing
                </span>
              )}
            </div>

            {/* Wishlist Heart Button */}
            <button
              onClick={handleToggleWishlist}
              disabled={savingWishlist}
              className={`absolute top-4 right-4 p-3 rounded-2xl backdrop-blur-md transition-all shadow-md ${
                isSaved
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/90 hover:bg-white text-slate-700 hover:text-rose-500'
              }`}
              title={isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            {/* Condition Tag */}
            <div className="absolute bottom-4 left-4">
              <span className="px-3 py-1 rounded-xl bg-white/95 text-slate-900 text-xs font-bold shadow-xs">
                Condition: {book.condition}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-accent shadow-soft scale-105'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Book Information & Action Buttons (7 columns) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Header Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-cream-100 text-accent font-bold text-xs uppercase tracking-wider">
                {book.category}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className={`text-xs font-bold ${
                book.availability === 'available' ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {book.availability === 'available' ? '● Available on Campus' : '● In Active Discussion'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {book.title}
            </h1>

            <p className="text-base text-slate-600 font-medium">
              by <strong className="text-slate-800">{book.author}</strong>
            </p>

            {/* Price display */}
            <div className="pt-2 flex items-baseline gap-3">
              {book.listingType === 'Donate' ? (
                <span className="text-3xl sm:text-4xl font-black text-emerald-600">
                  FREE DONATION
                </span>
              ) : (
                <>
                  <span className="text-3xl sm:text-4xl font-black text-primary">
                    ${book.price}
                  </span>
                  {book.originalPrice > 0 && (
                    <span className="text-sm text-slate-400 line-through">
                      Original: ${book.originalPrice}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Description & Course Notes
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {book.description}
            </p>
            {book.ISBN && (
              <p className="text-xs text-slate-500 pt-1">
                <strong>ISBN:</strong> {book.ISBN}
              </p>
            )}
          </div>

          {/* Seller Profile Card */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-soft flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={book.seller?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={book.seller?.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900">
                    {book.seller?.name || 'Verified Student'}
                  </h4>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>{book.college || 'Campus'}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Location: {book.location || 'Campus Center'}
                </div>
              </div>
            </div>

            {sellerReviews.count > 0 && (
              <div className="text-right">
                <div className="flex items-center gap-1 text-amber-400 justify-end">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-xs font-bold text-slate-900">{sellerReviews.averageRating}</span>
                </div>
                <span className="text-[10px] text-slate-500">{sellerReviews.count} campus reviews</span>
              </div>
            )}
          </div>

          {/* 4 Clear Action Buttons with Explanatory Helper Text */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Choose an Action:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Button 1: Request to Buy */}
              {book.listingType !== 'Exchange' && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-primary shadow-soft transition-all space-y-2 flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span>Request to Buy</span>
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Send a purchase offer to the seller without upfront payment.
                    </p>
                  </div>
                  <button
                    onClick={openPurchaseModal}
                    className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white text-xs font-bold transition-colors shadow-soft"
                  >
                    Send Buy Request
                  </button>
                </div>
              )}

              {/* Button 2: Request Exchange */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-600 shadow-soft transition-all space-y-2 flex flex-col justify-between">
                <div>
                  <h5 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                    <span>Request Exchange</span>
                  </h5>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Offer one of your listed books in exchange for this one.
                  </p>
                </div>
                <button
                  onClick={openExchangeModal}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-soft"
                >
                  Propose Swap
                </button>
              </div>

              {/* Button 3: Save to Wishlist */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-rose-300 shadow-soft transition-all space-y-2 flex flex-col justify-between">
                <div>
                  <h5 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>Save to Wishlist</span>
                  </h5>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Save this book to your favorites so you can easily review it anytime.
                  </p>
                </div>
                <button
                  onClick={handleToggleWishlist}
                  disabled={savingWishlist}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isSaved
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {isSaved ? 'Saved in Wishlist ✓' : 'Add to Wishlist'}
                </button>
              </div>

              {/* Button 4: Contact Seller */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-accent shadow-soft transition-all space-y-2 flex flex-col justify-between">
                <div>
                  <h5 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-accent" />
                    <span>Contact Seller</span>
                  </h5>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Send a direct message to ask questions or arrange campus pickup.
                  </p>
                </div>
                <button
                  onClick={handleContactSeller}
                  className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold transition-colors shadow-soft"
                >
                  Chat with Seller
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Similar Books in Same Category */}
      {similarBooks.length > 0 && (
        <section className="pt-8 border-t border-slate-200/80 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                More Books in {book.category}
              </h2>
              <p className="text-xs text-slate-500">Other students also viewed these related titles</p>
            </div>
            <Link
              to={`/explore?category=${encodeURIComponent(book.category)}`}
              className="text-xs font-bold text-primary hover:text-accent transition-colors flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarBooks.map((simBook) => (
              <BookCard key={simBook._id} book={simBook} />
            ))}
          </div>
        </section>
      )}

      {/* 4. Exchange Proposal Modal */}
      {showExchangeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                  Book Exchange Proposal
                </span>
                <h3 className="text-xl font-black text-slate-900">Propose a Book Swap</h3>
              </div>
              <button
                onClick={() => setShowExchangeModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitExchange} className="space-y-4">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Select one of your books to offer in trade:
              </label>

              {myListedBooks.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-2xl p-4 border border-dashed border-slate-300 space-y-3">
                  <p className="text-xs text-slate-600">
                    You haven't listed any books yet to trade.
                  </p>
                  <Link
                    to="/add-book"
                    onClick={() => setShowExchangeModal(false)}
                    className="inline-block px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold"
                  >
                    List a Book First
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {myListedBooks.map((b) => (
                    <div
                      key={b._id}
                      onClick={() => setSelectedOfferedBookId(b._id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedOfferedBookId === b._id
                          ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="exchangeBook"
                        checked={selectedOfferedBookId === b._id}
                        onChange={() => setSelectedOfferedBookId(b._id)}
                        className="accent-purple-600"
                      />
                      <div className="min-w-0 flex-1">
                        <h5 className="font-bold text-sm text-slate-900 truncate">{b.title}</h5>
                        <p className="text-xs text-slate-500 truncate">{b.author} • {b.condition}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Proposed Meetup Location:
                </label>
                <input
                  type="text"
                  value={meetingLocation}
                  onChange={(e) => setMeetingLocation(e.target.value)}
                  placeholder="e.g. Campus Library 2nd Floor"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Note to Owner:
                </label>
                <textarea
                  rows={2}
                  value={exchangeMessage}
                  onChange={(e) => setExchangeMessage(e.target.value)}
                  placeholder="Hi! I'd love to swap my textbook for yours. Let me know!"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExchangeModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction || !selectedOfferedBookId}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-soft"
                >
                  {submittingAction ? 'Sending...' : 'Send Swap Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Purchase Request Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Purchase Offer
                </span>
                <h3 className="text-xl font-black text-slate-900">Request to Purchase</h3>
              </div>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPurchase} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
                <img
                  src={images[0]}
                  alt={book.title}
                  className="w-12 h-16 object-cover rounded-lg border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 truncate">{book.title}</h4>
                  <p className="text-xs text-slate-500">Asking Price: ${book.price}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Your Offer Amount ($):
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  required
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40 font-bold text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Message to Seller:
                </label>
                <textarea
                  rows={3}
                  value={purchaseMessage}
                  onChange={(e) => setPurchaseMessage(e.target.value)}
                  placeholder="Let the seller know when you can meet on campus to inspect and pick up the book..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-light disabled:bg-slate-300 text-white text-xs font-bold transition-colors shadow-soft"
                >
                  {submittingAction ? 'Sending Offer...' : 'Send Purchase Request'}
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
