import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  BookOpen,
  DollarSign,
  ArrowRightLeft,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Star,
  Search,
  Filter,
  TrendingUp,
  RefreshCw,
  ExternalLink
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
import EmptyState from '../components/EmptyState';

const AdminPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('statistics');
  const [loading, setLoading] = useState(true);

  // Data states
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [booksList, setBooksList] = useState([]);
  const [transactions, setTransactions] = useState({ purchases: [], exchanges: [] });

  // Filtering states
  const [userSearch, setUserSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, booksRes, txRes] = await Promise.all([
        api.get('/admin/statistics'),
        api.get('/admin/users'),
        api.get('/admin/books'),
        api.get('/admin/transactions')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (usersRes.data.success) setUsersList(usersRes.data.users);
      if (booksRes.data.success) setBooksList(booksRes.data.books);
      if (txRes.data.success) setTransactions(txRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      showToast('Could not load administrative data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    try {
      const res = await api.put(`/admin/users/${userId}`, { role: newRole });
      if (res.data.success) {
        showToast(`User role updated to ${newRole}`, 'success');
        setUsersList((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      showToast('Error modifying user role', 'error');
    }
  };

  const handleRemoveBookListing = async (bookId) => {
    if (!window.confirm('Are you sure you want to remove this listing for content policy violation?')) return;
    try {
      const res = await api.delete(`/admin/books/${bookId}`);
      if (res.data.success) {
        showToast('Listing removed by administrator', 'info');
        setBooksList((prev) => prev.filter((b) => b._id !== bookId));
      }
    } catch (err) {
      showToast('Failed to remove listing', 'error');
    }
  };

  const handleToggleFeature = async (bookId) => {
    try {
      const res = await api.put(`/admin/books/${bookId}/feature`);
      if (res.data.success) {
        setBooksList((prev) =>
          prev.map((b) => (b._id === bookId ? { ...b, featured: res.data.featured } : b))
        );
        showToast('Listing spotlight status updated', 'success');
      }
    } catch (err) {
      showToast('Failed to update spotlight status', 'error');
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.college?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredBooks = booksList.filter(
    (b) =>
      b.title?.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.author?.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.college?.toLowerCase().includes(bookSearch.toLowerCase())
  );

  const COLORS = ['#243B53', '#F4A261', '#10B981', '#8B5CF6', '#EC4899', '#3B82F6'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-accent flex items-center justify-center">
            <Shield className="w-6 h-6 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight">BookLoop Admin Portal</h1>
              <span className="px-2 py-0.5 rounded-md bg-accent text-white text-[10px] font-extrabold uppercase">
                Staff Only
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Moderation, platform statistics, user roles, and transaction oversight.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 transition-colors w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'statistics', label: 'Platform Metrics & Charts', icon: TrendingUp },
          { id: 'users', label: `Users (${usersList.length})`, icon: Users },
          { id: 'books', label: `All Books (${booksList.length})`, icon: BookOpen },
          { id: 'transactions', label: 'Live Transactions Oversight', icon: ArrowRightLeft }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Statistics & Charts */}
      {activeTab === 'statistics' && stats && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Registered Students
              </span>
              <span className="text-3xl font-black text-primary mt-1 block">
                {stats.totalUsers}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 mt-1 block">
                Verified Student Accounts
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Total Book Listings
              </span>
              <span className="text-3xl font-black text-primary mt-1 block">
                {stats.totalBooks}
              </span>
              <span className="text-[11px] font-bold text-accent mt-1 block">
                {stats.activeListings} Active In Market
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Completed Deals
              </span>
              <span className="text-3xl font-black text-emerald-600 mt-1 block">
                {stats.completedExchanges + stats.completedPurchases}
              </span>
              <span className="text-[11px] font-bold text-slate-500 mt-1 block">
                {stats.completedExchanges} Swaps • {stats.completedPurchases} Purchases
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Total Student Savings
              </span>
              <span className="text-3xl font-black text-accent mt-1 block">
                ${stats.estimatedTotalSavings}+
              </span>
              <span className="text-[11px] font-bold text-emerald-600 mt-1 block">
                Calculated vs Bookstore Retail
              </span>
            </div>
          </div>

          {/* Recharts Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Book Distribution by Category</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.categoryDistribution || []}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} interval={0} angle={-15} textAnchor="end" height={50} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#243B53" radius={[4, 4, 0, 0]} name="Books" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Listing Type Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Listings by Transaction Type</h3>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.listingTypeDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {(stats.listingTypeDistribution || []).map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-600 pt-2">
                {(stats.listingTypeDistribution || []).map((t, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                    {t.name}: {t.count}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Users Moderation */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-black text-lg text-primary">Platform User Directory</h3>
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search user by name, email, or college..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">College</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={u.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{u.college}</td>
                    <td className="py-3 px-4 text-slate-500">{u.location}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-primary-50 text-primary'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u._id !== user._id && (
                        <button
                          onClick={() => handleRoleToggle(u._id, u.role)}
                          className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px]"
                        >
                          Toggle {u.role === 'admin' ? 'Student' : 'Admin'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Books Moderation */}
      {activeTab === 'books' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-black text-lg text-primary">All Book Listings</h3>
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search listing by title or author..."
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Book</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price / Type</th>
                  <th className="py-3 px-4">Campus</th>
                  <th className="py-3 px-4">Spotlight</th>
                  <th className="py-3 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBooks.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 max-w-xs">
                        <img
                          src={b.images?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=100&q=80'}
                          alt=""
                          className="w-8 h-10 object-cover rounded-md flex-shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-bold text-slate-900 truncate">{b.title}</p>
                          <p className="text-[11px] text-slate-400 truncate">by {b.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{b.category}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-primary">
                        {b.listingType === 'Donate' ? 'FREE' : `$${b.price}`}
                      </span>{' '}
                      <span className="text-[10px] text-slate-400">({b.listingType})</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{b.college}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleFeature(b._id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.featured
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {b.featured ? '★ Featured' : '☆ Normal'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        to={`/books/${b._id}`}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleRemoveBookListing(b._id)}
                        className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Transactions Oversight */}
      {activeTab === 'transactions' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 space-y-4">
            <h3 className="font-black text-lg text-primary">
              Recent Purchase Inquiries ({transactions.purchases.length})
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {transactions.purchases.map((p) => (
                <div key={p._id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">
                      Buyer: {p.buyer?.name} ({p.buyer?.college}) → Seller: {p.seller?.name}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Book: {p.book?.title} • Offered: ${p.offeredPrice}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                      p.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'accepted'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 space-y-4">
            <h3 className="font-black text-lg text-primary">
              Recent Exchange Proposals ({transactions.exchanges.length})
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {transactions.exchanges.map((ex) => (
                <div key={ex._id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">
                      From: {ex.requestedBy?.name} ({ex.requestedBy?.college}) → Owner: {ex.owner?.name}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Trade: "{ex.bookOffered?.title}" for "{ex.bookRequested?.title}"
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                      ex.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ex.status === 'accepted'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ex.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
