import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ArrowRightLeft,
  DollarSign,
  Heart,
  User,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Star,
  ExternalLink,
  MessageSquare,
  Sparkles,
  MapPin,
  Settings,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BookCard from '../components/BookCard';
import EmptyState from '../components/EmptyState';

const DashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'my-books';

  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [myBooks, setMyBooks] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [sentExchanges, setSentExchanges] = useState([]);
  const [receivedExchanges, setReceivedExchanges] = useState([]);
  const [sentPurchases, setSentPurchases] = useState([]);
  const [receivedPurchases, setReceivedPurchases] = useState([]);
  const [myReviews, setMyReviews] = useState([]);

  // Sub-tab toggles
  const [exchangeSubTab, setExchangeSubTab] = useState('received'); // 'received' or 'sent'
  const [purchaseSubTab, setPurchaseSubTab] = useState('received'); // 'received' or 'sent'

  // Review modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Profile edit states
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    college: user?.college || '',
    location: user?.location || '',
    city: user?.city || '',
    bio: user?.bio || '',
    readingInterests: Array.isArray(user?.readingInterests) ? user.readingInterests.join(', ') : '',
    favoriteCategories: Array.isArray(user?.favoriteCategories) ? user.favoriteCategories.join(', ') : ''
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        college: user.college || '',
        location: user.location || '',
        city: user.city || '',
        bio: user.bio || '',
        readingInterests: Array.isArray(user.readingInterests) ? user.readingInterests.join(', ') : '',
        favoriteCategories: Array.isArray(user.favoriteCategories) ? user.favoriteCategories.join(', ') : ''
      });
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        booksRes,
        wishRes,
        sentExRes,
        recExRes,
        sentPurRes,
        recPurRes
      ] = await Promise.all([
        api.get('/books/my-listings'),
        api.get('/wishlist'),
        api.get('/exchanges/sent'),
        api.get('/exchanges/received'),
        api.get('/purchases/sent'),
        api.get('/purchases/received')
      ]);

      if (booksRes.data.success) setMyBooks(booksRes.data.books || []);
      if (wishRes.data.success) setWishlist(wishRes.data.wishlist || []);
      if (sentExRes.data.success) setSentExchanges(sentExRes.data.exchanges || []);
      if (recExRes.data.success) setReceivedExchanges(recExRes.data.exchanges || []);
      if (sentPurRes.data.success) setSentPurchases(sentPurRes.data.purchases || []);
      if (recPurRes.data.success) setReceivedPurchases(recPurRes.data.purchases || []);

      // Fetch user reviews
      const userId = user?._id || user?.id;
      if (userId) {
        try {
          const revRes = await api.get(`/reviews/user/${userId}`);
          if (revRes.data.success) setMyReviews(revRes.data.reviews || []);
        } catch (e) {}
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      showToast('Could not load some dashboard records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  // Delete a book listing
  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to remove this book listing?')) return;
    try {
      const res = await api.delete(`/books/${bookId}`);
      if (res.data.success) {
        showToast('Book listing removed', 'info');
        setMyBooks((prev) => prev.filter((b) => b._id !== bookId));
      }
    } catch (err) {
      showToast('Failed to delete book listing', 'error');
    }
  };

  // Update Exchange Status
  const handleExchangeStatus = async (exchangeId, newStatus) => {
    try {
      const res = await api.put(`/exchanges/${exchangeId}/status`, { status: newStatus });
      if (res.data.success) {
        showToast(`Exchange proposal ${newStatus}!`, 'success');
        fetchDashboardData();
      }
    } catch (err) {
      showToast('Could not update exchange status', 'error');
    }
  };

  // Update Purchase Status
  const handlePurchaseStatus = async (purchaseId, newStatus) => {
    try {
      const res = await api.put(`/purchases/${purchaseId}/status`, { status: newStatus });
      if (res.data.success) {
        showToast(`Purchase request ${newStatus}!`, 'success');
        fetchDashboardData();
      }
    } catch (err) {
      showToast('Could not update purchase status', 'error');
    }
  };

  // Confirm Dual-Party Handover
  const handleConfirmHandover = async (id, type) => {
    try {
      const endpoint = type === 'purchase' ? `/purchases/${id}/confirm-handover` : `/exchanges/${id}/confirm-handover`;
      const res = await api.put(endpoint);
      if (res.data.success) {
        showToast(res.data.message || 'Handover confirmed!', 'success');
        fetchDashboardData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to confirm handover', 'error');
    }
  };

  // Update Profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    const interests = typeof profileForm.readingInterests === 'string'
      ? profileForm.readingInterests.split(',').map((s) => s.trim()).filter(Boolean)
      : profileForm.readingInterests;
    const categories = typeof profileForm.favoriteCategories === 'string'
      ? profileForm.favoriteCategories.split(',').map((s) => s.trim()).filter(Boolean)
      : profileForm.favoriteCategories;

    const result = await updateProfile({
      ...profileForm,
      readingInterests: interests,
      favoriteCategories: categories
    });
    setUpdatingProfile(false);
    if (result.success) {
      showToast('Profile information saved!', 'success');
    }
  };

  // Submit Review Modal
  const handleSubmitReview = async () => {
    if (!reviewTarget) return;
    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        reviewedUserId: reviewTarget.otherUserId,
        transactionType: reviewTarget.type,
        transactionId: reviewTarget.transactionId,
        rating: reviewRating,
        comment: reviewComment.trim() || 'Great experience with this book swap!'
      });
      if (res.data.success) {
        showToast('Review submitted! Thank you.', 'success');
        setShowReviewModal(false);
        setReviewComment('');
        fetchDashboardData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not submit review';
      showToast(msg, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

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
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
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

  const tabs = [
    { id: 'my-books', label: 'My Books', icon: BookOpen, count: myBooks.length },
    { id: 'wishlist', label: 'Books I Want', icon: Heart, count: wishlist.length },
    {
      id: 'purchases',
      label: 'Purchase Requests',
      icon: DollarSign,
      count: receivedPurchases.length + sentPurchases.length
    },
    {
      id: 'exchanges',
      label: 'Exchange Requests',
      icon: ArrowRightLeft,
      count: receivedExchanges.length + sentExchanges.length
    },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'reviews', label: 'My Reviews', icon: Star, count: myReviews.length },
    { id: 'settings', label: 'Account Settings', icon: Settings }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. Header: Welcome Banner */}
      <div className="bg-gradient-to-r from-cream-100 via-white to-cream-50 p-6 sm:p-10 rounded-3xl border border-cream-200/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
            alt={user?.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-soft"
          />
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-primary-100 text-primary text-[11px] font-bold uppercase">
              <Sparkles className="w-3 h-3 text-accent" /> Student Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
              My BookLoop
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Welcome back, <strong>{user?.name}</strong> • {user?.college}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/add-book"
            className="px-5 py-3 rounded-2xl bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-bold shadow-soft transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List a New Book</span>
          </Link>
          <Link
            to="/messages"
            className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-primary hover:bg-slate-50 shadow-soft transition-colors"
            title="Open Messages"
          >
            <MessageSquare className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* 2. Navigation Tabs (Clear descriptive labels, simple icons) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-soft scale-102'
                  : 'bg-white text-slate-600 hover:text-primary hover:bg-slate-50 border border-slate-200/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-accent text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading your books and requests...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: MY BOOKS */}
          {currentTab === 'my-books' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">My Listed Books</h2>
                  <p className="text-xs text-slate-500">Books you have uploaded for sale, exchange, or donation</p>
                </div>
                <Link
                  to="/add-book"
                  className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-hover transition-colors flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" /> Add Book
                </Link>
              </div>

              {myBooks.length === 0 ? (
                <EmptyState
                  title="You haven't listed any books yet"
                  message="Have books on your shelf you no longer read? List them today and help fellow students."
                  actionText="Sell or Share Your First Book"
                  actionLink="/add-book"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {myBooks.map((book) => {
                    const cover = book.images?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                    return (
                      <div
                        key={book._id}
                        className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden flex flex-col justify-between"
                      >
                        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                          <img src={cover} alt={book.title} className="w-full h-full object-cover" />
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-primary text-white shadow-xs">
                              {book.listingType}
                            </span>
                          </div>
                          <div className="absolute bottom-2.5 left-3">
                            <span className="px-2 py-0.5 rounded-md bg-white/95 text-slate-800 text-[11px] font-bold shadow-xs">
                              {book.condition}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">
                              {book.category}
                            </span>
                            <Link to={`/books/${book._id}`}>
                              <h3 className="font-bold text-sm text-slate-900 hover:text-primary transition-colors line-clamp-1 mt-0.5">
                                {book.title}
                              </h3>
                            </Link>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">by {book.author}</p>
                            <p className="text-base font-black text-primary mt-2">
                              {book.listingType === 'Donate' ? 'FREE' : `$${book.price}`}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <Link
                              to={`/edit-book/${book._id}`}
                              className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold text-center flex items-center justify-center gap-1 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteBook(book._id)}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors"
                              title="Delete Listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <Link
                              to={`/books/${book._id}`}
                              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                              title="View Public Page"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BOOKS I WANT (WISHLIST) */}
          {currentTab === 'wishlist' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">Books I Want</h2>
                <p className="text-xs text-slate-500">Textbooks and novels you have saved to your favorites</p>
              </div>

              {wishlist.length === 0 ? (
                <EmptyState
                  title="Your wishlist is empty"
                  message="Explore books and click the heart icon on any book you are interested in."
                  actionText="Explore Books"
                  actionLink="/explore"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {wishlist.map((item) => {
                    const book = item.book;
                    if (!book) return null;
                    return (
                      <BookCard
                        key={book._id}
                        book={book}
                        isSavedInitial={true}
                        onWishlistChange={(bId, saved) => {
                          if (!saved) {
                            setWishlist((prev) => prev.filter((w) => w.book?._id !== bId));
                          }
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PURCHASE REQUESTS */}
          {currentTab === 'purchases' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">Purchase Requests</h2>
                  <p className="text-xs text-slate-500">Track buy requests between you and campus sellers</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
                  <button
                    onClick={() => setPurchaseSubTab('received')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      purchaseSubTab === 'received'
                        ? 'bg-white text-primary shadow-xs'
                        : 'text-slate-600 hover:text-primary'
                    }`}
                  >
                    Received ({receivedPurchases.length})
                  </button>
                  <button
                    onClick={() => setPurchaseSubTab('sent')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      purchaseSubTab === 'sent'
                        ? 'bg-white text-primary shadow-xs'
                        : 'text-slate-600 hover:text-primary'
                    }`}
                  >
                    Sent by Me ({sentPurchases.length})
                  </button>
                </div>
              </div>

              {/* List */}
              {purchaseSubTab === 'received' ? (
                receivedPurchases.length === 0 ? (
                  <EmptyState
                    title="No purchase requests received yet"
                    message="When a student wants to buy your listed book, their offer will appear here."
                  />
                ) : (
                  <div className="space-y-4">
                    {receivedPurchases.map((req) => (
                      <div
                        key={req._id}
                        className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">
                              Buyer: {req.buyer?.name}
                            </span>
                            <span className="text-xs text-slate-500">({req.buyer?.college})</span>
                          </div>
                          <div>{renderStatusBadge(req.status)}</div>
                        </div>

                        <div className="flex items-center gap-4">
                          <img
                            src={req.book?.images?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80'}
                            alt={req.book?.title}
                            className="w-14 h-18 object-cover rounded-xl border border-slate-200 shrink-0"
                          />
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{req.book?.title}</h4>
                            <p className="text-xs text-slate-500">by {req.book?.author}</p>
                            <p className="text-sm font-black text-primary mt-1">
                              Offered: ${req.offeredPrice || req.book?.price}
                            </p>
                          </div>
                        </div>

                        {req.message && (
                          <p className="text-xs bg-cream-50 text-slate-700 p-3 rounded-xl border border-cream-200/50">
                            <strong>Note from Buyer: </strong> {req.message}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-1">
                          {req.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handlePurchaseStatus(req._id, 'accepted')}
                                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                              >
                                Accept Offer
                              </button>
                              <button
                                onClick={() => handlePurchaseStatus(req._id, 'rejected')}
                                className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          {req.status === 'accepted' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleConfirmHandover(req._id, 'purchase')}
                                className="px-4 py-1.5 rounded-xl bg-accent hover:bg-accent/90 text-white text-xs font-bold transition-colors shadow-sm"
                              >
                                Confirm Handover
                              </button>
                              <button
                                onClick={() => handlePurchaseStatus(req._id, 'completed')}
                                className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors"
                              >
                                Complete Order
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                /* Sent purchases */
                sentPurchases.length === 0 ? (
                  <EmptyState
                    title="No purchase requests sent"
                    message="Browse books and click 'Request to Buy' to send an offer to a seller."
                    actionText="Explore Books"
                    actionLink="/explore"
                  />
                ) : (
                  <div className="space-y-4">
                    {sentPurchases.map((req) => (
                      <div
                        key={req._id}
                        className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <span className="text-xs font-semibold text-slate-500">
                            Seller: <strong className="text-slate-800">{req.seller?.name}</strong> • {req.seller?.college}
                          </span>
                          <div>{renderStatusBadge(req.status)}</div>
                        </div>

                        <div className="flex items-center gap-4">
                          <img
                            src={req.book?.images?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80'}
                            alt={req.book?.title}
                            className="w-14 h-18 object-cover rounded-xl border border-slate-200 shrink-0"
                          />
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{req.book?.title}</h4>
                            <p className="text-xs text-slate-500">by {req.book?.author}</p>
                            <p className="text-sm font-black text-primary mt-1">
                              Your Offer: ${req.offeredPrice || req.book?.price}
                            </p>
                          </div>
                        </div>

                        {req.status === 'accepted' && (
                          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            <span className="text-xs text-slate-500">
                              {req.handoverConfirmedByBuyer
                                ? '✓ You confirmed receiving the book'
                                : 'Waiting for your handover confirmation'}
                            </span>
                            {!req.handoverConfirmedByBuyer && (
                              <button
                                onClick={() => handleConfirmHandover(req._id, 'purchase')}
                                className="px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent/90 text-white text-xs font-bold transition-colors shadow-sm"
                              >
                                Confirm Book Received
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          {/* TAB 4: EXCHANGE REQUESTS */}
          {currentTab === 'exchanges' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">Exchange Requests</h2>
                  <p className="text-xs text-slate-500">Track book swap proposals sent and received</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
                  <button
                    onClick={() => setExchangeSubTab('received')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      exchangeSubTab === 'received'
                        ? 'bg-white text-primary shadow-xs'
                        : 'text-slate-600 hover:text-primary'
                    }`}
                  >
                    Received ({receivedExchanges.length})
                  </button>
                  <button
                    onClick={() => setExchangeSubTab('sent')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      exchangeSubTab === 'sent'
                        ? 'bg-white text-primary shadow-xs'
                        : 'text-slate-600 hover:text-primary'
                    }`}
                  >
                    Sent ({sentExchanges.length})
                  </button>
                </div>
              </div>

              {exchangeSubTab === 'received' ? (
                receivedExchanges.length === 0 ? (
                  <EmptyState
                    title="No exchange requests"
                    message="When a student offers to swap one of their books for yours, it will show up here."
                    actionText="Find Books to Swap"
                    actionLink="/exchange"
                  />
                ) : (
                  <div className="space-y-4">
                    {receivedExchanges.map((req) => (
                      <div
                        key={req._id}
                        className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <span className="text-xs font-semibold text-slate-500">
                            Proposal from: <strong className="text-slate-800">{req.requestedBy?.name}</strong> • {req.requestedBy?.college}
                          </span>
                          <div>{renderStatusBadge(req.status)}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-3.5 rounded-xl">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Your Book Requested</span>
                            <h5 className="font-bold text-sm text-slate-900 truncate">{req.bookRequested?.title}</h5>
                            <p className="text-xs text-slate-500">{req.bookRequested?.author}</p>
                          </div>
                          <div className="bg-slate-50 p-3.5 rounded-xl">
                            <span className="text-[10px] font-bold text-purple-600 uppercase">Book Offered to You</span>
                            <h5 className="font-bold text-sm text-slate-900 truncate">{req.bookOffered?.title}</h5>
                            <p className="text-xs text-slate-500">{req.bookOffered?.author}</p>
                          </div>
                        </div>

                        {req.message && (
                          <p className="text-xs bg-cream-50 text-slate-700 p-3 rounded-xl border border-cream-200/50">
                            <strong>Note: </strong> {req.message}
                          </p>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-1">
                          {req.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleExchangeStatus(req._id, 'accepted')}
                                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                              >
                                Accept Swap
                              </button>
                              <button
                                onClick={() => handleExchangeStatus(req._id, 'rejected')}
                                className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          {req.status === 'accepted' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleConfirmHandover(req._id, 'exchange')}
                                className="px-4 py-1.5 rounded-xl bg-accent hover:bg-accent/90 text-white text-xs font-bold transition-colors shadow-sm"
                              >
                                Confirm Handover
                              </button>
                              <button
                                onClick={() => handleExchangeStatus(req._id, 'completed')}
                                className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors"
                              >
                                Mark Completed
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                /* Sent Exchanges */
                sentExchanges.length === 0 ? (
                  <EmptyState
                    title="No exchange requests"
                    message="Browse books and click 'Exchange This Book' to initiate a trade."
                    actionText="Find Books to Swap"
                    actionLink="/exchange"
                  />
                ) : (
                  <div className="space-y-4">
                    {sentExchanges.map((req) => (
                      <div
                        key={req._id}
                        className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <span className="text-xs font-semibold text-slate-500">
                            Owner: <strong className="text-slate-800">{req.owner?.name}</strong> • {req.owner?.college}
                          </span>
                          <div>{renderStatusBadge(req.status)}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-3.5 rounded-xl">
                            <span className="text-[10px] font-bold text-accent uppercase">Book You Want</span>
                            <h5 className="font-bold text-sm text-slate-900 truncate">{req.bookRequested?.title}</h5>
                            <p className="text-xs text-slate-500">{req.bookRequested?.author}</p>
                          </div>
                          <div className="bg-slate-50 p-3.5 rounded-xl">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Book You Offered</span>
                            <h5 className="font-bold text-sm text-slate-900 truncate">{req.bookOffered?.title}</h5>
                            <p className="text-xs text-slate-500">{req.bookOffered?.author}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          {/* TAB 5: MESSAGES */}
          {currentTab === 'messages' && (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-soft text-center space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary flex items-center justify-center mx-auto">
                <MessageSquare className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Peer Chat & Campus Inquiries</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Coordinate meetups, ask book condition questions, and agree on meetup locations directly with fellow students.
              </p>
              <Link
                to="/messages"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary hover:bg-primary-light text-white text-xs sm:text-sm font-bold shadow-soft transition-all"
              >
                <span>Open Messenger</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* TAB 6: MY REVIEWS */}
          {currentTab === 'reviews' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">My Reviews & Ratings</h2>
                <p className="text-xs text-slate-500">Feedback from classmates after completed transactions</p>
              </div>

              {myReviews.length === 0 ? (
                <EmptyState
                  title="No reviews received yet"
                  message="Once you complete book exchanges or sales, other students will leave feedback on your profile."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myReviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={rev.reviewer?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                            alt={rev.reviewer?.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="font-bold text-xs text-slate-800">{rev.reviewer?.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400">
                          {[...Array(rev.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 italic">"{rev.comment}"</p>
                      <span className="text-[10px] text-slate-400 block">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: ACCOUNT SETTINGS */}
          {currentTab === 'settings' && (
            <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-soft space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">Account Settings</h2>
                <p className="text-xs text-slate-500">Update your student profile and contact details</p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                    className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">College / University</label>
                    <input
                      type="text"
                      value={profileForm.college}
                      onChange={(e) => setProfileForm({ ...profileForm, college: e.target.value })}
                      required
                      className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Campus / Location</label>
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City / Region</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      placeholder="e.g. Berkeley, CA"
                      className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reading Interests (comma-separated)</label>
                    <input
                      type="text"
                      value={profileForm.readingInterests}
                      onChange={(e) => setProfileForm({ ...profileForm, readingInterests: e.target.value })}
                      placeholder="e.g. Distributed Systems, Algorithms, Sci-Fi"
                      className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Favorite Genres (comma-separated)</label>
                    <input
                      type="text"
                      value={profileForm.favoriteCategories}
                      onChange={(e) => setProfileForm({ ...profileForm, favoriteCategories: e.target.value })}
                      placeholder="e.g. Computer Science, Novels, Mathematics"
                      className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Short Bio</label>
                  <textarea
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Tell campus book swappers a bit about your major and interests..."
                    className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="w-full py-3 rounded-xl bg-primary hover:bg-primary-light text-white text-xs sm:text-sm font-bold shadow-soft transition-colors"
                >
                  {updatingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
