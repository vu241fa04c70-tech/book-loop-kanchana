import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  MapPin,
  GraduationCap,
  Calendar,
  Star,
  BookOpen,
  MessageSquare,
  AlertTriangle,
  Ban,
  Tag,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import BookCard from '../components/BookCard';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function UserProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [activeListings, setActiveListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blocking, setBlocking] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/auth/users/${id}/profile`);
      if (res.data.success) {
        setProfile(res.data.user);
        setActiveListings(res.data.activeListings || []);
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      showToast('Could not load reader profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async () => {
    if (!currentUser) {
      showToast('Please log in to manage blocked users', 'error');
      return;
    }
    setBlocking(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/auth/users/${id}/block`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (res.data.success) {
        setIsBlocked(res.data.isBlocked);
        showToast(res.data.message, 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setBlocking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading reader profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Reader Profile Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">The user you are looking for may have moved or closed their account.</p>
        <Link to="/explore" className="bg-navy text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
          Explore Books
        </Link>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser._id === profile._id;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-5">
              <img
                src={
                  profile.profileImage ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
                }
                alt={profile.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-slate-100 shadow-sm"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-extrabold text-slate-900">{profile.name}</h1>
                  {profile.isVerified && (
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Student
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  {profile.college && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      {profile.college}
                    </span>
                  )}
                  {(profile.city || profile.location) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {profile.city || profile.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Member since {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Rating summary */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-xs font-bold ml-1 text-slate-800">
                      {profile.rating ? profile.rating.toFixed(1) : '5.0'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">({profile.reviewCount || reviews.length} verified reviews)</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {!isOwnProfile && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  to="/messages"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-accent hover:bg-accent/90 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
                >
                  <MessageSquare className="w-4 h-4" /> Message
                </Link>
                <button
                  onClick={handleToggleBlock}
                  disabled={blocking}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2.5 rounded-xl border transition-all ${
                    isBlocked
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Block this user"
                >
                  <Ban className="w-3.5 h-3.5" />
                  {isBlocked ? 'Blocked' : 'Block User'}
                </button>
              </div>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">About Reader</h3>
              <p className="text-slate-700 text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Reading Interests & Categories */}
          {(profile.readingInterests?.length > 0 || profile.favoriteCategories?.length > 0) && (
            <div className="pt-5 border-t border-slate-100 mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.readingInterests?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-600 mb-2">Reading Interests</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.readingInterests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {profile.favoriteCategories?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-600 mb-2">Favorite Genres</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.favoriteCategories.map((cat, idx) => (
                      <span
                        key={idx}
                        className="bg-orange-50 text-accent text-xs px-2.5 py-1 rounded-lg font-semibold border border-orange-100"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active Book Listings */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Active Listings ({activeListings.length})</h2>
              <p className="text-xs text-slate-500">Books currently available for purchase or exchange from this reader.</p>
            </div>
          </div>

          {activeListings.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No active books currently listed</p>
              <p className="text-xs text-slate-400 mt-1">Check back later or message this reader.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {activeListings.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Student Reviews ({reviews.length})</h2>
              <p className="text-xs text-slate-500">Feedback from readers who have completed transactions.</p>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
              <Star className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No reviews yet</p>
              <p className="text-xs text-slate-400 mt-1">Reviews will appear after completed book handovers.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div key={rev._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          rev.buyer?.profileImage ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
                        }
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="font-bold text-xs text-slate-800">{rev.buyer?.name || 'Verified Buyer'}</span>
                    </div>
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
                  <span className="text-[10px] text-slate-400 block mt-2">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
