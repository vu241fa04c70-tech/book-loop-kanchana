import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  BookOpen,
  ArrowRightLeft,
  DollarSign,
  Heart,
  History,
  User,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Star,
  ExternalLink,
  MessageSquare,
  Sparkles,
  TrendingUp,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BookCard from '../components/BookCard';
import EmptyState from '../components/EmptyState';

const DashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [myBooks, setMyBooks] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [sentExchanges, setSentExchanges] = useState([]);
  const [receivedExchanges, setReceivedExchanges] = useState([]);
  const [sentPurchases, setSentPurchases] = useState([]);
  const [receivedPurchases, setReceivedPurchases] = useState([]);

  // Sub-tabs
  const [exchangeSubTab, setExchangeSubTab] = useState('received');
  const [purchaseSubTab, setPurchaseSubTab] = useState('received');

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
    bio: user?.bio || ''
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        college: user.college || '',
        location: user.location || '',
        bio: user.bio || ''
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

      if (booksRes.data.success) setMyBooks(booksRes.data.books);
      if (wishRes.data.success) setWishlist(wishRes.data.wishlist);
      if (sentExRes.data.success) setSentExchanges(sentExRes.data.exchanges);
      if (recExRes.data.success) setReceivedExchanges(recExRes.data.exchanges);
      if (sentPurRes.data.success) setSentPurchases(sentPurRes.data.purchases);
      if (recPurRes.data.success) setReceivedPurchases(recPurRes.data.purchases);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      showToast('Could not load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const setTab = (tabName) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tabName);
    setSearchParams(newParams);
  };

  // Status updates
  const handleUpdateExchangeStatus = async (exchangeId, newStatus) => {
    try {
      const res = await api.put(`/exchanges/${exchangeId}/status`, { status: newStatus });
      if (res.data.success) {
        showToast(`Exchange request marked as ${newStatus}`, 'success');
        fetchDashboardData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating request', 'error');
    }
  };

  const handleUpdatePurchaseStatus = async (purchaseId, newStatus) => {
    try {
      const res = await api.put(`/purchases/${purchaseId}/status`, { status: newStatus });
      if (res.data.success) {
        showToast(`Purchase request marked as ${newStatus}`, 'success');
        fetchDashboardData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating request', 'error');
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book listing?')) return;
    try {
      const res = await api.delete(`/books/${bookId}`);
      if (res.data.success) {
        showToast('Book listing deleted', 'info');
        setMyBooks((prev) => prev.filter((b) => b._id !== bookId));
      }
    } catch (err) {
      showToast('Failed to delete book listing', 'error');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    await updateProfile(profileForm);
    setUpdatingProfile(false);
  };

  // Review submission
  const openReviewModal = (tx, type) => {
    const targetUserId =
      type === 'exchange'
        ? (tx.requestedBy._id || tx.requestedBy).toString() === user._id.toString()
          ? (tx.owner._id || tx.owner)
          : (tx.requestedBy._id || tx.requestedBy)
        : (tx.buyer._id || tx.buyer).toString() === user._id.toString()
        ? (tx.seller._id || tx.seller)
        : (tx.buyer._id || tx.buyer);

    setReviewTarget({
      transactionId: tx._id,
      transactionType: type,
      targetUserId: typeof targetUserId === 'object' ? targetUserId._id : targetUserId
    });
    setReviewRating(5);
    setReviewComment('');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewTarget || !reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        reviewedUserId: reviewTarget.targetUserId,
        transactionType: reviewTarget.transactionType,
        transactionId: reviewTarget.transactionId,
        rating: reviewRating,
        comment: reviewComment
      });

      if (res.data.success) {
        showToast('Review submitted successfully!', 'success');
        setShowReviewModal(false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Calculations for overview stats
  const activeListings = myBooks.filter((b) => b.availability === 'available').length;
  const pendingReceivedExchanges = receivedExchanges.filter((e) => e.status === 'pending').length;
  const pendingReceivedPurchases = receivedPurchases.filter((p) => p.status === 'pending').length;

  const completedTransactions = [
    ...sentExchanges.filter((e) => e.status === 'completed'),
    ...receivedExchanges.filter((e) => e.status === 'completed'),
    ...sentPurchases.filter((p) => p.status === 'completed'),
    ...receivedPurchases.filter((p) => p.status === 'completed')
  ];

  // Recharts activity data
  const chartActivityData = [
    { name: 'Mon', exchanges: 1, purchases: 2 },
    { name: 'Tue', exchanges: 2, purchases: 1 },
    { name: 'Wed', exchanges: 3, purchases: 4 },
    { name: 'Thu', exchanges: 2, purchases: 2 },
    { name: 'Fri', exchanges: 4, purchases: 3 },
    { name: 'Sat', exchanges: 5, purchases: 4 },
    { name: 'Sun', exchanges: 2, purchases: 1 }
  ];

  const pieData = [
    { name: 'Active Listed', value: activeListings || 1, color: '#243B53' },
    { name: 'Completed Swaps', value: completedTransactions.length || 1, color: '#F4A261' },
    { name: 'Wishlist Items', value: wishlist.length || 1, color: '#10B981' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'my-listings', label: 'My Listed Books', icon: BookOpen, count: myBooks.length },
    { id: 'exchanges', label: 'Exchange Requests', icon: ArrowRightLeft, count: pendingReceivedExchanges },
    { id: 'purchases', label: 'Purchase Requests', icon: DollarSign, count: pendingReceivedPurchases },
    { id: 'wishlist', label: 'Saved Wishlist', icon: Heart, count: wishlist.length },
    { id: 'history', label: 'Transaction History', icon: History },
    { id: 'profile', label: 'Profile Settings', icon: User }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner Profile Summary */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-primary tracking-tight">{user?.name}</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-accent/20 text-accent uppercase">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{user?.college} • {user?.location}</p>
            <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/add-book"
            className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-soft transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List Another Book</span>
          </Link>
          <Link
            to="/explore"
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
          >
            Explore Books
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-accent text-white' : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: 1. Overview */}
      {currentTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Total Uploaded Books
              </span>
              <span className="text-3xl font-black text-primary mt-1 block">
                {myBooks.length}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 mt-1 block">
                {activeListings} Active Listings
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Exchange Requests
              </span>
              <span className="text-3xl font-black text-purple-600 mt-1 block">
                {receivedExchanges.length}
              </span>
              <span className="text-[11px] font-bold text-purple-700 mt-1 block">
                {pendingReceivedExchanges} Pending Attention
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Purchase Requests
              </span>
              <span className="text-3xl font-black text-accent mt-1 block">
                {receivedPurchases.length}
              </span>
              <span className="text-[11px] font-bold text-amber-700 mt-1 block">
                {pendingReceivedPurchases} Pending Attention
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Completed Deals
              </span>
              <span className="text-3xl font-black text-emerald-600 mt-1 block">
                {completedTransactions.length}
              </span>
              <span className="text-[11px] font-bold text-slate-500 mt-1 block">
                Verified Campus Swaps
              </span>
            </div>
          </div>

          {/* Recharts Activity & Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Weekly Interaction Activity</h3>
                  <p className="text-xs text-slate-400">Swaps and purchase inquiries over the past 7 days</p>
                </div>
                <span className="text-xs font-bold text-accent bg-amber-50 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>
              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartActivityData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="exchanges" fill="#8B5CF6" name="Exchanges" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="purchases" fill="#F4A261" name="Purchases" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Listing Distribution</h3>
                <p className="text-xs text-slate-400">Books, swaps, and wishlist portfolio</p>
              </div>
              <div className="h-48 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                      {d.name}
                    </span>
                    <span className="font-bold text-slate-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. My Listed Books */}
      {currentTab === 'my-listings' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-primary">My Listed Books ({myBooks.length})</h2>
            <Link
              to="/add-book"
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" /> List New Book
            </Link>
          </div>

          {myBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myBooks.map((book) => (
                <div
                  key={book._id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative aspect-[16/9] bg-slate-100">
                    <img
                      src={book.images?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-2 py-0.5 text-[11px] font-bold rounded-md bg-white/90 text-slate-800">
                      {book.listingType}
                    </span>
                    <span className="absolute top-3 right-3 px-2 py-0.5 text-[11px] font-bold rounded-md bg-slate-900/80 text-white capitalize">
                      {book.availability}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                        {book.category}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{book.title}</h4>
                      <p className="text-xs text-slate-500 font-medium">by {book.author}</p>
                      <p className="text-base font-black text-primary mt-1">
                        {book.listingType === 'Donate' ? 'FREE' : `$${book.price}`}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <Link
                        to={`/books/${book._id}`}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> View
                      </Link>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/edit-book/${book._id}`}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                          title="Edit Listing"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteBook(book._id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="You haven't listed any books yet"
              description="Have extra textbooks from past courses? List them on BookLoop to earn money or swap with peers."
              actionLabel="List Your First Book"
              actionLink="/add-book"
            />
          )}
        </div>
      )}

      {/* TAB CONTENT: 3. Exchange Requests */}
      {currentTab === 'exchanges' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-primary">Book Exchange Proposals</h2>
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setExchangeSubTab('received')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  exchangeSubTab === 'received'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Received ({receivedExchanges.length})
              </button>
              <button
                onClick={() => setExchangeSubTab('sent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  exchangeSubTab === 'sent'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sent ({sentExchanges.length})
              </button>
            </div>
          </div>

          {/* List of exchanges */}
          {exchangeSubTab === 'received' ? (
            receivedExchanges.length > 0 ? (
              <div className="space-y-4">
                {receivedExchanges.map((ex) => (
                  <div
                    key={ex._id}
                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            ex.requestedBy?.profileImage ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                          }
                          alt=""
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{ex.requestedBy?.name}</p>
                          <p className="text-[11px] text-slate-500">{ex.requestedBy?.college}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-extrabold capitalize w-fit ${
                          ex.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : ex.status === 'accepted'
                            ? 'bg-purple-100 text-purple-800'
                            : ex.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        ● {ex.status}
                      </span>
                    </div>

                    {/* Trade Matchup Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* What they offer */}
                      <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                          Offered in Trade:
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                          {ex.bookOffered?.title}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          by {ex.bookOffered?.author} • Condition: {ex.bookOffered?.condition}
                        </p>
                      </div>

                      {/* Your book */}
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Your Requested Book:
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                          {ex.bookRequested?.title}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          by {ex.bookRequested?.author} • Value: ${ex.bookRequested?.price}
                        </p>
                      </div>
                    </div>

                    {ex.message && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl italic">
                        "{ex.message}"
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <Link
                        to={`/messages?user=${ex.requestedBy?._id}&book=${ex.bookRequested?._id}`}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Chat with Student
                      </Link>

                      <div className="flex items-center gap-2">
                        {ex.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateExchangeStatus(ex._id, 'accepted')}
                              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl"
                            >
                              Accept Proposal
                            </button>
                            <button
                              onClick={() => handleUpdateExchangeStatus(ex._id, 'rejected')}
                              className="px-4 py-1.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {ex.status === 'accepted' && (
                          <button
                            onClick={() => handleUpdateExchangeStatus(ex._id, 'completed')}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                          >
                            Mark as Swapped & Completed
                          </button>
                        )}
                        {ex.status === 'completed' && (
                          <button
                            onClick={() => openReviewModal(ex, 'exchange')}
                            className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs font-bold flex items-center gap-1"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" /> Leave Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No exchange proposals received yet"
                description="When other students request to swap books with you, their proposals will appear here."
                actionLabel="Explore Books to Swap"
                actionLink="/explore?listingType=Exchange"
              />
            )
          ) : sentExchanges.length > 0 ? (
            <div className="space-y-4">
              {sentExchanges.map((ex) => (
                <div
                  key={ex._id}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-800">
                      Owner: {ex.owner?.name} ({ex.owner?.college})
                    </p>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                        ex.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : ex.status === 'accepted'
                          ? 'bg-purple-100 text-purple-800'
                          : ex.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ex.status}
                    </span>
                  </div>
                  <div className="text-xs space-y-1">
                    <p>
                      <span className="font-semibold text-slate-500">You offered:</span>{' '}
                      <span className="font-bold text-slate-900">{ex.bookOffered?.title}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-slate-500">Requested from owner:</span>{' '}
                      <span className="font-bold text-slate-900">{ex.bookRequested?.title}</span>
                    </p>
                  </div>
                  {ex.status === 'completed' && (
                    <div className="pt-2">
                      <button
                        onClick={() => openReviewModal(ex, 'exchange')}
                        className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold rounded-lg flex items-center gap-1"
                      >
                        <Star className="w-3 h-3 fill-current" /> Review Owner
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="You haven't requested any exchanges yet"
              description="Explore books listed for exchange and send your first trade proposal."
              actionLabel="Explore Exchange Listings"
              actionLink="/explore?listingType=Exchange"
            />
          )}
        </div>
      )}

      {/* TAB CONTENT: 4. Purchase Requests */}
      {currentTab === 'purchases' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-primary">Student Purchase Requests</h2>
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setPurchaseSubTab('received')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  purchaseSubTab === 'received'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Received ({receivedPurchases.length})
              </button>
              <button
                onClick={() => setPurchaseSubTab('sent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  purchaseSubTab === 'sent'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sent ({sentPurchases.length})
              </button>
            </div>
          </div>

          {purchaseSubTab === 'received' ? (
            receivedPurchases.length > 0 ? (
              <div className="space-y-4">
                {receivedPurchases.map((pur) => (
                  <div
                    key={pur._id}
                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{pur.buyer?.name}</p>
                        <p className="text-[11px] text-slate-500">{pur.buyer?.college}</p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                          pur.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : pur.status === 'accepted'
                            ? 'bg-blue-100 text-blue-800'
                            : pur.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {pur.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{pur.book?.title}</h4>
                        <p className="text-xs text-slate-500">Offered Price: ${pur.offeredPrice}</p>
                      </div>
                      <span className="text-lg font-black text-primary">${pur.offeredPrice}</span>
                    </div>

                    {pur.message && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl italic">
                        "{pur.message}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <Link
                        to={`/messages?user=${pur.buyer?._id}&book=${pur.book?._id}`}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Message Buyer
                      </Link>

                      <div className="flex items-center gap-2">
                        {pur.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdatePurchaseStatus(pur._id, 'accepted')}
                              className="px-4 py-1.5 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-xl"
                            >
                              Accept Offer
                            </button>
                            <button
                              onClick={() => handleUpdatePurchaseStatus(pur._id, 'rejected')}
                              className="px-4 py-1.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {pur.status === 'accepted' && (
                          <button
                            onClick={() => handleUpdatePurchaseStatus(pur._id, 'completed')}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                          >
                            Mark Deal Completed
                          </button>
                        )}
                        {pur.status === 'completed' && (
                          <button
                            onClick={() => openReviewModal(pur, 'purchase')}
                            className="px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl flex items-center gap-1"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" /> Review Buyer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No purchase requests received"
                description="Requests from students wanting to buy your textbooks will appear here."
              />
            )
          ) : sentPurchases.length > 0 ? (
            <div className="space-y-4">
              {sentPurchases.map((pur) => (
                <div
                  key={pur._id}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{pur.book?.title}</h4>
                      <p className="text-xs text-slate-500">Seller: {pur.seller?.name} • Offered: ${pur.offeredPrice}</p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                        pur.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : pur.status === 'accepted'
                          ? 'bg-blue-100 text-blue-800'
                          : pur.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {pur.status}
                    </span>
                  </div>
                  {pur.status === 'completed' && (
                    <button
                      onClick={() => openReviewModal(pur, 'purchase')}
                      className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold rounded-lg flex items-center gap-1"
                    >
                      <Star className="w-3 h-3 fill-current" /> Review Seller
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No purchase requests sent"
              description="Browse the marketplace and submit an offer for a book you need."
              actionLabel="Explore Books to Buy"
              actionLink="/explore?listingType=Sell"
            />
          )}
        </div>
      )}

      {/* TAB CONTENT: 5. Saved Wishlist */}
      {currentTab === 'wishlist' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <h2 className="text-xl font-black text-primary">Saved Books ({wishlist.length})</h2>
          {wishlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlist.map((book) => (
                <BookCard
                  key={book._id}
                  book={book}
                  isSavedInitial={true}
                  onWishlistChange={(bId, isSaved) => {
                    if (!isSaved) setWishlist((prev) => prev.filter((b) => b._id !== bId));
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Your wishlist is empty"
              description="Save textbooks you are interested in tracking or purchasing later."
              actionLabel="Explore Books"
              actionLink="/explore"
            />
          )}
        </div>
      )}

      {/* TAB CONTENT: 6. Transaction History */}
      {currentTab === 'history' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <h2 className="text-xl font-black text-primary">Transaction History</h2>
          {completedTransactions.length > 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
              <div className="divide-y divide-slate-100">
                {completedTransactions.map((tx, i) => (
                  <div key={i} className="p-5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                          Completed
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">
                          {tx.completedAt ? new Date(tx.completedAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">
                        {tx.book?.title || tx.bookRequested?.title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {tx.offeredPrice !== undefined
                          ? `Purchase transaction: $${tx.offeredPrice}`
                          : `Book Swap: ${tx.bookOffered?.title}`}
                      </p>
                    </div>

                    <button
                      onClick={() => openReviewModal(tx, tx.offeredPrice !== undefined ? 'purchase' : 'exchange')}
                      className="px-3.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                      <span>Leave Review</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No completed transactions yet"
              description="Completed textbook swaps and purchases will be archived here for review and record."
            />
          )}
        </div>
      )}

      {/* TAB CONTENT: 7. Profile Settings */}
      {currentTab === 'profile' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-soft max-w-2xl space-y-6 animate-in fade-in duration-150">
          <div>
            <h2 className="text-xl font-black text-primary">Student Profile & Settings</h2>
            <p className="text-xs text-slate-500 mt-1">
              Keep your campus details and contact information up to date for smooth swaps.
            </p>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  College / University
                </label>
                <input
                  type="text"
                  value={profileForm.college}
                  onChange={(e) => setProfileForm({ ...profileForm, college: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                City / Campus Location
              </label>
              <input
                type="text"
                value={profileForm.location}
                onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Bio / About Me
              </label>
              <textarea
                rows="3"
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
              ></textarea>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={updatingProfile}
                className="px-6 py-2.5 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-xl shadow-soft transition-all"
              >
                {updatingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- REVIEW SUBMISSION MODAL --- */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Submit Experience Review</span>
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Rating:
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-2xl transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-2">
                    {reviewRating} of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Written Feedback / Comment:
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="Share details about the meetup, condition of the book, and communication..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-soft transition-all"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
