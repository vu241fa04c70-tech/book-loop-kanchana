import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  MapPin,
  ArrowRightLeft,
  DollarSign,
  Gift,
  Eye,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const BookCard = ({ book, onWishlistChange, isSavedInitial = false }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [saving, setSaving] = useState(false);

  const fallbackImage =
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
  const coverImage =
    book.images && book.images.length > 0 ? book.images[0] : fallbackImage;

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast('Please sign in to save books to your wishlist', 'info');
      navigate('/login');
      return;
    }

    if (saving) return;
    setSaving(true);

    try {
      if (isSaved) {
        await api.delete(`/wishlist/${book._id}`);
        setIsSaved(false);
        showToast('Removed from wishlist', 'info');
      } else {
        await api.post(`/wishlist/${book._id}`);
        setIsSaved(true);
        showToast('Saved to your wishlist!', 'success');
      }
      if (onWishlistChange) onWishlistChange(book._id, !isSaved);
    } catch (err) {
      showToast('Could not update wishlist', 'error');
    } finally {
      setSaving(false);
    }
  };

  const discountPercent =
    book.originalPrice && book.originalPrice > book.price
      ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
      : null;

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-soft hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Top Media & Badges */}
      <Link to={`/books/${book._id}`} className="block relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={coverImage}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.src = fallbackImage;
          }}
        />

        {/* Listing Type & Sample Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span
            className={`px-2.5 py-1 text-xs font-bold rounded-lg shadow-sm backdrop-blur-md flex items-center gap-1 ${
              book.listingType === 'Donate'
                ? 'bg-emerald-600/95 text-white'
                : book.listingType === 'Exchange'
                ? 'bg-purple-600/95 text-white'
                : 'bg-primary/95 text-white'
            }`}
          >
            {book.listingType === 'Donate' && <Gift className="w-3 h-3" />}
            {book.listingType === 'Exchange' && <ArrowRightLeft className="w-3 h-3" />}
            {book.listingType === 'Sell' && <DollarSign className="w-3 h-3" />}
            {book.listingType === 'Donate'
              ? 'Free Donation'
              : book.listingType === 'Exchange'
              ? 'For Exchange'
              : 'For Sale'}
          </span>

          {discountPercent && book.listingType === 'Sell' && (
            <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-accent text-white shadow-xs w-fit">
              {discountPercent}% OFF
            </span>
          )}

          {book.isSample && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500 text-white shadow-xs w-fit flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Demo Sample
            </span>
          )}
        </div>

        {/* Wishlist Heart Icon */}
        <button
          onClick={toggleWishlist}
          disabled={saving}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all z-10 shadow-sm ${
            isSaved
              ? 'bg-rose-500 text-white shadow-rose-200'
              : 'bg-white/85 hover:bg-white text-slate-700 hover:text-rose-500'
          }`}
          title={isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Condition tag */}
        <div className="absolute bottom-2.5 left-3">
          <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-white/95 text-slate-800 shadow-xs backdrop-blur-xs">
            {book.condition}
          </span>
        </div>
      </Link>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold text-accent uppercase tracking-wider mb-1">
            <span className="truncate max-w-[170px]">{book.category}</span>
            {book.viewsCount > 0 && (
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Eye className="w-3 h-3" /> {book.viewsCount}
              </span>
            )}
          </div>

          <Link to={`/books/${book._id}`}>
            <h3 className="font-bold text-base text-slate-900 group-hover:text-primary transition-colors line-clamp-1 leading-snug">
              {book.title}
            </h3>
          </Link>

          <p className="text-xs text-slate-600 line-clamp-1 mt-0.5 font-medium">
            by {book.author}
          </p>

          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-2.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="truncate">{book.college}</span>
          </div>
        </div>

        {/* Price & Action Button Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            {book.listingType === 'Donate' ? (
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-emerald-600">FREE</span>
                {book.originalPrice > 0 && (
                  <span className="text-xs text-slate-400 line-through">
                    ${book.originalPrice}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-primary">
                  ${book.price}
                </span>
                {book.originalPrice > 0 && (
                  <span className="text-xs text-slate-400 line-through">
                    ${book.originalPrice}
                  </span>
                )}
              </div>
            )}
          </div>

          <Link
            to={`/books/${book._id}`}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-primary hover:text-white text-xs font-bold text-slate-800 transition-all duration-200 flex items-center gap-1"
          >
            <span>{book.listingType === 'Exchange' ? 'Swap' : book.listingType === 'Donate' ? 'Request' : 'View'}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
