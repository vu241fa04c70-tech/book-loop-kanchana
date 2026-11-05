import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  DollarSign,
  Tag,
  GraduationCap
} from 'lucide-react';
import api from '../services/api';
import BookCard from '../components/BookCard';
import { BookGridSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search and Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [listingType, setListingType] = useState(searchParams.get('listingType') || 'All');
  const [condition, setCondition] = useState(searchParams.get('condition') || 'All');
  const [college, setCollege] = useState(searchParams.get('college') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'latest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Data states
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const categories = [
    'All',
    'Computer Science',
    'Engineering',
    'Medicine & Health',
    'Business & Economics',
    'Law',
    'Sciences',
    'Mathematics',
    'Literature & Fiction',
    'Social Sciences',
    'Exam Preparation',
    'General Non-Fiction',
    'Other'
  ];

  const conditions = ['All', 'Like New', 'Good', 'Fair', 'Poor'];
  const listingTypes = ['All', 'Sell', 'Exchange', 'Donate'];

  const colleges = [
    'All',
    'Stanford University',
    'UC Berkeley',
    'Columbia University',
    'MIT',
    'Harvard University',
    'UCLA',
    'University of Washington',
    'NYU'
  ];

  // Fetch books whenever filters change
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set('search', search.trim());
        if (category !== 'All') params.set('category', category);
        if (listingType !== 'All') params.set('listingType', listingType);
        if (condition !== 'All') params.set('condition', condition);
        if (college !== 'All') params.set('college', college);
        if (minPrice !== '') params.set('minPrice', minPrice);
        if (maxPrice !== '') params.set('maxPrice', maxPrice);
        if (sort) params.set('sort', sort);
        params.set('page', page.toString());
        params.set('limit', '12');

        const res = await api.get(`/books?${params.toString()}`);
        if (res.data.success) {
          setBooks(res.data.books);
          setTotal(res.data.total);
          setTotalPages(res.data.totalPages || 1);
        }
      } catch (err) {
        console.error('Error fetching books:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [search, category, listingType, condition, college, minPrice, maxPrice, sort, page]);

  // Sync to URL parameters
  const updateFilterParam = (key, val) => {
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (!val || val === 'All') {
      newParams.delete(key);
    } else {
      newParams.set(key, val);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const resetAllFilters = () => {
    setSearch('');
    setCategory('All');
    setListingType('All');
    setCondition('All');
    setCollege('All');
    setMinPrice('');
    setMaxPrice('');
    setSort('latest');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Search */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-primary tracking-tight">Explore Campus Books</h1>
            <p className="text-sm text-slate-500 mt-1">
              Showing <span className="font-bold text-slate-800">{total}</span> books available for
              purchase, swap, or free donation.
            </p>
          </div>

          {/* Quick search input */}
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by title, author, or keyword..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                updateFilterParam('search', e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
            />
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                updateFilterParam('category', cat);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-primary text-white shadow-soft'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid & Filters Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-accent" /> Filters
              </span>
              <button
                onClick={resetAllFilters}
                className="text-xs text-rose-600 hover:underline font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Listing Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Listing Type
              </label>
              <div className="space-y-1.5">
                {listingTypes.map((type) => (
                  <label
                    key={type}
                    className="flex items-center justify-between p-2 rounded-xl text-xs font-medium cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="listingType"
                        checked={listingType === type}
                        onChange={() => {
                          setListingType(type);
                          updateFilterParam('listingType', type);
                        }}
                        className="text-accent focus:ring-accent"
                      />
                      <span className={listingType === type ? 'font-bold text-slate-900' : 'text-slate-600'}>
                        {type === 'Donate' ? 'Free Donation' : type}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Book Condition
              </label>
              <div className="space-y-1.5">
                {conditions.map((cond) => (
                  <label
                    key={cond}
                    className="flex items-center gap-2 p-2 rounded-xl text-xs font-medium cursor-pointer hover:bg-slate-50"
                  >
                    <input
                      type="radio"
                      name="condition"
                      checked={condition === cond}
                      onChange={() => {
                        setCondition(cond);
                        updateFilterParam('condition', cond);
                      }}
                      className="text-accent focus:ring-accent"
                    />
                    <span className={condition === cond ? 'font-bold text-slate-900' : 'text-slate-600'}>
                      {cond}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Price Range ($)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    updateFilterParam('minPrice', e.target.value);
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    updateFilterParam('maxPrice', e.target.value);
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            {/* University / College Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                University Campus
              </label>
              <select
                value={college}
                onChange={(e) => {
                  setCollege(e.target.value);
                  updateFilterParam('college', e.target.value);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700"
              >
                {colleges.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* Books Results Column */}
        <main className="lg:col-span-3 space-y-6">
          {/* Top Sort & Mobile Filter Toggle Bar */}
          <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-100 shadow-soft flex items-center justify-between">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl"
            >
              <Filter className="w-3.5 h-3.5 text-accent" />
              <span>Filters</span>
            </button>

            <div className="flex items-center gap-2 ml-auto text-xs font-medium text-slate-500">
              <span className="hidden sm:inline">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  updateFilterParam('sort', e.target.value);
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:outline-none text-xs"
              >
                <option value="latest">Latest Additions</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="views">Most Viewed</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Book Cards Grid */}
          {loading ? (
            <BookGridSkeleton count={9} />
          ) : books.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {books.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No books match your criteria"
              description="Try adjusting your filters, clearing price constraints, or searching with broader keywords."
              actionLabel="Reset All Filters"
              actionLink="#"
            />
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                disabled={page <= 1}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold text-slate-700 px-4">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ExplorePage;
